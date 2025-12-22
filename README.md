# Fluzz 2.0 - WhatsApp Business Platform

Plataforma SaaS multi-tenant completa para engajamento profissional via WhatsApp usando a API Oficial.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + Shadcn UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Validação**: Zod
- **Tema**: next-themes (Light/Dark mode)

## 🏗️ Arquitetura

### Estrutura Multi-tenant

```
Organization (Billing & Credits)
  └── Workspaces (Unlimited)
       └── Departments
            └── Members
```

### Níveis de Permissão

- **Organization**: `owner`, `admin` (acesso total, gerencia billing e créditos)
- **Workspace**: `admin`, `manager`, `agent`, `viewer` (acesso apenas ao workspace)
- **Department**: `manager`, `agent` (atua no atendimento)

## 📋 Funcionalidades Implementadas (MVP)

### ✅ Autenticação
- Login/Signup com Supabase Auth
- Proteção de rotas com middleware
- Gestão de sessões

### ✅ Onboarding
- Criação de organização ao primeiro acesso
- Workspace padrão automático
- Wallet de créditos inicial

### ✅ Dashboard
- Overview da organização
- Saldo de créditos e movimentações
- Plano atual
- Ações rápidas

### ✅ Workspaces (CRUD)
- Criar/Editar/Excluir workspaces
- Slug único por organização
- Workspace switcher no header

### ✅ Departamentos (CRUD)
- Criar/Editar/Excluir departments
- Organização por workspace
- Gestão de membros (TODO)

### ✅ Equipe e Convites
- Convidar usuários para organização
- Convidar usuários para workspace
- Sistema de convites com expiração
- Aceite de convites
- Gestão de membros

### ✅ Layout e Navegação
- Sidebar responsiva
- Header com workspace switcher
- Light/Dark mode toggle
- Menu de usuário

## 🔜 Próximas Implementações

- [ ] Campanhas de mensagens
- [ ] Gestão de contatos
- [ ] Integração WhatsApp (Evolution API)
- [ ] Templates de mensagens
- [ ] Dashboard de métricas
- [ ] Billing e Stripe
- [ ] Gestão de créditos
- [ ] Sistema de notificações
- [ ] Logs e auditoria

## 🛠️ Setup do Projeto

### 1. Clonar e Instalar Dependências

```bash
cd fluzz2
npm install
```

### 2. Configurar Supabase

Crie um projeto no [Supabase](https://supabase.com) e execute o seguinte schema SQL:

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Workspace Members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'manager', 'agent', 'viewer')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department Members
CREATE TABLE department_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('manager', 'agent')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, user_id)
);

-- Invites
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Subscriptions
CREATE TABLE organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Wallets
CREATE TABLE credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Ledger
CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES credit_wallets(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('credit', 'debit')) NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE INDEX idx_departments_workspace ON departments(workspace_id);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_status ON invites(status);
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Executar o Projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## 📁 Estrutura de Pastas

```
fluzz2/
├── app/
│   ├── (dashboard)/          # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── workspaces/
│   │   ├── departments/
│   │   ├── team/
│   │   ├── campanhas/        # TODO
│   │   ├── contatos/         # TODO
│   │   ├── instancias/       # TODO
│   │   └── settings/
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   ├── invite/[id]/          # Aceite de convites
│   ├── onboarding/           # Criação de organização
│   └── layout.tsx
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── theme-provider.tsx
│   └── workspace-switcher.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── auth.ts
│   ├── permissions.ts
│   ├── validations/
│   ├── workspace-context.tsx
│   └── utils.ts
├── types/
│   ├── database.ts
│   └── index.ts
└── public/
    └── images/
```

## 🎨 Design System

- **Cores Principais**: Verde (#4ADE80) e Dark (#1A1A1A)
- **Fonte**: Inter
- **Componentes**: Shadcn UI (Radix UI + TailwindCSS)
- **Responsivo**: Mobile-first

## 🔐 Segurança

- Server Actions para operações sensíveis
- Validação com Zod em todas as entradas
- Middleware de autenticação
- Verificação de permissões no backend
- RLS (Row Level Security) - TODO

## 📝 Regras de Negócio

1. **Billing** e créditos vivem no nível Organization
2. **Workspaces** são ilimitados
3. **Usuários** entram apenas por convite
4. **Org Admins/Owners** veem todos os workspaces
5. **Workspace members** veem apenas seus workspaces
6. **Department members** atuam no atendimento

## 🧪 Testes

TODO: Implementar testes

## 📄 Licença

Proprietário - Fluzz

---

**Desenvolvido com ❤️ usando Next.js e Supabase**

