# 🚀 Setup do Fluzz 2.0

## 1. Criar o arquivo .env.local

Crie o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oeqminkiadikpcfhqnie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcW1pbmtpYWRpa3BjZmhxbmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzA5NDIsImV4cCI6MjA4MjAwNjk0Mn0.C_IDfimLHMdRxyFZ3tEzMV7RxwlGYVl3irikIqvlInA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcW1pbmtpYWRpa3BjZmhxbmllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQzMDk0MiwiZXhwIjoyMDgyMDA2OTQyfQ.FCOIr5QCs8U2KJUNotfO-9xklp5TKPfKcCjDaeucHcM

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Instalar Dependências

```bash
yarn install
```

## 3. Rodar o Projeto

```bash
yarn dev
```

Acesse: http://localhost:3000

## 4. Testar o Fluxo Completo

### Primeiro Acesso:
1. Acesse `/auth/signup`
2. Crie sua conta
3. Será redirecionado para `/onboarding`
4. Crie sua organização
5. Será redirecionado para o dashboard

### Testar Workspaces:
1. Vá em "Workspaces" no menu
2. Crie um novo workspace
3. Use o Workspace Switcher no header para alternar

### Testar Departamentos:
1. Selecione um workspace
2. Vá em "Departamentos"
3. Crie departamentos para organizar a equipe

### Testar Convites:
1. Vá em "Equipe"
2. Convide usuários para a organização ou workspace
3. O convite expira em 7 dias
4. Acesse `/invite/[id]` para aceitar

## ✅ O que está funcionando:

- ✅ Autenticação (Login/Signup)
- ✅ Onboarding (Criação de organização)
- ✅ Dashboard com overview
- ✅ Workspaces CRUD completo
- ✅ Departamentos CRUD completo
- ✅ Sistema de convites
- ✅ Gestão de equipe
- ✅ Light/Dark mode
- ✅ Layout responsivo
- ✅ Workspace switcher

## 📋 TODO (Próximos passos):

- [ ] Implementar Campanhas
- [ ] Implementar Contatos
- [ ] Integração WhatsApp (Evolution API)
- [ ] Sistema de créditos avançado
- [ ] Billing com Stripe
- [ ] Templates de mensagens
- [ ] Dashboard de métricas avançado
- [ ] Sistema de notificações
- [ ] Logs e auditoria

## 🛠️ Comandos Úteis:

```bash
# Desenvolvimento
yarn dev

# Build
yarn build

# Produção
yarn start

# Lint
yarn lint
```

## 🔧 Estrutura Atualizada:

Todos os tipos TypeScript foram atualizados para corresponder ao seu schema real do Supabase. As principais diferenças ajustadas foram:

- `users.name` (ao invés de `full_name`)
- `users` não tem `avatar_url`
- `departments` não tem `description`
- `credit_ledger` usa `organization_id` direto (não `wallet_id`)
- `invites.organization_id` é obrigatório
- Tabelas do Stripe adicionadas
- Tabelas do WhatsApp adicionadas

## 🎨 Tema e Cores:

- Primary: Verde #4ADE80
- Dark: #1A1A1A
- Card Dark: #262626
- Fonte: Inter

## 📱 Responsividade:

O layout é totalmente responsivo:
- Desktop: Sidebar fixa
- Mobile: Drawer (TODO: implementar)

---

**Pronto para uso!** 🚀

