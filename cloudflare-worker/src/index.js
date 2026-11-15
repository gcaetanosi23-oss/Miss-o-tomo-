const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGIN || "";
  return {
    "Access-Control-Allow-Origin": origin === allowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...cors, "Cache-Control": "no-store" }
  });
}

function b64url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function verifyToken(token, secret) {
  if (typeof token !== "string" || !token || typeof secret !== "string" || !secret || token.length > 4096) return null;

  const parts = token.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;

  try {
    const decodeBase64Url = value => {
      const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
      const binary = atob(base64);
      return Uint8Array.from(binary, char => char.charCodeAt(0));
    };

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signatureValid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(parts[1]),
      new TextEncoder().encode(parts[0])
    );
    if (!signatureValid) return null;

    const payloadBytes = decodeBase64Url(parts[0]);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

    const now = Math.floor(Date.now() / 1000);
    const maxSessionSeconds = 4 * 60 * 60;
    const clockSkewSeconds = 60;

    if (typeof payload.sub !== "string" || !payload.sub.trim() || payload.sub.length > 100 ||
        typeof payload.login !== "string" || !/^[a-z0-9-]{1,39}$/i.test(payload.login) ||
        !Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp) ||
        payload.iat > now + clockSkewSeconds ||
        payload.exp <= now ||
        payload.exp <= payload.iat ||
        payload.exp - payload.iat > maxSessionSeconds) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function issueToken(payload, secret) {
  const encoded = b64url(JSON.stringify(payload));
  return encoded + "." + await sign(encoded, secret);
}

async function sha256(value) {
  return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

function allowedTeachers(env) {
  return (env.ALLOWED_TEACHERS || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}

function validText(value, max, required = false) {
  return typeof value === "string" && value.length <= max && (!required || value.trim().length > 0);
}

// Formato canônico das respostas:
// multiple_choice: options = 2..10 textos; correct_answer = índice (base zero).
// true_false: options = []; correct_answer = boolean.
// short_answer: options = []; correct_answer = texto ou lista de textos aceitos.
function validateQuestionData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "Dados da questão inválidos.";
  const types = ["multiple_choice", "true_false", "short_answer"];
  const difficulties = ["easy", "medium", "hard"];
  const statuses = ["draft", "published", "archived"];

  if (!validText(data.title, 160, true) ||
      !validText(data.statement_md, 12000, true) ||
      !types.includes(data.question_type) ||
      !validText(data.subject, 80, true) ||
      (data.topic !== null && !validText(data.topic, 120)) ||
      (data.explanation_md !== null && !validText(data.explanation_md, 8000)) ||
      !difficulties.includes(data.difficulty) ||
      !statuses.includes(data.status)) {
    return "Revise título, enunciado, disciplina, tópico, explicação e classificações.";
  }

  if (!Array.isArray(data.options) || data.options.length > 10 ||
      !data.options.every(option => validText(option, 500, true))) {
    return "As alternativas devem ser textos de até 500 caracteres.";
  }

  if (data.question_type === "multiple_choice") {
    if (data.options.length < 2 || new Set(data.options.map(v => v.trim().toLocaleLowerCase())).size !== data.options.length ||
        !Number.isInteger(data.correct_answer) ||
        data.correct_answer < 0 || data.correct_answer >= data.options.length) {
      return "Múltipla escolha exige de 2 a 10 alternativas diferentes e resposta correta pelo índice (começando em zero).";
    }
  } else if (data.question_type === "true_false") {
    if (data.options.length !== 0 || typeof data.correct_answer !== "boolean") {
      return "Verdadeiro ou falso exige resposta correta booleana e nenhuma alternativa personalizada.";
    }
  } else {
    const answers = Array.isArray(data.correct_answer) ? data.correct_answer : [data.correct_answer];
    if (data.options.length !== 0 || answers.length < 1 || answers.length > 10 ||
        !answers.every(answer => validText(answer, 2000, true))) {
      return "Resposta curta exige um texto ou uma lista de até 10 respostas aceitas, cada uma com até 2000 caracteres.";
    }
  }
  return null;
}

async function readJson(request, maxBytes = 50000) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  try { return JSON.parse(raw); } catch { throw new Error("INVALID_JSON"); }
}

function makeClassCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, b => CODE_ALPHABET[b & 31]).join("");
}

async function requireTeacher(request, env) {
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const session = await verifyToken(match[1], env.SESSION_SIGNING_SECRET);
  if (!session || !session.sub || !session.login) return null;
  if (!allowedTeachers(env).includes(String(session.login).toLowerCase())) return null;
  return session;
}

async function exchange(request, env, cors) {
  let body;
  try { body = await readJson(request, 12000); }
  catch (e) { return json({ error: e.message === "PAYLOAD_TOO_LARGE" ? "Requisição muito grande." : "JSON inválido." }, 400, cors); }

  const { code, code_verifier, redirect_uri } = body || {};
  if (!validText(code, 2048, true) || !validText(code_verifier, 256, true) ||
      !validText(redirect_uri, 500, true) || redirect_uri !== env.REDIRECT_URI) {
    return json({ error: "Dados OAuth inválidos." }, 400, cors);
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.SESSION_SIGNING_SECRET || !env.DB) {
    return json({ error: "Serviço de autenticação não configurado." }, 503, cors);
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        code_verifier,
        redirect_uri
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      return json({ error: "GitHub recusou a autorização. Inicie o login novamente." }, 401, cors);
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: { "Authorization": "Bearer " + tokenData.access_token, "Accept": "application/vnd.github+json", "User-Agent": "Missao-Atomo" }
    });
    if (!userResponse.ok) return json({ error: "Não foi possível validar a conta GitHub." }, 401, cors);
    const profile = await userResponse.json();
    const login = String(profile.login || "").toLowerCase();
    if (!allowedTeachers(env).includes(login)) return json({ error: "Conta não autorizada como professora." }, 403, cors);

    await env.DB.prepare(
      "INSERT INTO teachers (github_id, github_login, display_name, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(github_id) DO UPDATE SET github_login = excluded.github_login, display_name = excluded.display_name, updated_at = datetime('now')"
    ).bind(String(profile.id), login, profile.name || profile.login).run();

    const now = Math.floor(Date.now() / 1000);
    const session_token = await issueToken({
      sub: String(profile.id), login, name: profile.name || profile.login,
      avatar_url: profile.avatar_url || null, iat: now, exp: now + 14400
    }, env.SESSION_SIGNING_SECRET);

    return json({
      session_token,
      user: { id: String(profile.id), login, name: profile.name || profile.login, avatar_url: profile.avatar_url || null }
    }, 200, cors);
  } catch (error) {
    return json({ error: "Falha ao comunicar com o serviço de autenticação ou banco de dados." }, 502, cors);
  }
}

// O Markdown é armazenado como texto. A interface deve renderizá-lo com
// sanitização HTML (incluindo atributos/eventos e URLs), sem executar HTML arbitrário.
async function handleApi(request, env, cors, url) {
  const teacher = await requireTeacher(request, env);
  if (!teacher) return json({ error: "Sessão inválida ou expirada. Entre novamente." }, 401, cors);
  if (!env.DB) return json({ error: "Banco de dados indisponível." }, 503, cors);

  const method = request.method;
  const path = url.pathname.replace(/\/$/, "") || "/";
  const parts = path.split("/").filter(Boolean);

  if (path === "/api/classrooms" && method === "GET") {
    const result = await env.DB.prepare(
      "SELECT id, name, description, is_active, created_at, updated_at FROM classrooms WHERE teacher_github_id = ? ORDER BY created_at DESC"
    ).bind(String(teacher.sub)).all();
    return json({ classrooms: result.results || [] }, 200, cors);
  }

  if (path === "/api/classrooms" && method === "POST") {
    let body;
    try { body = await readJson(request, 10000); }
    catch (e) { return json({ error: e.message === "PAYLOAD_TOO_LARGE" ? "Requisição muito grande." : "JSON inválido." }, 400, cors); }
    if (!validText(body?.name, 100, true) || (body.description != null && !validText(body.description, 1000))) {
      return json({ error: "Informe um nome de turma de até 100 caracteres e descrição de até 1000." }, 400, cors);
    }
    const id = crypto.randomUUID();
    const accessCode = makeClassCode();
    const codeHash = await sha256(accessCode);
    await env.DB.prepare(
      "INSERT INTO classrooms (id, teacher_github_id, name, description, access_code_hash) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, String(teacher.sub), body.name.trim(), body.description?.trim() || null, codeHash).run();
    return json({ classroom: { id, name: body.name.trim(), description: body.description?.trim() || null, is_active: 1 }, access_code: accessCode }, 201, cors);
  }

  if (parts[0] === "api" && parts[1] === "classrooms" && parts.length === 3) {
    const id = parts[2];
    if (method === "GET") {
      const row = await env.DB.prepare(
        "SELECT id, name, description, is_active, created_at, updated_at FROM classrooms WHERE id = ? AND teacher_github_id = ?"
      ).bind(id, String(teacher.sub)).first();
      if (!row) return json({ error: "Turma não encontrada." }, 404, cors);
      return json({ classroom: row }, 200, cors);
    }
    if (method === "PATCH") {
      let body;
      try { body = await readJson(request, 10000); }
      catch (e) { return json({ error: e.message === "PAYLOAD_TOO_LARGE" ? "Requisição muito grande." : "JSON inválido." }, 400, cors); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "JSON inválido." }, 400, cors);
      const sets = [], values = [];
      if (body.name !== undefined) {
        if (!validText(body.name, 100, true)) return json({ error: "Nome inválido." }, 400, cors);
        sets.push("name = ?"); values.push(body.name.trim());
      }
      if (body.description !== undefined) {
        if (body.description !== null && !validText(body.description, 1000)) return json({ error: "Descrição inválida." }, 400, cors);
        sets.push("description = ?"); values.push(body.description?.trim() || null);
      }
      if (body.is_active !== undefined) {
        if (![0, 1, true, false].includes(body.is_active)) return json({ error: "Estado da turma inválido." }, 400, cors);
        sets.push("is_active = ?"); values.push(body.is_active ? 1 : 0);
      }
      if (!sets.length) return json({ error: "Nenhum campo válido para atualizar." }, 400, cors);
      sets.push("updated_at = datetime('now')");
      values.push(id, String(teacher.sub));
      const result = await env.DB.prepare(
        "UPDATE classrooms SET " + sets.join(", ") + " WHERE id = ? AND teacher_github_id = ?"
      ).bind(...values).run();
      if (!result.meta?.changes) return json({ error: "Turma não encontrada." }, 404, cors);
      return json({ success: true }, 200, cors);
    }
  }

  if (path === "/api/questions" && method === "GET") {
    const result = await env.DB.prepare(
      "SELECT id, title, statement_md, question_type, options_json, correct_answer_json, explanation_md, subject, topic, difficulty, status, created_at, updated_at FROM questions WHERE teacher_github_id = ? ORDER BY updated_at DESC"
    ).bind(String(teacher.sub)).all();
    return json({ questions: result.results || [] }, 200, cors);
  }

  if (path === "/api/questions" && method === "POST") {
    let body;
    try { body = await readJson(request, 30000); }
    catch (e) { return json({ error: e.message === "PAYLOAD_TOO_LARGE" ? "Requisição muito grande." : "JSON inválido." }, 400, cors); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "JSON inválido." }, 400, cors);
    const question = {
      title: body.title,
      statement_md: body.statement_md,
      question_type: body.question_type,
      options: body.options === undefined ? [] : body.options,
      correct_answer: body.correct_answer,
      explanation_md: body.explanation_md ?? null,
      subject: body.subject === undefined ? "Química" : body.subject,
      topic: body.topic ?? null,
      difficulty: body.difficulty === undefined ? "medium" : body.difficulty,
      status: body.status === undefined ? "draft" : body.status
    };
    const validationError = validateQuestionData(question);
    if (validationError) return json({ error: validationError }, 400, cors);
    question.options = question.options.map(option => option.trim());
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO questions (id, teacher_github_id, title, statement_md, question_type, options_json, correct_answer_json, explanation_md, subject, topic, difficulty, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, String(teacher.sub), question.title.trim(), question.statement_md, question.question_type,
      JSON.stringify(question.options), JSON.stringify(question.correct_answer),
      question.explanation_md?.trim() || null, question.subject.trim(),
      question.topic?.trim() || null, question.difficulty, question.status
    ).run();
    return json({ question: { id, title: body.title.trim(), status: body.status || "draft" } }, 201, cors);
  }

  if (parts[0] === "api" && parts[1] === "questions" && parts.length === 3) {
    const id = parts[2];
    if (method === "PATCH") {
      let body;
      try { body = await readJson(request, 30000); }
      catch (e) { return json({ error: e.message === "PAYLOAD_TOO_LARGE" ? "Requisição muito grande." : "JSON inválido." }, 400, cors); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "JSON inválido." }, 400, cors);
      const allowedFields = new Set([
        "title", "statement_md", "question_type", "explanation_md", "subject",
        "topic", "difficulty", "status", "options", "correct_answer"
      ]);
      if (Object.keys(body).some(key => !allowedFields.has(key))) {
        return json({ error: "A atualização contém campos não permitidos." }, 400, cors);
      }
      if (!Object.keys(body).length) return json({ error: "Nenhum campo informado para atualizar." }, 400, cors);

      const current = await env.DB.prepare(
        "SELECT title, statement_md, question_type, options_json, correct_answer_json, explanation_md, subject, topic, difficulty, status FROM questions WHERE id = ? AND teacher_github_id = ?"
      ).bind(id, String(teacher.sub)).first();
      if (!current) return json({ error: "Questão não encontrada." }, 404, cors);

      let currentOptions, currentAnswer;
      try {
        currentOptions = JSON.parse(current.options_json || "[]");
        currentAnswer = JSON.parse(current.correct_answer_json);
      } catch {
        return json({ error: "Os dados atuais da questão precisam ser revisados antes da edição." }, 409, cors);
      }

      const question = {
        title: body.title !== undefined ? body.title : current.title,
        statement_md: body.statement_md !== undefined ? body.statement_md : current.statement_md,
        question_type: body.question_type !== undefined ? body.question_type : current.question_type,
        options: body.options !== undefined ? body.options : currentOptions,
        correct_answer: body.correct_answer !== undefined ? body.correct_answer : currentAnswer,
        explanation_md: body.explanation_md !== undefined ? body.explanation_md : current.explanation_md,
        subject: body.subject !== undefined ? body.subject : current.subject,
        topic: body.topic !== undefined ? body.topic : current.topic,
        difficulty: body.difficulty !== undefined ? body.difficulty : current.difficulty,
        status: body.status !== undefined ? body.status : current.status
      };
      const validationError = validateQuestionData(question);
      if (validationError) return json({ error: validationError }, 400, cors);

      const sets = [], values = [];
      const columnMap = {
        title: "title", statement_md: "statement_md", question_type: "question_type",
        explanation_md: "explanation_md", subject: "subject", topic: "topic",
        difficulty: "difficulty", status: "status"
      };
      for (const [field, column] of Object.entries(columnMap)) {
        if (body[field] !== undefined) {
          const value = body[field];
          sets.push(column + " = ?");
          values.push(typeof value === "string" ? value.trim() : value);
        }
      }
      if (body.options !== undefined || body.question_type !== undefined) {
        sets.push("options_json = ?");
        values.push(JSON.stringify(question.options.map(option => option.trim())));
      }
      if (body.correct_answer !== undefined) {
        sets.push("correct_answer_json = ?");
        values.push(JSON.stringify(question.correct_answer));
      }
      if (!sets.length) return json({ error: "Nenhum campo válido para atualizar." }, 400, cors);
      sets.push("updated_at = datetime('now')");
      values.push(id, String(teacher.sub));
      const result = await env.DB.prepare(
        "UPDATE questions SET " + sets.join(", ") + " WHERE id = ? AND teacher_github_id = ?"
      ).bind(...values).run();
      if (!result.meta?.changes) return json({ error: "Questão não encontrada." }, 404, cors);
      return json({ success: true }, 200, cors);
    }
    if (method === "DELETE") {
      const result = await env.DB.prepare(
        "UPDATE questions SET status = 'archived', updated_at = datetime('now') WHERE id = ? AND teacher_github_id = ?"
      ).bind(id, String(teacher.sub)).run();
      if (!result.meta?.changes) return json({ error: "Questão não encontrada." }, 404, cors);
      return json({ success: true }, 200, cors);
    }
  }

  return json({ error: "Rota não encontrada." }, 404, cors);
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    const origin = request.headers.get("Origin");
    if (origin && origin !== env.ALLOWED_ORIGIN) return json({ error: "Origem não autorizada." }, 403, cors);
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ status: "ok", service: "missao-atomo-auth-api" }, 200, cors);
    }
    if (url.pathname === "/oauth/exchange" && request.method === "POST") {
      return exchange(request, env, cors);
    }
    if (url.pathname === "/session" && request.method === "GET") {
      const header = request.headers.get("Authorization") || "";
      const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
      const session = await verifyToken(token, env.SESSION_SIGNING_SECRET);
      if (!session || !allowedTeachers(env).includes(String(session.login).toLowerCase())) {
        return json({ authenticated: false }, 401, cors);
      }
      return json({
        authenticated: true,
        user: { id: String(session.sub), login: session.login, name: session.name, avatar_url: session.avatar_url || null }
      }, 200, cors);
    }
    if (url.pathname.startsWith("/api/")) {
      try { return await handleApi(request, env, cors, url); }
      catch (error) { return json({ error: "Não foi possível concluir a operação. Tente novamente." }, 500, cors); }
    }
    return json({ error: "Rota não encontrada." }, 404, cors);
  }
};
