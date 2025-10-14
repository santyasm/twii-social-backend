<p align="center">
  <a href="https://twii-social-backend.onrender.com/" target="blank"><img src="./docs/images/logo.svg" width="80" alt="Twii Logo"></a>
  <a href="https://twii-api.yasminsantana.fun/docs" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="100" alt="Nest Logo" /></a>
</p>

# 📱 Social Network API

API backend para uma rede social inspirada no Twitter, desenvolvida com **NestJS**, **Prisma** e **PostgreSQL**.

Os usuários podem criar contas, seguir outros usuários, fazer posts com imagens, curtir, comentar e visualizar um feed dinâmico.

---

## 📘 Documentação da API

[![Swagger Documentation](https://img.shields.io/badge/Swagger-Documentation-green?style=for-the-badge&logo=swagger)](https://twii-api.yasminsantana.fun/docs)

**Acesse o link acima para a documentação interativa (OpenAPI) completa da API.**

---

## 🚀 Tecnologias e Versões

| Badge                                                                                                                                    | Descrição                               |
| :--------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| [![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)                            | Framework principal da aplicação.       |
| [![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)                         | Ambiente de execução JavaScript.        |
| [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)                          | ORM para banco de dados.                |
| [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)        | Banco de dados relacional.              |
| [![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)                     | Autenticação baseada em tokens.         |
| [![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Storage-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/) | Armazenamento e manipulação de imagens. |
| [![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=white)](https://swagger.io/)                      | Documentação interativa da API.         |
| [![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)                   | Containerização e deploy.               |

## ✨ Features

- **Autenticação** com JWT (login e registro)
- **Usuários**
  - CRUD de usuários
  - Upload de avatar com Cloudinary
  - Seguir e deixar de seguir outros usuários
- **Posts**
  - Criar posts com imagem opcional
  - Atualizar e remover posts (somente o autor)
  - Curtir e descurtir posts
  - Comentar posts, editar e excluir comentários
- **Feed**
  - Visualizar todos os posts
  - Filtrar apenas por posts de usuários seguidos

---

## 📦 Instalação e uso

### 1. Clonar o repositório

```bash
git clone [https://github.com/santyasm/twii-social-backend.git](https://github.com/santyasm/twii-social-backend.git)
cd twii-social-backend
```

### 2\. Instalar dependências

```bash
# Usando pnpm
pnpm install

# Usando npm
npm install

# Usando yarn
yarn install
```

### 3\. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis:

```bash
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
JWT_SECRET="sua_chave_secreta"
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="sua_api_secret"
```

### 4\. Executar migrações do Prisma

```bash
# pnpm
pnpm prisma migrate dev

# npm
npx prisma migrate dev

# yarn
yarn prisma migrate dev
```

### 5\. Rodar a aplicação em modo dev

```bash
# pnpm
pnpm run start:dev

# npm
npm run start:dev

# yarn
yarn start:dev
```

### 6\. Rodar em produção

Para rodar em produção, primeiro é necessário compilar o projeto (`build`) e depois iniciá-lo (`start:prod`):

```bash
# Passo 1: Compilar o projeto
pnpm run build
# ou
npm run build
# ou
yarn build

# Passo 2: Iniciar o servidor
pnpm run start:prod
# ou
npm run start:prod
# ou
yarn start:prod
```

### 🐳 Usando Docker

#### Build da imagem

```bash
docker build -t twii-social-backend .
```

#### Subir o container

```bash
docker run -p 3000:3000 --env-file .env twii-social-backend
```

## 🔷 Endpoints principais

### Autenticação

- `POST /auth/register` — Registro

- `POST /auth/login` — Login

### Usuários

- `GET /users` — Listar todos

- `GET /users/:id` — Buscar por ID

- `PATCH /users/:id` — Atualizar usuário

- `DELETE /users/:id` — Remover usuário

- `POST /users/:id/follow` — Seguir usuário

- `POST /users/:id/unfollow `— Deixar de seguir

### Posts

- `POST /posts` — Criar post

- `GET /posts` — Listar posts

- `GET /posts/:id `— Buscar post

- `PATCH /posts/:id` — Atualizar post

- `DELETE /posts/:id` — Remover post

- `POST /posts/:id/like` — Curtir post

- `POST /posts/:id/unlike` — Descurtir post

- `POST /posts/:id/comments` — Comentar

- `PATCH /posts/comments/:id` — Editar comentário

- `DELETE /posts/comments/:id` — Excluir comentário

### Feed

- `GET /posts/feed` — Feed do usuário
  - `?onlyFollowing=true` → apenas posts de quem o usuário segue
  - `?onlyFollowing=false` → posts sugeridos (todos)

## 📌 Roadmap

- [ ] Sistema de **notificações** (likes, comentários, novos seguidores)
- [ ] Suporte a **vídeos** nos posts
- [ ] Sistema de **mensagens diretas (chat)**
- [ ] Implementar **refresh token** para autenticação mais segura
- [ ] Melhorar sistema de **recomendações (posts sugeridos)**
- [ ] Criar **testes unitários e de integração** (Jest)
- [ ] Deploy de **frontend integrado (Next.js)**

## 👩‍💻 Contribuindo

1.  Faça um fork do projeto

2.  Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)

3.  Commit suas alterações (`git commit -m 'feat: minha nova feature'`)

4.  Faça push para a branch (`git push origin feature/nova-feature`)

5.  Abra um Pull Request 🚀

## 📜 Licença

Este projeto está sob a licença MIT.

## 👩‍💻 Autora

Feito com 💜 por Yasmin Santana
[LinkedIn](https://www.linkedin.com/in/yasmin-santana-santos/) [GitHub](https://github.com/santyasm)
