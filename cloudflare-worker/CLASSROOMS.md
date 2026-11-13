# Atividades por turma — preparação do banco de dados

Esta pasta contém a primeira migração do banco D1 para o sistema de atividades por turma.

## Modelo inicial

- `teachers`: professores identificados pelo GitHub OAuth.
- `classrooms`: turmas pertencentes a um professor; o código de acesso deve ser armazenado somente como hash.
- `classroom_students`: participantes identificados por nome e uma chave individual; a chave deve ser armazenada como hash.
- `questions`: banco de questões do professor, com enunciado e explicação em Markdown.
- `assessments`: atividades atribuídas a uma turma.
- `assessment_questions`: questões e pontuação de cada atividade.
- `submissions` e `submission_answers`: tentativas e respostas dos alunos.

## Aplicar a migração

1. Crie um banco D1 na mesma conta Cloudflare em que o Worker `missao-atomo-auth` está implantado.
2. Configure o binding D1 no Worker (por exemplo, `DB`).
3. A partir desta pasta, execute a migração usando o nome ou ID real do banco:

```bash
npx wrangler d1 execute NOME_DO_BANCO --remote --file=migrations/0001_classroom_schema.sql
```

Não execute o comando com o texto literal `NOME_DO_BANCO`; substitua pelo banco que você criou.

## Regras obrigatórias para a API

- Validar a sessão do professor no Worker em toda rota de professor.
- Derivar o identificador do professor da sessão assinada; nunca confiar em `teacher_id` enviado pelo navegador.
- Restringir leitura, edição e exclusão de turmas, questões e avaliações ao professor proprietário.
- Gerar códigos de turma aleatórios, sem sequências previsíveis; armazenar somente hash e limitar tentativas de entrada.
- Não exigir conta GitHub dos alunos. Coletar apenas nome de exibição e uma credencial aleatória de participante, armazenada como hash.
- Não enviar `correct_answer_json` nem explicações de correção antes do encerramento/correção da atividade.
- Validar e limitar tamanho de Markdown, opções, anexos e respostas.
- Escapar/sanitizar Markdown renderizado para impedir XSS. Não permitir HTML arbitrário.
- Usar consultas preparadas/bind parameters.
- Aplicar regras de disponibilidade e estado da atividade no servidor, não apenas na interface.

## Próxima etapa

Implementar no Worker as rotas autenticadas para turmas e questões, depois as rotas públicas de entrada do aluno e entrega de respostas. A interface não deve simular salvamento: só exibir sucesso quando a API confirmar a gravação.
