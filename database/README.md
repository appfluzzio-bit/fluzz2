# Migrações do Banco de Dados

Este diretório contém os scripts SQL para criar e atualizar a estrutura do banco de dados.

## 📁 Estrutura

```
database/
├── migrations/
│   ├── 00_setup_complete.sql             # ⭐ Setup completo (RECOMENDADO)
│   ├── create_invites_table.sql          # Criar tabela de convites do zero
│   ├── add_metadata_to_invites.sql       # Adicionar metadata a tabela existente
│   ├── cleanup_invites.sql               # Limpeza e manutenção
│   └── seed_invites_example.sql          # Dados de exemplo para testes
├── README.md                              # Documentação completa
└── QUICKSTART.md                          # Guia rápido de setup
```

## 🚀 Como Executar

### Opção 1: Supabase Dashboard

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Crie uma **New Query**
4. Copie e cole o conteúdo do arquivo SQL
5. Clique em **Run**

### Opção 2: Supabase CLI

```bash
# Executar migração via CLI
supabase db execute --file database/migrations/create_invites_table.sql

# Ou conectar diretamente ao banco
psql $DATABASE_URL -f database/migrations/create_invites_table.sql
```

### Opção 3: psql (PostgreSQL)

```bash
# Conectar ao banco
psql -h db.xxxxxxxxx.supabase.co -U postgres -d postgres

# Executar o script
\i database/migrations/create_invites_table.sql
```

## 📋 Scripts Disponíveis

### ⭐ 0. `00_setup_complete.sql` (RECOMENDADO)

**Quando usar:** Primeira vez configurando a tabela invites.

**O que faz:**
- ✅ Setup completo em um único arquivo
- ✅ Cria tabela, índices, triggers, RLS e policies
- ✅ Função de limpeza automática
- ✅ Verificação automática da instalação
- ✅ Relatório de sucesso/erros
- ✅ Safe para executar múltiplas vezes (usa IF NOT EXISTS)

**Este é o jeito mais fácil de começar! Execute apenas este script.**

### 1. `create_invites_table.sql`

**Quando usar:** Se a tabela `invites` NÃO existe ainda.

**O que faz:**
- ✅ Cria tabela `invites` completa
- ✅ Adiciona índices para performance
- ✅ Configura Row Level Security (RLS)
- ✅ Cria políticas de acesso
- ✅ Adiciona comentários de documentação
- ✅ Cria trigger para `updated_at`

### 2. `add_metadata_to_invites.sql`

**Quando usar:** Se a tabela `invites` JÁ existe e você quer adicionar o campo `metadata`.

**O que faz:**
- ✅ Adiciona coluna `metadata` (JSONB)
- ✅ Adiciona coluna `updated_at`
- ✅ Atualiza constraint de status
- ✅ Marca convites expirados automaticamente

### 3. `cleanup_invites.sql`

**Quando usar:** Para manutenção periódica do banco de dados.

**O que faz:**
- ✅ Marca convites expirados automaticamente
- ✅ Lista estatísticas de convites
- ✅ Remove convites antigos (cancelados/expirados com +30 dias)
- ✅ Função auxiliar `cleanup_old_invites()`
- ✅ Opção de criar job automático com pg_cron

### 4. `seed_invites_example.sql`

**Quando usar:** Em ambiente de desenvolvimento/teste para criar dados de exemplo.

**O que faz:**
- ✅ Cria 6 convites de exemplo:
  - Admin pendente (org)
  - Gerente pendente (workspace)
  - Atendente pendente (workspace)
  - Convite expirado (para testar reenvio)
  - Convite aceito (histórico)
  - Convite cancelado
- ✅ Exibe links de convite para testes
- ✅ Lista todos os convites criados

⚠️ **Atenção:** Apenas para desenvolvimento! Não execute em produção.

## 🗃️ Estrutura da Tabela `invites`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do convite (PK) |
| `organization_id` | UUID | Referência à organização (FK) |
| `workspace_id` | UUID | Referência ao workspace (FK, opcional) |
| `email` | TEXT | Email do convidado |
| `role` | TEXT | Nível de acesso (admin, manager, agent) |
| `status` | TEXT | Status (pending, accepted, expired, cancelled) |
| `invited_by` | UUID | Usuário que criou o convite (FK) |
| `metadata` | JSONB | Dados adicionais (nome, telefone, etc) |
| `expires_at` | TIMESTAMPTZ | Data de expiração |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

## 📊 Índices Criados

```sql
idx_invites_organization_id    -- Busca por organização
idx_invites_workspace_id        -- Busca por workspace
idx_invites_email               -- Busca por email
idx_invites_status              -- Filtro por status
idx_invites_expires_at          -- Ordenação/filtro por expiração
idx_invites_invited_by          -- Busca por criador
idx_invites_org_status          -- Composto (org + status)
```

## 🔒 Políticas RLS

### Visualização (SELECT)
Usuários podem ver convites da organização onde são membros.

### Criação (INSERT)
Apenas admins/owners podem criar convites.

### Atualização (UPDATE)
Apenas admins/owners podem atualizar convites.

### Remoção (DELETE)
Apenas admins/owners podem deletar convites.

## 🧪 Validação da Instalação

Execute estes comandos no SQL Editor para validar:

```sql
-- 1. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'invites';

-- 2. Verificar colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invites';

-- 3. Verificar índices
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'invites';

-- 4. Verificar políticas RLS
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'invites';

-- 5. Teste de inserção (deve funcionar se você for admin)
INSERT INTO invites (
  organization_id,
  email,
  role,
  status,
  invited_by,
  expires_at,
  metadata
) VALUES (
  'YOUR_ORG_ID',
  'test@example.com',
  'admin',
  'pending',
  auth.uid(),
  NOW() + INTERVAL '7 days',
  '{"nome": "Teste", "telefone": "44999999999"}'::jsonb
);

-- 6. Limpar teste
DELETE FROM invites WHERE email = 'test@example.com';
```

## 🔄 Ordem de Execução

Se você está configurando do zero:

1. **Primeiro**: Criar tabelas base (organizations, users, workspaces)
2. **Depois**: Criar tabela `invites` com `create_invites_table.sql`

Se a tabela já existe:

1. Executar `add_metadata_to_invites.sql` para adicionar campos novos

## ⚠️ Avisos Importantes

### Dependências

A tabela `invites` depende de:
- ✅ `organizations` (organization_id)
- ✅ `workspaces` (workspace_id)
- ✅ `users` (invited_by)
- ✅ `auth.uid()` (Supabase Auth)

Certifique-se que estas tabelas existem antes de criar `invites`.

### Row Level Security (RLS)

O RLS está **habilitado** por padrão. Se você estiver testando via API com service_role key, o RLS será ignorado. Para testes com usuários reais, certifique-se de que:
- O usuário está autenticado
- O usuário é membro da organização
- O usuário tem role de admin/owner

### Metadata JSONB

O campo `metadata` armazena:

```json
{
  "nome": "João Silva",
  "telefone": "44991807473",
  "is_organization_user": true
}
```

Você pode consultar/filtrar por campos dentro do JSON:

```sql
-- Buscar convites de usuários organizacionais
SELECT * FROM invites 
WHERE metadata->>'is_organization_user' = 'true';

-- Buscar por nome
SELECT * FROM invites 
WHERE metadata->>'nome' ILIKE '%João%';
```

## 📝 Exemplo de Uso

```sql
-- Criar convite
INSERT INTO invites (
  organization_id,
  workspace_id,
  email,
  role,
  invited_by,
  expires_at,
  metadata
) VALUES (
  'org-uuid',
  'workspace-uuid',
  'novo.usuario@empresa.com',
  'manager',
  auth.uid(),
  NOW() + INTERVAL '7 days',
  '{"nome": "Novo Usuário", "telefone": "44999999999", "is_organization_user": false}'::jsonb
);

-- Buscar convites pendentes
SELECT * FROM invites 
WHERE organization_id = 'org-uuid' 
  AND status = 'pending'
  AND expires_at > NOW();

-- Marcar convite como aceito
UPDATE invites 
SET status = 'accepted' 
WHERE id = 'invite-uuid';

-- Reenviar convite (criar novo)
-- 1. Marcar antigo como expirado
UPDATE invites SET status = 'expired' WHERE id = 'old-invite-uuid';

-- 2. Criar novo
INSERT INTO invites (organization_id, email, role, invited_by, expires_at, metadata)
SELECT organization_id, email, role, auth.uid(), NOW() + INTERVAL '7 days', metadata
FROM invites WHERE id = 'old-invite-uuid';
```

## 🆘 Troubleshooting

### Erro: "relation invites does not exist"
**Solução**: Execute `create_invites_table.sql`

### Erro: "column metadata does not exist"
**Solução**: Execute `add_metadata_to_invites.sql`

### Erro: "permission denied for table invites"
**Solução**: Verifique RLS policies ou use service_role key

### Erro: "violates foreign key constraint"
**Solução**: Certifique-se que organization_id e user_id existem nas tabelas referenciadas

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

