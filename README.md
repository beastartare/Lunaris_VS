# 🌙 Lunaris VS

Uma plataforma web integrada para centralização, gerenciamento, análise e visualização de informações astronômicas e meteorológicas.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Objetivos](#objetivos)
- [Perfis de Usuário](#perfis-de-usuário)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Arquitetura](#arquitetura)
- [Equipe](#equipe)
- [Licença](#licença)

---

## Sobre o Projeto

O **Lunaris VS** é uma plataforma web integrada e interativa desenvolvida para centralizar, armazenar, consultar, analisar e visualizar informações astronômicas e meteorológicas. O sistema foi projetado para atender diferentes perfis de usuários, desde entusiastas da astronomia até pesquisadores especializados, oferecendo funcionalidades específicas de acordo com o nível de acesso e as responsabilidades atribuídas a cada perfil.

A plataforma fornece um ambiente organizado para o gerenciamento de dados científicos relacionados à astronomia e à meteorologia, permitindo o cadastro, a consulta e a análise de informações sobre:

- Corpos celestes;
- Constelações;
- Eventos astronômicos;
- Eventos meteorológicos;
- Missões espaciais;
- Materiais de estudo;
- Pontos de observação;
- Registros meteorológicos.

Além disso, o sistema implementa mecanismos de controle de acesso baseados em perfis, garantindo permissões específicas para cada categoria de usuário e assegurando a padronização dos dados por meio de classificações previamente definidas.

---

## Objetivos

O principal objetivo do Lunaris VS é:

- Centralizar informações astronômicas e meteorológicas;
- Auxiliar pesquisadores e entusiastas no gerenciamento de dados;
- Disponibilizar ferramentas de análise e visualização estatística;
- Registrar e analisar dados meteorológicos para observação astronômica;
- Disponibilizar materiais de estudo especializados;
- Permitir a personalização por meio de favoritos;
- Integrar recursos de inteligência artificial para suporte e consulta.

---

## Perfis de Usuário

| Nível | Perfil | Descrição |
|---|---|---|
| 0 | Visitante | Permissões básicas de consulta |
| 1 | Pesquisador Astronômico | Gerenciamento de conteúdos astronômicos |
| 2 | Pesquisador Meteorológico | Gerenciamento de dados meteorológicos |
| 3 | Administrador | Gerenciamento completo da plataforma |

---

## Funcionalidades

### Autenticação e Controle de Acesso

- Cadastro e autenticação de usuários;
- Controle de permissões baseado em níveis;
- Proteção de rotas;
- Gerenciamento de perfis.

### Conteúdo Astronômico

- Cadastro de corpos celestes;
- Cadastro de constelações;
- Cadastro de eventos astronômicos;
- Cadastro de missões espaciais;
- Associação entre entidades astronômicas.

### Conteúdo Meteorológico

- Cadastro de eventos meteorológicos;
- Cadastro de pontos de observação;
- Registro histórico de dados meteorológicos.

### Materiais e Biblioteca

- Upload de materiais digitais;
- Organização por categorias;
- Identificação automática do tipo de arquivo;
- Biblioteca personalizada.

### Recursos Adicionais

- Sistema de favoritos;
- Dashboard estatístico;
- Visualização de indicadores;
- Integração com Google Gemini.

---

## Tecnologias Utilizadas

### Frontend

- React
- TypeScript
- React Router
- CSS
- Lucide React

### Backend

- Node.js
- Express
- Google Gemini API

### Banco de Dados

- Supabase
- PostgreSQL

### Ferramentas

- Git
- GitHub
- Visual Studio Code

---

## Estrutura do Projeto

```text
LUNARIS_VS
├── lunaris
|   ├── backend
|   │   ├── routes
|   │   ├── services
|   │   └── server.js
|   │
|   ├── public
|   │
|   ├── src
|   │   ├── assets
|   │   ├── contexts
|   │   ├── hooks
|   │   ├── lib
|   │   │   ├── components
|   |   |   |     ├── admin
|   |   |   |     |   └── statistics
|   |   |   |     ├── client
|   |   |   |     ├── pesquisador
|   |   |   |     |   └── cadastro
|   |   |   |     └── shared
|   │   │   └── utils
|   │   ├── routes
|   │   └── services
|   └── supabase
├── tables_db
|
└── README.md
```

---

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- npm
- Conta no Supabase
- Chave da API Google Gemini

### Clonar o repositório

```bash
git clone https://github.com/beastartare/Lunaris_VS.git

cd Lunaris_VS
```

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend

npm install

node server.js
```

---

## Variáveis de Ambiente

### Frontend (.env)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Backend (.env)

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
PORT=3000
```

---

## Arquitetura

```text
                Frontend
            (React + TypeScript)
                      │
                      ▼
                Backend API
             (Node.js + Express)
                      │
                      ▼
                 Supabase
         (PostgreSQL + Auth)
                      │
                      ▼
             Google Gemini API
```

---

## Equipe

Projeto desenvolvido para fins acadêmicos e de pesquisa.

- Beatriz Schuelter Tartare
- Rafaela Fernandes Savaris

---

## Licença

Este projeto foi desenvolvido exclusivamente para fins educacionais e acadêmicos.