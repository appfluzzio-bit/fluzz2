# 📊 Índice - Database Invites

Guia completo para setup e gerenciamento da tabela de convites.

## 🚀 Começando

**Novo no projeto?** Comece aqui:

1. 📖 [**QUICKSTART.md**](QUICKSTART.md) - Setup em 3 minutos
2. 📄 [**README.md**](README.md) - Documentação completa
3. 📘 [**docs/FLUXO_CONVITES.md**](../docs/FLUXO_CONVITES.md) - Fluxo de negócio

## 📁 Scripts SQL

### Para Setup Inicial

| Script | Quando Usar | O Que Faz |
|--------|-------------|-----------|
| [**00_setup_complete.sql**](migrations/00_setup_complete.sql) ⭐ | **Primeira vez** | Setup completo com verificação automática |
| [create_invites_table.sql](migrations/create_invites_table.sql) | Tabela não existe | Cria tabela, índices e RLS |
| [add_metadata_to_invites.sql](migrations/add_metadata_to_invites.sql) | Tabela já existe | Adiciona campo metadata |

### Para Manutenção

| Script | Quando Usar | O Que Faz |
|--------|-------------|-----------|
| [cleanup_invites.sql](migrations/cleanup_invites.sql) | Manutenção periódica | Limpa convites antigos |
| [seed_invites_example.sql](migrations/seed_invites_example.sql) | Desenvolvimento | Cria dados de teste |

## 🎯 Fluxos Comuns

### Primeira Instalação

```
1. Abra Supabase Dashboard
2. SQL Editor → New Query
3. Execute: 00_setup_complete.sql
4. Pronto! ✓
```

### Atualizar Tabela Existente

```
1. Backup da tabela (opcional)
2. Execute: add_metadata_to_invites.sql
3. Verifique com: SELECT * FROM invites LIMIT 1;
```

### Criar Dados de Teste

```
1. Execute: seed_invites_example.sql
2. Copie os links gerados
3. Teste na aplicação
```

### Limpeza Periódica

```
1. Execute: cleanup_invites.sql
2. Ou crie job automático (ver script)
```

## 📚 Estrutura da Tabela

```sql
invites (
  id              UUID PRIMARY KEY
  organization_id UUID NOT NULL
  workspace_id    UUID
  email           TEXT NOT NULL
  role            TEXT NOT NULL
  status          TEXT NOT NULL
  invited_by      UUID NOT NULL
  metadata        JSONB
  expires_at      TIMESTAMPTZ NOT NULL
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
)
```

### Campos Importantes

- **metadata**: Armazena nome, telefone e tipo de usuário (JSONB)
- **status**: `pending`, `accepted`, `expired`, `cancelled`
- **workspace_id**: NULL = usuário da organização inteira

## 🔍 Queries Úteis

### Ver todos os convites

```sql
SELECT id, email, role, status, expires_at 
FROM invites 
ORDER BY created_at DESC;
```

### Convites pendentes

```sql
SELECT * FROM invites 
WHERE status = 'pending' 
  AND expires_at > NOW();
```

### Estatísticas

```sql
SELECT status, COUNT(*) 
FROM invites 
GROUP BY status;
```

### Buscar por nome no metadata

```sql
SELECT email, metadata->>'nome' as nome
FROM invites 
WHERE metadata->>'nome' ILIKE '%João%';
```

## 🔧 Manutenção

### Marcar Expirados

```sql
UPDATE invites 
SET status = 'expired' 
WHERE status = 'pending' 
  AND expires_at < NOW();
```

### Limpar Antigos

```sql
DELETE FROM invites 
WHERE status IN ('expired', 'cancelled')
  AND created_at < NOW() - INTERVAL '30 days';
```

### Função Automática

```sql
SELECT cleanup_old_invites();
```

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Tabela não existe | Execute `00_setup_complete.sql` |
| Campo metadata faltando | Execute `add_metadata_to_invites.sql` |
| Permission denied | Verifique RLS ou use service_role |
| Foreign key error | Verifique se org/user/workspace existem |

## 📖 Documentação Relacionada

- [QUICKSTART.md](QUICKSTART.md) - Setup rápido
- [README.md](README.md) - Documentação completa
- [../docs/FLUXO_CONVITES.md](../docs/FLUXO_CONVITES.md) - Regras de negócio
- [Supabase Docs](https://supabase.com/docs)

## 🎓 Recursos de Aprendizado

### SQL
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

### Supabase
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Triggers](https://supabase.com/docs/guides/database/triggers)

## ✅ Checklist de Verificação

Após setup, verifique:

- [ ] Tabela `invites` existe
- [ ] 10 colunas presentes
- [ ] Campo `metadata` é JSONB
- [ ] 7+ índices criados
- [ ] 4 políticas RLS ativas
- [ ] Trigger `updated_at` funciona
- [ ] Função `cleanup_old_invites()` existe
- [ ] Teste de INSERT funciona
- [ ] Teste de SELECT funciona

## 🆘 Precisa de Ajuda?

1. Consulte o [QUICKSTART.md](QUICKSTART.md)
2. Leia o [README.md](README.md)
3. Verifique os [docs/FLUXO_CONVITES.md](../docs/FLUXO_CONVITES.md)
4. Teste com dados de exemplo: `seed_invites_example.sql`

---

**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0

