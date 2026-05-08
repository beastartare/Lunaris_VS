# Lunaris_VS

# Lunaris — Setup Windows

## Tecnologias utilizadas

- React
- Vite
- Tailwind CSS
- Supabase
- PostgreSQL
- Docker
- TypeScript

---

# 1. Instalar Node.js

Baixar a versão LTS:

- [https://nodejs.org](https://nodejs.org)

Após instalar, verificar:

```bash
node -v
npm -v
```

---

# 2. Instalar Docker Desktop

Baixar:

- [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Durante a instalação:

- deixar WSL2 habilitado
- reiniciar o computador se necessário

Depois abrir o Docker Desktop e esperar aparecer:

```txt
Docker Desktop is running
```

Verificar:

```bash
docker --version
docker compose version
```

---

# 3. Instalar Supabase CLI

## Instalar Scoop

Abrir PowerShell como administrador:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

---

## Instalar Supabase CLI

```powershell
scoop install supabase
```

---

## Verificar instalação

```bash
supabase --version
```

---

# 4. Clonar projeto

```bash
git clone https://github.com/beastartare/Lunaris_VS.git
```

Entrar na pasta:

```bash
cd lunaris
```

---

# 5. Instalar dependências do projeto

```bash
npm install
```

---

# 6. Configurar variáveis de ambiente

Criar um arquivo:

## `.env`

Na raiz do projeto.

Conteúdo:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

---

# 7. Inicializar Supabase local

Dentro da pasta do projeto:

```bash
supabase start
```

Esse comando irá iniciar:

- PostgreSQL
- Supabase Studio
- Auth
- Storage
- Realtime
- API REST
- GraphQL

---

# 8. Abrir Supabase Studio

Abrir no navegador:

```txt
http://127.0.0.1:54323
```

---

# 9. Rodar frontend

```bash
npm run dev
```

---

# 10. URLs importantes

## Frontend

```txt
http://localhost:5173
```

## Supabase Studio

```txt
http://127.0.0.1:54323
```

## API Supabase

```txt
http://127.0.0.1:54321
```

---

# 11. Banco de dados no VS Code

Instalar extensões:

- PostgreSQL
- SQLTools
- SQLTools PostgreSQL Driver

---

## Dados de conexão PostgreSQL

| Campo    | Valor     |
| -------- | --------- |
| Host     | 127.0.0.1 |
| Porta    | 54322     |
| Database | postgres  |
| Usuário  | postgres  |
| Senha    | postgres  |

---

# 12. Comandos úteis

## Parar Supabase

```bash
supabase stop
```

---

## Reiniciar Supabase

```bash
supabase stop
supabase start
```

---

## Resetar banco

```bash
supabase db reset
```

---

## Ver containers ativos

```bash
docker ps
```

---

## Parar todos containers Docker

```bash
docker stop $(docker ps -aq)
```

---

# 13. Estrutura principal do projeto

```txt
lunaris/
├── src/
├── public/
├── supabase/
├── .env
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

---

# 14. Fluxo correto de desenvolvimento

Sempre que abrir o projeto:

## 1.

```bash
supabase start
```

## 2.

```bash
npm run dev
```

---

# 15. Dependências principais utilizadas

## Frontend

```bash
npm install react-router-dom lucide-react clsx tailwind-merge axios
```

## Supabase

```bash
npm install @supabase/supabase-js
```

---

# 16. Caso apareça erro de porta ocupada

Parar containers:

```bash
docker stop $(docker ps -aq)
```

Depois iniciar novamente:

```bash
supabase start
```

---

# 17. Caso o Supabase não inicie

Limpar Docker:

```bash
docker system prune -a -f
```

Depois:

```bash
supabase start
```

---

# 18. Observação sobre segurança

As chaves deste projeto estão sendo usadas apenas para desenvolvimento local.

NÃO utilizar essas chaves em produção.

