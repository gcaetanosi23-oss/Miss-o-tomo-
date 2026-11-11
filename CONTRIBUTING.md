# Como contribuir

Obrigado pelo interesse em contribuir com o Missão Átomo!

## Fluxo de trabalho

1. Abra uma Issue descrevendo o problema, sugestão ou melhoria antes de mudanças grandes.
2. Peça acesso ao mantenedor se ainda não for membro da equipe.
3. Crie uma branch a partir de `main`, por exemplo `feat/painel-turma` ou `fix/salvamento-slot`.
4. Faça alterações pequenas e com propósito claro.
5. Teste os dois módulos, os três slots, a migração de progresso antigo e o painel do professor.
6. Abra um Pull Request para `main`, descrevendo o que mudou, como testar e eventuais limitações.
7. Aguarde revisão. Não faça push direto em `main`.

## Padrões

- Preserve a compatibilidade com os dados existentes em `localStorage`.
- Não introduza dependências ou serviços pagos sem discutir antes em uma Issue.
- Não inclua tokens, senhas, `client_secret`, dados pessoais ou credenciais em commits.
- Mantenha a interface em português brasileiro e responsiva.
- Ao alterar autenticação, documente escopos OAuth, armazenamento do token e limitações de segurança.

## Checklist de Pull Request

- [ ] Testei o menu principal e os dois jogos.
- [ ] Testei salvar, continuar e apagar os três slots.
- [ ] Verifiquei a interface em celular e desktop.
- [ ] Atualizei a documentação quando necessário.
- [ ] Não incluí segredos ou dados pessoais.
