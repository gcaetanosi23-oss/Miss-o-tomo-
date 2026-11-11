# Autenticação GitHub — Authorization Code + PKCE

## Arquitetura
GitHub Pages hospeda a interface. O navegador gera `state` e `code_verifier`, calcula `code_challenge` com SHA-256 (`S256`) e redireciona para o GitHub. No retorno, `oauth-callback.js` valida `state` e envia `code`, `code_verifier` e `redirect_uri` ao Cloudflare Worker. O Worker usa o Client Secret guardado como secret, troca o código no GitHub, consulta `/user`, aplica a allowlist e devolve uma sessão assinada.

## Por que existe um Worker?
O GitHub documenta `client_secret` como parâmetro necessário na troca do código de uma OAuth App. PKCE protege o código de autorização, mas não transforma por si só a OAuth App do GitHub em um endpoint de troca sem segredo/CORS para SPA. Por isso, o segredo fica no Worker e a chamada ao GitHub é server-to-server.

## Configurar
1. Publique o site no GitHub Pages e defina o caminho final do projeto.
2. Na OAuth App, defina a callback exatamente como `https://SEU-USUARIO.github.io/REPOSITORIO/oauth-callback.html`.
3. Configure `auth-config.js` com `clientId`, `workerUrl` e `redirectUri`.
4. Configure e publique o Worker seguindo `cloudflare-worker/README.md`.
5. Cadastre o Client Secret somente com `wrangler secret put GITHUB_CLIENT_SECRET`.
6. Cadastre os logins permitidos em `ALLOWED_TEACHERS` no `wrangler.toml`.

## Atenção ao caminho do Pages
Se o repositório for `SEU-USUARIO.github.io`, o callback pode estar na raiz. Se for um projeto chamado `missao-atomo`, inclua `/missao-atomo/` no caminho. A callback registrada, a variável `REDIRECT_URI` do Worker e `redirectUri` do frontend devem ser idênticas.

## O que o login garante
O Worker confirma a identidade GitHub e só emite sessão para logins presentes na allowlist. A interface consulta o Worker para validar a sessão. O dashboard continua lendo os saves locais do navegador atual; não recebe progresso dos dispositivos dos estudantes.
