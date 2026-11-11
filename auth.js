/* GitHub OAuth Authorization Code + PKCE (S256).
 * O navegador nunca recebe o Client Secret nem o access_token do GitHub.
 * A troca do code e a validação da allowlist acontecem no Cloudflare Worker.
 */
(() => {
  "use strict";
  const CONFIG = window.MISSAO_ATOMO_AUTH || {};
  const STATE_KEY = "ma_oauth_state";
  const VERIFIER_KEY = "ma_pkce_verifier";
  const SESSION_KEY = "ma_teacher_session";
  const SESSION_USER_KEY = "ma_teacher_user";
  const SESSION_MAX_AGE = 4 * 60 * 60 * 1000;

  function assertConfig() {
    if (!CONFIG.clientId || !CONFIG.workerUrl || !CONFIG.redirectUri ||
        CONFIG.workerUrl.includes("CONFIGURE-SEU-WORKER") ||
        CONFIG.redirectUri.includes("SEU-USUARIO")) {
      throw new Error("Configure clientId, workerUrl e redirectUri em auth-config.js antes de publicar.");
    }
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      throw new Error("A autenticação exige HTTPS.");
    }
  }
  const bytesToBase64Url = bytes => {
    let binary = "";
    new Uint8Array(bytes).forEach(b => binary += String.fromCharCode(b));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };
  const randomUrlSafe = (length = 64) => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytesToBase64Url(bytes);
  };
  async function challengeFor(verifier) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return bytesToBase64Url(digest);
  }
  async function login() {
    assertConfig();
    if (!crypto.subtle) throw new Error("Este navegador não oferece Web Crypto. Atualize o navegador e use HTTPS.");
    const state = randomUrlSafe(32);
    const verifier = randomUrlSafe(64);
    const challenge = await challengeFor(verifier);
    sessionStorage.setItem(STATE_KEY, state);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    const params = new URLSearchParams({
      client_id: CONFIG.clientId,
      redirect_uri: CONFIG.redirectUri,
      scope: "read:user",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    location.assign(`https://github.com/login/oauth/authorize?${params.toString()}`);
  }
  async function completeCallback() {
    assertConfig();
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) throw new Error(params.get("error_description") || `Autorização cancelada (${error}).`);
    const code = params.get("code");
    const returnedState = params.get("state");
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    // Remover code da barra de endereço imediatamente.
    history.replaceState({}, document.title, location.pathname);
    if (!code || !returnedState || !expectedState || returnedState !== expectedState || !verifier) {
      throw new Error("Resposta OAuth inválida ou sessão PKCE expirada. Volte ao painel e tente novamente.");
    }
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    const response = await fetch(`${CONFIG.workerUrl.replace(/\/$/, "")}/oauth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ code, code_verifier: verifier, redirect_uri: CONFIG.redirectUri })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Não foi possível concluir o login com GitHub.");
    if (!data.session_token || !data.user) throw new Error("Resposta inválida do serviço de autenticação.");
    sessionStorage.setItem(SESSION_KEY, data.session_token);
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify({ ...data.user, authenticatedAt: Date.now() }));
    return data.user;
  }
  async function currentUser() {
    assertConfig();
    const token = sessionStorage.getItem(SESSION_KEY);
    const rawUser = sessionStorage.getItem(SESSION_USER_KEY);
    if (!token || !rawUser) return null;
    try {
      const cached = JSON.parse(rawUser);
      if (!cached.authenticatedAt || Date.now() - cached.authenticatedAt > SESSION_MAX_AGE) {
        logout(); return null;
      }
      const response = await fetch(`${CONFIG.workerUrl.replace(/\/$/, "")}/session`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.user) { logout(); return null; }
      return data.user;
    } catch (_) { logout(); return null; }
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
  }
  window.MissaoAuth = { login, completeCallback, currentUser, logout };
})();
