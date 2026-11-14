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
  if (!token || !secret || token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expected = await sign(parts[0], secret);
  if (expected !== parts[1]) return null;
  try {
    const payload = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - parts[0].length % 4) % 4)));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
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
    const types = ["multiple_choice", "true_false", "short_answer"];
    const difficulties = ["easy", "medium", "hard"];
    const statuses = ["draft", "published", "archived"];
    if (!validText(body?.title, 160, true) || !validText(body?.statement_md, 12000, true) ||
        !types.includes(body?.question_type) || body.correct_answer === undefined ||
        (body.options !== undefined && (!Array.isArray(body.options) || body.options.length > 10)) ||
        (body.explanation_md != null && !validText(body.explanation_md, 8000)) ||
        (body.topic != null && !validText(body.topic, 120)) ||
        (body.difficulty !== undefined && !difficulties.includes(body.difficulty)) ||
        (body.status !== undefined && !statuses.includes(body.status))) {
      return json({ error: "Dados da questão inválidos. Revise título, enunciado, tipo, alternativas e resposta correta." }, 400, cors);
    }
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO questions (id, teacher_github_id, title, statement_md, question_type, options_json, correct_answer_json, explanation_md, subject, topic, difficulty, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, String(teacher.sub), body.title.trim(), body.statement_md, body.question_type,
      JSON.stringify(body.options || []), JSON.stringify(body.correct_answer),
      body.explanation_md || null, validText(body.subject, 80, true) ? body.subject.trim() : "Química",
      body.topic?.trim() || null, body.difficulty || "medium", body.status || "draft"
    ).run();
    return json({ question: { id, title: body.title.trim(), status: body.status || "draft" } }, 201, cors);
  }

  if (parts[0] === "api" && parts[1] === "questions" && parts.length === 3) {
    const id = parts[2];
    if (method === "PATCH") {
      let body;
      try { body = await readJson(request, 30000); }
      catch (e) { return json({ error: e.message === "PAYLOAD_TOO_LARGE" ? "Requisição muito grande." : "JSON inválido." }, 400, cors); }
      const allowed = {
        title: v => validText(v, 160, true),
        statement_md: v => validText(v, 12000, true),
        question_type: v => ["multiple_choice", "true_false", "short_answer"].includes(v),
        explanation_md: v => v === null || validText(v, 8000),
        subject: v => validText(v, 80, true),
        topic: v => v === null || validText(v, 120),
        difficulty: v => ["easy", "medium", "hard"].includes(v),
        status: v => ["draft", "published", "archived"].includes(v)
      };
      const sets = [], values = [];
      for (const [key, validate] of Object.entries(allowed)) {
        if (body[key] !== undefined) {
          if (!validate(body[key])) return json({ error: "Campo inválido: " + key }, 400, cors);
          sets.push(key + " = ?"); values.push(typeof body[key] === "string" ? body[key].trim() : body[key]);
        }
      }
      if (body.options !== undefined) {
        if (!Array.isArray(body.options) || body.options.length > 10) return json({ error: "Alternativas inválidas." }, 400, cors);
        sets.push("options_json = ?"); values.push(JSON.stringify(body.options));
      }
      if (body.correct_answer !== undefined) {
        sets.push("correct_answer_json = ?"); values.push(JSON.stringify(body.correct_answer));
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
