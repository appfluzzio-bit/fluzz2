-- ========================================
-- SETUP COMPLETO - TABELA INVITES
-- ========================================
-- Este script faz o setup completo da tabela invites
-- Execute APENAS UMA VEZ no início do projeto
-- ========================================

-- Criar tabela invites
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invites_organization_id ON invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_invites_workspace_id ON invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_invites_org_status ON invites(organization_id, status);

-- Comentários
COMMENT ON TABLE invites IS 'Convites para novos usuários';
COMMENT ON COLUMN invites.metadata IS 'Dados adicionais (JSON): nome, telefone, is_organization_user';

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_invites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_invites_updated_at ON invites;
CREATE TRIGGER trigger_update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_invites_updated_at();

-- RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view invites from their organization" ON invites;
CREATE POLICY "Users can view invites from their organization"
  ON invites FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can create invites" ON invites;
CREATE POLICY "Admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND organization_id = invites.organization_id
        AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update invites" ON invites;
CREATE POLICY "Admins can update invites"
  ON invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND organization_id = invites.organization_id
        AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete invites" ON invites;
CREATE POLICY "Admins can delete invites"
  ON invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM organization_members 
      WHERE user_id = auth.uid() 
        AND organization_id = invites.organization_id
        AND role IN ('owner', 'admin')
    )
  );

-- Função de limpeza automática
CREATE OR REPLACE FUNCTION cleanup_old_invites()
RETURNS void AS $$
BEGIN
  -- Marcar pendentes expirados
  UPDATE invites 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  -- Deletar cancelados antigos
  DELETE FROM invites 
  WHERE status = 'cancelled' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  -- Deletar expirados antigos
  DELETE FROM invites 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Limpeza de convites concluída';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

DO $$
DECLARE
  table_count INTEGER;
  column_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Verificar tabela
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_name = 'invites';
  
  -- Verificar colunas
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'invites';
  
  -- Verificar índices
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE tablename = 'invites';
  
  -- Verificar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'invites';
  
  -- Relatório
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO DE INSTALAÇÃO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabela invites: % (esperado: 1)', CASE WHEN table_count = 1 THEN '✓ OK' ELSE '✗ ERRO' END;
  RAISE NOTICE 'Colunas: % (esperado: 10)', CASE WHEN column_count = 10 THEN '✓ OK' ELSE '✗ ATENÇÃO' END;
  RAISE NOTICE 'Índices: % (esperado: 7+)', CASE WHEN index_count >= 7 THEN '✓ OK' ELSE '✗ ATENÇÃO' END;
  RAISE NOTICE 'Políticas RLS: % (esperado: 4)', CASE WHEN policy_count = 4 THEN '✓ OK' ELSE '✗ ATENÇÃO' END;
  RAISE NOTICE '========================================';
  
  IF table_count = 1 AND column_count >= 10 AND index_count >= 7 AND policy_count = 4 THEN
    RAISE NOTICE '✓ INSTALAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Acesse /team na aplicação';
    RAISE NOTICE '2. Clique em "Adicionar Usuário"';
    RAISE NOTICE '3. Preencha o formulário e envie';
    RAISE NOTICE '4. Copie o link do convite gerado';
    RAISE NOTICE '5. Teste aceitar o convite';
  ELSE
    RAISE NOTICE '✗ ATENÇÃO: Verificar possíveis problemas acima';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- Mostrar estrutura da tabela
\d invites

-- Listar políticas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'invites';

