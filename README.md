# Quiz Type (TypeScript + PostgreSQL + Docker)

Integrantes: Henrique Gabriel Cesaroni // 2502407
             João Lucas Frangiotti // 2501625

Aplicação simples de Quiz desenvolvida em TypeScript com Express e PostgreSQL.
Ela permite cadastrar perguntas (com múltiplas respostas, indicando a correta), executar quizzes para usuários e armazenar a pontuação.

Este README contém instruções completas para instalar, executar localmente com Docker (Postgres) e usar a API e a interface web.

## Funcionalidades

- Cadastrar perguntas com múltiplas respostas (marcar a correta)
- Jogar o quiz via interface web ou API
- Registrar usuários e somar pontuação
- Endpoints REST simples para gerenciar perguntas, usuários e submissões

## Requisitos

- Node.js 16+ e npm
- Docker Desktop (ou Docker Engine) para rodar PostgreSQL
- (Opcional) yarn

## Estrutura do projeto

```
.
├── public/                # Interface web estática (index.html)
├── scripts/               # Scripts auxiliares (seed)
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── types/
│   ├── __tests__/
│   ├── db.ts
│   └── index.ts
├── .env                   # variáveis de ambiente (não versionado)
├── docker-compose.yml     # (opcional) compose para Postgres
├── package.json
└── tsconfig.json
```

## Configuração do banco (Docker)

Você pode iniciar o PostgreSQL de duas maneiras:

- Usando `docker run` (modo direto):

```powershell
docker run --name postgres-quiz \
  -e POSTGRES_USER=type \
  -e POSTGRES_PASSWORD=102030 \
  -e POSTGRES_DB=quiz_db \
  -p 5432:5432 -d postgres
```

- Usando `docker-compose` (recomendado quando já existe `docker-compose.yml` no projeto):

```powershell
docker-compose up -d
```

O container expõe a porta 5432 localmente (mapeada). Credenciais usadas pela aplicação por padrão:

- user: `type`
- password: `102030`
- database: `quiz_db`

> Se você alterar as credenciais no Docker, atualize também o arquivo `.env` da aplicação.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (já existe um `.env` no projeto de exemplo). Valores de exemplo:

```
PORT=3000
PGHOST=localhost
PGPORT=5432
PGUSER=type
PGPASSWORD=102030
PGDATABASE=quiz_db
NODE_ENV=development
```

## Instalação e execução (modo rápido)

1. Instale dependências:

```powershell
npm install
```

2. Inicie o Postgres (se ainda não estiver rodando):

```powershell
# usando docker run (exemplo)
docker run --name postgres-quiz -e POSTGRES_USER=type -e POSTGRES_PASSWORD=102030 -e POSTGRES_DB=quiz_db -p 5432:5432 -d postgres
```

3. Compile/rode em modo desenvolvimento:

```powershell
npm run dev
```

ou para compilar e rodar em produção:

```powershell
npm run build
npm start
```

## Popular o banco (seed)

O projeto inclui `scripts/seed.ts` que insere perguntas de exemplo. Para executar:

```powershell
npm run seed
```

Isso criará as tabelas (se necessário) e inserirá perguntas e respostas de exemplo.

## Interface web

Após iniciar a aplicação (`npm run dev`), abra no navegador:

```
http://localhost:3000
```

A interface permite:
- Jogar o quiz (informe seu nome e responda às perguntas)
- Criar perguntas (texto, pontos, respostas e qual é correta)
- Ver o ranking de usuários

Quando você submete o quiz, a pontuação é somada ao usuário na tabela `users` do banco.

## API — Endpoints principais

Todos os endpoints esperam/retornam JSON (exceto a interface estática).

- POST /questions
  - Cria uma pergunta com respostas
  - Body exemplo:

```json
{
  "text": "Qual é a capital do Brasil?",
  "points": 1,
  "answers": [
    { "text": "São Paulo", "is_correct": false },
    { "text": "Brasília", "is_correct": true }
  ]
}
```

- GET /questions
  - Retorna todas as perguntas (inclui `is_correct` nas respostas)

- GET /questions/quiz
  - Retorna perguntas formatadas para uso no quiz (respostas sem `is_correct`, embaralhadas)

- GET /questions/:id
  - Retorna pergunta específica

- PUT /questions/:id
  - Atualiza pergunta (mesmo corpo do POST)

- DELETE /questions/:id
  - Remove pergunta

- POST /users
  - Cria (ou retorna existente) usuário
  - Body: `{ "name": "Seu Nome" }`

- GET /users
  - Lista todos usuários com `score`

- GET /users/ranking
  - Retorna top 10 usuários por pontuação

- POST /quiz/submit
  - Submete respostas de um jogador e atualiza pontuação
  - Body exemplo:

```json
{
  "name": "João",
  "answers": [ { "questionId": 1, "answerId": 3 } ]
}
```

Retorno exemplo: `{ "gained": 1, "user": { "id": 1, "name": "João", "score": 5 } }`

## Consultar dados diretamente no banco

Para inspecionar os dados no Postgres (dentro do container):

```powershell
# entra no psql dentro do container
docker exec -it postgres-quiz psql -U type -d quiz_db

# no prompt psql
\dt
SELECT id, name, score FROM users ORDER BY score DESC;
SELECT id, text, points FROM questions ORDER BY id;
SELECT id, question_id, text, is_correct FROM answers ORDER BY question_id, id;
\q
```

Também é possível rodar consultas diretamente sem interagir com o shell psql:

```powershell
docker exec -i postgres-quiz psql -U type -d quiz_db -c "SELECT name, score FROM users ORDER BY score DESC;"
```

## Testes

O projeto inclui testes básicos com Jest. Para rodar:

```powershell
npm test
```

> Observação: os testes podem estar configurados para usar mocks. Em um ambiente local sem dependências de teste, verifique as configurações de `jest.config.json`.

## Troubleshooting

- Se a aplicação não conectar ao Postgres:
  - Verifique se o container Docker está rodando (`docker ps`)
  - Confirme as variáveis em `.env`
  - Verifique se a porta 5432 não está sendo usada por outro serviço

- Se o `npm run build` reclama de arquivos fora do `rootDir`:
  - O `tsconfig.json` já foi ajustado para incluir `scripts/` e `src/`; garanta que `tsconfig.json` contém `"include": ["src/**/*","scripts/**/*"]`.

## Comandos úteis

```powershell
# listar containers
docker ps

# ver logs do Postgres
docker logs postgres-quiz --since 5m

# parar e remover container
docker stop postgres-quiz; docker rm postgres-quiz
```

## Próximos passos / melhorias

- Autenticação de usuários
- Interface com histórico de partidas
- Exportar ranking para CSV
- Deploy com Docker (containerizar também a API)

## Licença

MIT
