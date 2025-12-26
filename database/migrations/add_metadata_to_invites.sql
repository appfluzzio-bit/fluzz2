-- Migração para adicionar campo metadata à tabela invites existente
-- Execute este script se a tabela invites já existir

-- Adicionar coluna metadata se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE invites ADD COLUMN metadata JSONB DEFAULT '{}';
    COMMENT ON COLUMN invites.metadata IS 'Dados adicionais do convite (JSON): nome, telefone, is_organization_user';
  END IF;
END $$;

-- Adicionar coluna updated_at se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE invites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    COMMENT ON COLUMN invites.updated_at IS 'Data e hora da última atualização';
  END IF;
END $$;

-- Adicionar novos estados ao status se não existirem
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_status_check;
ALTER TABLE invites ADD CONSTRAINT invites_status_check 
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'));

-- Criar trigger para updated_at se não existir
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

-- Atualizar convites expirados automaticamente
UPDATE invites 
SET status = 'expired' 
WHERE status = 'pending' 
  AND expires_at < NOW();

