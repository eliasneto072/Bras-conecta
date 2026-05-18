# Brás Conecta

Marketplace atacadista inspirado no Brás, desenvolvido para conectar lojistas e compradores através de uma plataforma moderna com catálogo digital, autenticação JWT, carrinho persistente e integração com WhatsApp.

---

# Visão Geral

O projeto foi desenvolvido utilizando arquitetura Fullstack separada entre frontend e backend, consumindo uma API REST construída com Node.js + Express + Prisma ORM.

O sistema possui:

* Autenticação JWT
* Controle de permissões por roles
* Marketplace de lojas
* Produtos e variantes
* Carrinho persistente
* Integração frontend/backend
* Dashboard do lojista
* Checkout via WhatsApp
* SPA (Single Page Application)

---

# Estrutura do Projeto

```txt
Bras_conecta/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── stores/
│   │   │   └── users/
│   │   │
│   │   ├── routes/
│   │   ├── shared/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   └── bras-web/
│       ├── pages/
│       ├── app.js
│       ├── api.js
│       ├── auth.js
│       ├── cart.js
│       ├── styles.css
│       ├── utils.js
│       ├── whatsapp.js
│       └── index.html
│
└── README.md
```

---

# Tecnologias Utilizadas

## Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* SPA Hash Router

## Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Zod

## Ferramentas

* Prisma Studio
* Insomnia
* Git
* GitHub
* VSCode
* Live Server

---

# Arquitetura Backend

O backend foi estruturado seguindo arquitetura modular.

Cada módulo possui:

* controller
* service
* repository
* schemas
* types
* routes

Exemplo:

```txt
modules/
└── products/
    ├── products.controller.ts
    ├── products.service.ts
    ├── products.repository.ts
    ├── products.schemas.ts
    ├── products.routes.ts
    └── products.types.ts
```

---

# Funcionalidades

# Autenticação

* Registro de usuários
* Login JWT
* Persistência de sessão
* Middleware de autenticação
* Logout

---

# Controle de Roles

## CUSTOMER

* Navegar pelas lojas
* Visualizar produtos
* Adicionar ao carrinho
* Finalizar pedidos

## SELLER

* Acesso ao dashboard
* Gerenciar lojas
* Gerenciar produtos
* Gerenciar variantes

## ADMIN

* Controle total da plataforma

---

# Marketplace

## Lojas

Cada loja possui:

* Nome
* Slug
* Descrição
* WhatsApp
* Pedido mínimo
* Cidade
* Estado
* Logo (estrutura preparada)
* Banner (estrutura preparada)

---

# Produtos

Cada produto possui:

* Nome
* Slug
* Descrição
* Preço inicial
* Variantes
* Categorias
* Imagem principal
* Galeria de imagens

---

# Variantes

Cada produto pode possuir:

* Cor
* Tamanho
* Estoque
* Preço individual

---

# Carrinho

## Funcionalidades implementadas

* Carrinho local para visitantes
* Carrinho persistente no backend
* Integração completa frontend/backend
* Atualização dinâmica do badge
* Migração automática do carrinho local para API após login

---

# Checkout via WhatsApp

O sistema gera automaticamente uma mensagem contendo:

* Produtos
* Quantidades
* Variantes
* Valores
* Total do pedido

Após isso, o usuário é redirecionado para o WhatsApp da loja.

---

# Dashboard do Lojista

## Estrutura atual

* Dashboard base
* Gerenciamento de produtos
* Gerenciamento de variantes
* Controle de permissões

## Próximas melhorias

* Upload de imagens
* Analytics
* Gestão de pedidos
* Controle de estoque avançado

---

# Banco de Dados

## Principais entidades

### User

* id
* name
* email
* password
* role

### Store

* id
* ownerId
* name
* slug
* description
* whatsapp
* minOrderValue

### Product

* id
* storeId
* categoryId
* name
* slug
* description
* priceFrom

### ProductVariant

* id
* productId
* color
* size
* stock
* price

### Cart

* id
* userId

### CartItem

* productId
* variantId
* quantity

### Order

* userId
* storeId
* total
* status

---

# API REST

# Auth

```http
POST /auth/login
GET  /auth/me
POST /users
```

---

# Stores

```http
GET    /stores
GET    /stores/:id
GET    /stores/slug/:slug
POST   /stores
PATCH  /stores/:id
DELETE /stores/:id
```

---

# Products

```http
GET    /stores/:storeId/products
GET    /stores/:storeId/products/:id
POST   /stores/:storeId/products
PATCH  /stores/:storeId/products/:id
DELETE /stores/:storeId/products/:id
```

---

# Cart

```http
GET    /cart
POST   /cart/items
PATCH  /cart/items/:variantId
DELETE /cart/items/:variantId
```

---

# Orders

```http
GET   /orders/me
POST  /orders
PATCH /orders/:id/status
```

---

# Segurança

* JWT Authentication
* Middleware de autorização
* Controle de acesso por roles
* Tratamento global de erros
* Validação com Zod

---

# Fluxo da Aplicação

```txt
Frontend SPA
    ↓
REST API Express
    ↓
Prisma ORM
    ↓
PostgreSQL
```

---

# Como Executar o Projeto

# Backend

```bash
cd backend

npm install

npx prisma generate

npx prisma migrate dev

npm run dev
```

---

# Frontend

Utilize a extensão Live Server do VSCode.

Abra:

```txt
frontend/bras-web/index.html
```

---

# Variáveis de Ambiente

Crie um arquivo `.env` dentro de `backend/`:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

---

# Roadmap

# MVP

* [x] Autenticação JWT
* [x] Controle de roles
* [x] Marketplace
* [x] Produtos
* [x] Variantes
* [x] Carrinho
* [x] Checkout WhatsApp
* [x] Dashboard base

---

# Próximas Features

* [ ] Upload de imagens
* [ ] Cloudinary
* [ ] Sistema de pedidos completo
* [ ] Analytics
* [ ] Favoritos
* [ ] Dashboard administrativo
* [ ] Responsividade avançada
* [ ] Deploy produção

---

# Melhorias Futuras

* React + Vite
* Upload otimizado
* Lazy loading
* WebSockets
* Notificações
* Integração pagamentos
* Aplicativo mobile

---

# Screenshots


---

# Deploy Futuro

## Frontend

* Vercel

## Backend

* Railway
* Render

## Banco de Dados

* Neon PostgreSQL
* Supabase

---

# Objetivo do Projeto

O projeto foi desenvolvido com foco em aprendizado avançado de:

* Arquitetura Fullstack
* APIs REST
* JWT Authentication
* Modelagem de dados
* Integração frontend/backend
* Fluxos reais de ecommerce
* Arquitetura modular
* Escalabilidade de aplicações

---

# Autor

Elias Neto

Desenvolvedor Fullstack focado em aplicações web modernas, backend APIs e arquitetura de sistemas.
