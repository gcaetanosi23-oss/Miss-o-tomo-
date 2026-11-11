# ⚛️ Missão Átomo

Jogo educacional para o ensino de distribuição eletrônica e orbitais atômicos. O projeto contém dois módulos: **Quiz: Distribuição Eletrônica (Bloco A)** e **Orbitais Quest (Bloco B)**.

## Executar localmente

1. Baixe ou clone este repositório.
2. Abra `index.html` em um navegador moderno. Para evitar restrições de alguns navegadores, prefira executar um servidor estático local (por exemplo, a extensão Live Server do VS Code).
3. O progresso dos jogos é salvo no `localStorage` do navegador e permanece no dispositivo/perfil do navegador utilizado.

## Publicar no GitHub Pages

1. Envie os arquivos deste projeto para a raiz de um repositório GitHub.
2. No repositório, acesse **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**, escolha `main` e a pasta `/ (root)`.
4. Salve e aguarde a publicação. O endereço será exibido na própria página Settings → Pages.

O workflow `.github/workflows/pages.yml` também está incluído para publicação automatizada pelo GitHub Actions. Se optar por ele, em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.

## Configurar login do professor (GitHub)

O painel usa o OAuth Device Flow do GitHub, sem servidor próprio e sem `client_secret` no navegador.

1. Em GitHub, abra **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Cadastre o nome e a URL da homepage do projeto. O Device Flow não depende de um callback tradicional.
3. Na OAuth App, habilite **Device Flow**.
4. Copie `auth-config.example.js` para `auth-config.js`.
5. Em `auth-config.js`, informe o `clientId` da OAuth App e os logins GitHub autorizados em `allowedTeachers`.
6. Publique `auth-config.js` junto com o site. Não inclua `client_secret`.

**Limitação de segurança:** um site estático não consegue manter segredo nem impor autorização confiável por conta própria. A lista `allowedTeachers` impede o acesso casual pela interface, mas pode ser alterada por alguém que controle o navegador/código publicado. O token OAuth é usado apenas em memória para consultar `/user` e descartado em seguida; não é persistido pelo projeto. O fluxo Device Flow é documentado pelo GitHub principalmente para aplicativos headless/CLI, não como primeira escolha para um site. Esta implementação deve ser tratada como protótipo de identificação, não como autenticação forte. Não use esse painel para dados pessoais, notas oficiais ou informações sensíveis. Para autorização realmente segura e dados compartilhados entre dispositivos, será necessário um backend ou serviço de autenticação/dados.

## O que o painel do professor mostra

- Três perfis/slots existentes no armazenamento local.
- Pontuação dos dois módulos, melhor sequência e maior mundo alcançado.
- Exportação de resumo CSV.

**Os resultados são locais:** o painel só lê o progresso do navegador em que foi aberto. O login GitHub não sincroniza automaticamente os resultados dos estudantes.

## Colaboração da equipe

Consulte [`CONTRIBUTING.md`](CONTRIBUTING.md) e [`docs/COLABORACAO_GITHUB.md`](docs/COLABORACAO_GITHUB.md). A equipe deve trabalhar em branches e enviar Pull Requests; a branch principal deve receber apenas alterações revisadas.

## Estrutura principal

- `index.html`: menu principal.
- `indexblocoA.html` / `scriptblocoA.js`: Quiz de Distribuição Eletrônica.
- `indexblocoB.html` / `gameblocoB.js`: Orbitais Quest.
- `storage.js`: armazenamento local unificado dos três slots.
- `teacher.html`, `teacher.js`, `teacher.css`: painel do professor.
- `auth.js`: autenticação GitHub por Device Flow.
- `auth-config.example.js`: modelo de configuração OAuth.

## Licença

Consulte `LICENSE`. Verifique também as licenças de bibliotecas, fontes e recursos de terceiros utilizados pelo projeto.


## Autenticação do professor

O painel usa GitHub Authorization Code + PKCE (S256), com Cloudflare Worker para a troca server-to-server do código. Configure `auth-config.js` e siga [`docs/AUTENTICACAO_GITHUB_PKCE.md`](docs/AUTENTICACAO_GITHUB_PKCE.md) e [`cloudflare-worker/README.md`](cloudflare-worker/README.md). **Nunca publique Client Secret.**
