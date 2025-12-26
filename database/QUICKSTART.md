# 🚀 Quickstart - Setup do Banco de Dados

Guia rápido para configurar a tabela de convites.

## ⚡ Setup Rápido (3 passos)

### 1️⃣ Acesse o Supabase Dashboard

```
https://app.supabase.com
```

Vá em: **SQL Editor** → **New Query**

### 2️⃣ Execute o Script de Criação

**Opção A (RECOMENDADA):** Setup completo em um arquivo

Copie e cole **TODO** o conteúdo de:
```
database/migrations/00_setup_complete.sql
```

Clique em **▶ Run**

Este script faz tudo automaticamente e verifica se funcionou! ✨

---

**Opção B:** Script individual

Se preferir, use:
```
database/migrations/create_invites_table.sql
```

### 3️⃣ Teste a Instalação

Execute este SQL para verificar:

```sql
-- Verificar tabela
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'invites';

-- Verificar colunas
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'invites' ORDER BY ordinal_position;
```

**Resultado esperado:** 10 colunas (id, organization_id, workspace_id, email, role, status, invited_by, metadata, expires_at, created_at, updated_at)

---

## 🧪 Adicionar Dados de Teste (Opcional)

Para testar o sistema com dados de exemplo:

```sql
-- Copie e cole o conteúdo de:
database/migrations/seed_invites_example.sql
```

Isso criará 6 convites de exemplo com diferentes estados.

---

## 🔧 Se a Tabela Já Existe

Se você já tem a tabela `invites` mas falta o campo `metadata`:

```sql
-- Execute:
database/migrations/add_metadata_to_invites.sql
```

---

## ✅ Checklist de Verificação

Após executar os scripts, verifique:

- [ ] Tabela `invites` existe
- [ ] 10 colunas presentes
- [ ] Campo `metadata` é tipo JSONB
- [ ] 7 índices criados
- [ ] 4 políticas RLS ativas
- [ ] Trigger `update_invites_updated_at` ativo

---

## 🔍 Comandos Úteis

### Ver todos os convites
```sql
SELECT id, email, role, status, expires_at 
FROM invites 
ORDER BY created_at DESC;
```

### Ver convites pendentes
```sql
SELECT id, email, role, expires_at 
FROM invites 
WHERE status = 'pending' 
  AND expires_at > NOW()
ORDER BY expires_at;
```

### Ver metadados dos convites
```sql
SELECT 
  email,
  metadata->>'nome' as nome,
  metadata->>'telefone' as telefone,
  metadata->>'is_organization_user' as is_org_user
FROM invites;
```

### Criar convite manualmente
```sql
INSERT INTO invites (
  organization_id,
  email,
  role,
  invited_by,
  expires_at,
  metadata
) VALUES (
  'YOUR_ORG_ID',
  'teste@empresa.com',
  'admin',
  auth.uid(),
  NOW() + INTERVAL '7 days',
  '{"nome": "Teste", "telefone": "44999999999", "is_organization_user": true}'::jsonb
);
```

---

## 🐛 Problemas Comuns

### Erro: "relation organizations does not exist"
**Causa:** Tabelas de dependência não existem  
**Solução:** Crie primeiro as tabelas: `organizations`, `workspaces`, `users`

### Erro: "permission denied"
**Causa:** RLS está bloqueando  
**Solução:** Use service_role key ou faça login como admin da organização

### Erro: "column metadata does not exist"
**Causa:** Tabela antiga sem o campo  
**Solução:** Execute `add_metadata_to_invites.sql`

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- 📄 `database/README.md` - Documentação completa
- 📄 `docs/FLUXO_CONVITES.md` - Fluxo de negócio

---

## 🆘 Suporte

Se algo não funcionar:

1. ✅ Verifique se você está logado no Supabase
2. ✅ Confirme que tem permissões de admin
3. ✅ Verifique os logs de erro no SQL Editor
4. ✅ Teste com `service_role` key (desabilita RLS)

---

## 🎯 Próximos Passos

Depois de configurar o banco:

1. ✅ Testar criar convite pela interface: `/team`
2. ✅ Copiar link do convite
3. ✅ Abrir link em aba anônima
4. ✅ Testar aceitar convite e criar senha
5. ✅ Verificar usuário criado em `users`

**Tudo funcionando?** 🎉 Você está pronto para usar o sistema de convites!

