# Colaboração da equipe pelo GitHub

## Preparar a equipe

- Em um repositório de organização: **Settings → Collaborators and teams → Add teams** e conceda a permissão mínima necessária.
- Em repositório pessoal: **Settings → Collaborators → Add people**.
- Para a maioria dos colaboradores, use permissão **Write**; reserve **Admin** ao mantenedor responsável.

## Proteger a branch principal

Em **Settings → Rules → Rulesets** (ou Branches → Branch protection rules), crie uma regra para `main`:

- exigir Pull Request antes de integrar;
- exigir pelo menos uma aprovação, quando o tamanho da equipe permitir;
- exigir resolução das conversas;
- bloquear force push e exclusão da branch;
- exigir verificações automatizadas, quando configuradas.

## Rotina sugerida

- `main`: versão estável publicada.
- `feat/...`: novas funcionalidades.
- `fix/...`: correções.
- Issues: tarefas, erros e propostas.
- Pull Requests: revisão e integração das alterações.

O acesso da equipe ao repositório é gerenciado pelo próprio GitHub. O site publicado não adiciona nem remove colaboradores automaticamente.
