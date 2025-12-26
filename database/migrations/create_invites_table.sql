-- Tabela de Convites
-- Armazena convites para novos usuários se juntarem à organização ou workspaces

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

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_invites_organization_id ON invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_invites_workspace_id ON invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by);

-- Índice composto para buscar convites pendentes de uma organização
CREATE INDEX IF NOT EXISTS idx_invites_org_status ON invites(organization_id, status);

-- Comentários para documentação
COMMENT ON TABLE invites IS 'Convites para novos usuários se juntarem à organização ou workspaces específicos';
COMMENT ON COLUMN invites.id IS 'ID único do convite (UUID)';
COMMENT ON COLUMN invites.organization_id IS 'ID da organização que está convidando';
COMMENT ON COLUMN invites.workspace_id IS 'ID do workspace específico (NULL se for convite para organização inteira)';
COMMENT ON COLUMN invites.email IS 'Email do usuário convidado';
COMMENT ON COLUMN invites.role IS 'Nível de acesso: admin, manager, agent, owner';
COMMENT ON COLUMN invites.status IS 'Status do convite: pending, accepted, expired, cancelled';
COMMENT ON COLUMN invites.invited_by IS 'ID do usuário que criou o convite';
COMMENT ON COLUMN invites.metadata IS 'Dados adicionais do convite (JSON): nome, telefone, is_organization_user';
COMMENT ON COLUMN invites.expires_at IS 'Data e hora de expiração do convite';
COMMENT ON COLUMN invites.created_at IS 'Data e hora de criação do convite';
COMMENT ON COLUMN invites.updated_at IS 'Data e hora da última atualização';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_invites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_invites_updated_at();

-- Política de segurança RLS (Row Level Security)
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver convites da sua organização
CREATE POLICY "Users can view invites from their organization"
  ON invites FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Apenas admins podem criar convites
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

-- Apenas admins podem atualizar convites
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

-- Apenas admins podem deletar convites
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

