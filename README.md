# Fluzz 2.0 - WhatsApp Business Platform

Plataforma SaaS multi-tenant completa para engajamento profissional via WhatsApp usando a API Oficial.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + Shadcn UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (com confirmação de email)
- **Validação**: Zod
- **Tema**: next-themes (Light/Dark mode)

## 📝 Estratégia de Desenvolvimento

Este projeto segue uma abordagem **Frontend First** com dados mockados:

### Como Funciona

1. ✅ **Frontend com Mock Data**: Todo o frontend é desenvolvido primeiro com dados simulados
2. ✅ **Aprovação da UI/UX**: Estrutura e experiência são validadas antes da implementação backend
3. ✅ **Criação Incremental de Tabelas**: Após aprovação, tabelas são criadas progressivamente no Supabase
4. ✅ **Integração Backend**: Integração com dados reais é feita de forma incremental

### Benefícios

- Desenvolvimento mais rápido do frontend
- Iterações de design sem depender do backend
- Flexibilidade para mudanças de requisitos
- Melhor experiência de desenvolvimento

## 🗄️ Banco de Dados

### Tabela Atual: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  segmento TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

**Campos:**
- `id`: UUID gerado automaticamente
- `nome`: Nome completo do usuário
- `email`: Email único para login
- `telefone`: Telefone de contato (opcional)
- `segmento`: Segmento de atuação do usuário (opcional)
- `created_at`: Data de criação
- `deleted_at`: Soft delete (null = ativo)

**Obs**: Novas tabelas serão criadas conforme o desenvolvimento avança.

## 🔐 Autenticação

A autenticação usa Supabase Auth com **confirmação de email obrigatória**:

1. Usuário preenche cadastro (nome, email, telefone, segmento, senha)
2. Sistema envia email de confirmação
3. Usuário confirma email clicando no link
4. Acesso é liberado após confirmação

## 🎨 Funcionalidades Implementadas

### ✅ Layout e Design
- Sidebar recolhível com menu responsivo
- Header com toggle de tema (Light/Dark)
- Logo dinâmica baseada no tema
- Transições suaves em todos os componentes
- Layout moderno e profissional

### ✅ Sistema de Temas
- Light Mode e Dark Mode
- Transições suaves ao trocar tema
- Logos adaptativas
- Persistência da preferência

### ✅ Autenticação Completa
- Cadastro com campos customizados (nome, email, telefone, segmento)
- Login com email/senha
- Confirmação de email obrigatória
- Página de aviso pós-cadastro
- Logout

### ✅ Organizações
- Criar organização no onboarding
- Vínculo automático usuário → organização
- Usuário criador recebe role de "owner"
- Verificação de organização em todas as rotas protegidas

### ✅ Páginas (Workspaces ainda com Mock Data)
- Dashboard
- Chat (estilo WhatsApp Web)
- Campanhas
- Contatos
- WhatsApp (Instâncias)
- Departamentos
- Workspaces
- Usuários
- Assinatura
- Templates de Mensagens

## 🚀 Setup do Projeto

### 1. Clone e instale dependências

```bash
git clone [url-do-repositorio]
cd fluzz2
yarn install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Configure o Supabase

#### Passo 1: Criar tabela users

Se ainda não criou, execute no SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  segmento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

#### Passo 2: Criar tabelas de organizações

Execute o arquivo `supabase-organizations.sql` no SQL Editor:

```sql
-- Criar tabela organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela organization_members (vínculo users <-> organizations)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### Passo 3: Ativar Confirmação de Email (Opcional)

1. Acesse: Authentication > Settings > Email Auth
2. Ative "Enable email confirmations"
3. Configure o template de email (opcional)

### 4. Inicie o servidor

```bash
yarn dev
```

Acesse: `http://localhost:3000`

## 📁 Estrutura de Pastas

```
fluzz2/
├── app/                      # App Router do Next.js
│   ├── (dashboard)/          # Rotas protegidas
│   │   ├── dashboard/        # Página principal
│   │   ├── chat/             # Chat estilo WhatsApp
│   │   ├── campanhas/        # Campanhas
│   │   ├── contatos/         # Contatos
│   │   ├── instancias/       # WhatsApp
│   │   ├── departments/      # Departamentos
│   │   ├── workspaces/       # Workspaces
│   │   ├── team/             # Usuários
│   │   ├── subscription/     # Assinatura
│   │   └── templates/        # Templates
│   ├── auth/                 # Autenticação
│   │   ├── login/            # Login
│   │   └── signup/           # Cadastro
│   └── onboarding/           # Onboarding
├── components/               # Componentes React
│   ├── ui/                   # Componentes Shadcn UI
│   ├── sidebar.tsx           # Menu lateral
│   ├── header.tsx            # Cabeçalho
│   └── theme-toggle.tsx      # Toggle de tema
├── lib/                      # Utilitários e contextos
│   ├── supabase/             # Clientes Supabase
│   ├── workspace-context.tsx # Contexto de workspace
│   └── sidebar-context.tsx   # Contexto da sidebar
└── public/                   # Arquivos estáticos
    └── images/               # Logos e ícones
```

## 🎯 Próximos Passos

1. [ ] Finalizar todas as telas com mock data
2. [ ] Aprovar UI/UX completo
3. [ ] Criar tabelas incrementalmente conforme necessário
4. [ ] Integrar backend progressivamente
5. [ ] Implementar funcionalidades reais

## 📝 Notas Importantes

- **Todos os dados são mockados** exceto autenticação
- Sidebar pode ser recolhida/expandida
- Sistema de temas funcional (Light/Dark)
- Confirmação de email é obrigatória no cadastro
- Frontend está pronto para receber dados reais quando necessário

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. A estrutura do banco de dados será expandida conforme necessário.

---

**Versão**: 2.0 (Frontend First)  
**Status**: Em Desenvolvimento  
**Última Atualização**: Dezembro 2024
