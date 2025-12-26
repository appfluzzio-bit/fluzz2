-- Script de Limpeza/Manutenção da Tabela Invites
-- ⚠️ USE COM CUIDADO - APENAS EM DESENVOLVIMENTO/TESTE

-- ========================================
-- OPÇÕES DE LIMPEZA (Execute apenas o que precisar)
-- ========================================

-- 1. MARCAR CONVITES EXPIRADOS AUTOMATICAMENTE
-- Atualiza status de convites pendentes que já passaram da data de expiração
UPDATE invites 
SET status = 'expired',
    updated_at = NOW()
WHERE status = 'pending' 
  AND expires_at < NOW();

-- Resultado:
SELECT 
  COUNT(*) as convites_marcados_como_expirados
FROM invites 
WHERE status = 'expired' 
  AND updated_at > NOW() - INTERVAL '1 minute';


-- 2. LISTAR CONVITES PENDENTES E EXPIRADOS
SELECT 
  id,
  email,
  role,
  status,
  CASE 
    WHEN expires_at < NOW() THEN 'EXPIRADO'
    ELSE 'VÁLIDO'
  END as validade,
  expires_at,
  created_at,
  metadata->>'nome' as nome_convidado
FROM invites
WHERE status IN ('pending', 'expired')
ORDER BY created_at DESC;


-- 3. DELETAR CONVITES CANCELADOS ANTIGOS (mais de 30 dias)
-- ⚠️ Cuidado: Remove permanentemente do banco
DELETE FROM invites 
WHERE status = 'cancelled' 
  AND created_at < NOW() - INTERVAL '30 days';


-- 4. DELETAR CONVITES EXPIRADOS ANTIGOS (mais de 30 dias)
-- ⚠️ Cuidado: Remove permanentemente do banco
DELETE FROM invites 
WHERE status = 'expired' 
  AND expires_at < NOW() - INTERVAL '30 days';


-- 5. DELETAR TODOS OS CONVITES DE UM EMAIL ESPECÍFICO
-- Útil para limpar testes
-- ⚠️ Substitua o email antes de executar
DELETE FROM invites 
WHERE email = 'teste@example.com';


-- 6. RESETAR TODOS OS CONVITES (APENAS DESENVOLVIMENTO!)
-- ⚠️⚠️⚠️ NUNCA EXECUTE EM PRODUÇÃO ⚠️⚠️⚠️
-- TRUNCATE invites CASCADE;


-- 7. ESTATÍSTICAS DE CONVITES
SELECT 
  status,
  COUNT(*) as quantidade,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentual
FROM invites
GROUP BY status
ORDER BY quantidade DESC;


-- 8. CONVITES POR ORGANIZAÇÃO
SELECT 
  o.name as organizacao,
  COUNT(i.id) as total_convites,
  SUM(CASE WHEN i.status = 'pending' THEN 1 ELSE 0 END) as pendentes,
  SUM(CASE WHEN i.status = 'accepted' THEN 1 ELSE 0 END) as aceitos,
  SUM(CASE WHEN i.status = 'expired' THEN 1 ELSE 0 END) as expirados,
  SUM(CASE WHEN i.status = 'cancelled' THEN 1 ELSE 0 END) as cancelados
FROM invites i
JOIN organizations o ON i.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY total_convites DESC;


-- 9. CONVITES DUPLICADOS (mesmo email, mesma org, status pending)
SELECT 
  email,
  organization_id,
  COUNT(*) as quantidade_duplicados
FROM invites
WHERE status = 'pending'
GROUP BY email, organization_id
HAVING COUNT(*) > 1;


-- 10. REATIVAR CONVITES EXPIRADOS (estender validade)
-- ⚠️ Use apenas se necessário
-- UPDATE invites 
-- SET expires_at = NOW() + INTERVAL '7 days',
--     status = 'pending',
--     updated_at = NOW()
-- WHERE status = 'expired' 
--   AND email = 'usuario@example.com';


-- ========================================
-- FUNÇÃO AUXILIAR: Limpar convites antigos automaticamente
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_old_invites()
RETURNS void AS $$
BEGIN
  -- Marcar pendentes expirados
  UPDATE invites 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  -- Deletar cancelados com mais de 30 dias
  DELETE FROM invites 
  WHERE status = 'cancelled' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  -- Deletar expirados com mais de 30 dias
  DELETE FROM invites 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Limpeza de convites concluída';
END;
$$ LANGUAGE plpgsql;

-- Para executar a limpeza manualmente:
-- SELECT cleanup_old_invites();


-- ========================================
-- CRIAR JOB AUTOMÁTICO (pg_cron) - OPCIONAL
-- ========================================
-- Requer extensão pg_cron instalada
-- Execute isso no Supabase Dashboard > Database > Extensions

-- SELECT cron.schedule(
--   'cleanup-old-invites',
--   '0 2 * * *', -- Todo dia às 2h da manhã
--   'SELECT cleanup_old_invites();'
-- );

-- Para remover o job:
-- SELECT cron.unschedule('cleanup-old-invites');

