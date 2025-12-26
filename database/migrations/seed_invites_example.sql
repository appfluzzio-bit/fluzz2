-- Script de Exemplo/Seed para Tabela Invites
-- ⚠️ APENAS PARA DESENVOLVIMENTO/TESTE

-- Este script cria convites de exemplo para facilitar testes
-- Substitua os UUIDs pelos IDs reais da sua base antes de executar

-- ========================================
-- VARIÁVEIS (SUBSTITUA PELOS SEUS IDs)
-- ========================================

-- Obter seu organization_id
-- SELECT id FROM organizations LIMIT 1;
DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
  v_workspace_id UUID;
BEGIN
  -- Buscar organização, usuário e workspace para usar nos exemplos
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_user_id FROM users LIMIT 1;
  SELECT id INTO v_workspace_id FROM workspaces LIMIT 1;

  -- Verificar se encontrou os dados necessários
  IF v_org_id IS NULL OR v_user_id IS NULL THEN
    RAISE EXCEPTION 'Não foi possível encontrar organização ou usuário. Execute este script manualmente com IDs específicos.';
  END IF;

  -- Exibir IDs encontrados
  RAISE NOTICE 'Organization ID: %', v_org_id;
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Workspace ID: %', v_workspace_id;

  -- ========================================
  -- CONVITES DE EXEMPLO
  -- ========================================

  -- 1. Convite pendente para usuário da organização
  INSERT INTO invites (
    organization_id,
    workspace_id,
    email,
    role,
    status,
    invited_by,
    expires_at,
    metadata
  ) VALUES (
    v_org_id,
    NULL, -- NULL = usuário da organização inteira
    'admin.teste@empresa.com',
    'admin',
    'pending',
    v_user_id,
    NOW() + INTERVAL '7 days',
    jsonb_build_object(
      'nome', 'Administrador Teste',
      'telefone', '44991234567',
      'is_organization_user', true
    )
  );

  -- 2. Convite pendente para gerente de workspace
  IF v_workspace_id IS NOT NULL THEN
    INSERT INTO invites (
      organization_id,
      workspace_id,
      email,
      role,
      status,
      invited_by,
      expires_at,
      metadata
    ) VALUES (
      v_org_id,
      v_workspace_id,
      'gerente.vendas@empresa.com',
      'manager',
      'pending',
      v_user_id,
      NOW() + INTERVAL '5 days',
      jsonb_build_object(
        'nome', 'Gerente de Vendas',
        'telefone', '44997654321',
        'is_organization_user', false
      )
    );
  END IF;

  -- 3. Convite pendente para atendente
  IF v_workspace_id IS NOT NULL THEN
    INSERT INTO invites (
      organization_id,
      workspace_id,
      email,
      role,
      status,
      invited_by,
      expires_at,
      metadata
    ) VALUES (
      v_org_id,
      v_workspace_id,
      'atendente.suporte@empresa.com',
      'agent',
      'pending',
      v_user_id,
      NOW() + INTERVAL '3 days',
      jsonb_build_object(
        'nome', 'Atendente Suporte',
        'telefone', '44998765432',
        'is_organization_user', false
      )
    );
  END IF;

  -- 4. Convite EXPIRADO (para testar reenvio)
  INSERT INTO invites (
    organization_id,
    workspace_id,
    email,
    role,
    status,
    invited_by,
    expires_at,
    metadata
  ) VALUES (
    v_org_id,
    NULL,
    'usuario.expirado@empresa.com',
    'manager',
    'expired',
    v_user_id,
    NOW() - INTERVAL '2 days', -- Expirado há 2 dias
    jsonb_build_object(
      'nome', 'Usuário Expirado',
      'telefone', '44999887766',
      'is_organization_user', true
    )
  );

  -- 5. Convite ACEITO (para histórico)
  INSERT INTO invites (
    organization_id,
    workspace_id,
    email,
    role,
    status,
    invited_by,
    expires_at,
    metadata
  ) VALUES (
    v_org_id,
    NULL,
    'usuario.aceito@empresa.com',
    'admin',
    'accepted',
    v_user_id,
    NOW() + INTERVAL '7 days',
    jsonb_build_object(
      'nome', 'Usuário Aceito',
      'telefone', '44999112233',
      'is_organization_user', true
    )
  );

  -- 6. Convite CANCELADO
  INSERT INTO invites (
    organization_id,
    workspace_id,
    email,
    role,
    status,
    invited_by,
    expires_at,
    metadata
  ) VALUES (
    v_org_id,
    NULL,
    'usuario.cancelado@empresa.com',
    'manager',
    'cancelled',
    v_user_id,
    NOW() + INTERVAL '7 days',
    jsonb_build_object(
      'nome', 'Usuário Cancelado',
      'telefone', '44999445566',
      'is_organization_user', true
    )
  );

  RAISE NOTICE 'Convites de exemplo criados com sucesso!';
  RAISE NOTICE 'Execute: SELECT * FROM invites ORDER BY created_at DESC;';

END $$;

-- ========================================
-- VERIFICAR CONVITES CRIADOS
-- ========================================

SELECT 
  id,
  email,
  role,
  status,
  workspace_id IS NULL as is_org_user,
  CASE 
    WHEN expires_at < NOW() AND status = 'pending' THEN 'ATENÇÃO: Expirado mas status pending'
    WHEN expires_at < NOW() THEN 'Expirado'
    ELSE 'Válido'
  END as validade,
  expires_at,
  metadata->>'nome' as nome,
  metadata->>'telefone' as telefone,
  created_at
FROM invites
ORDER BY created_at DESC;

-- ========================================
-- EXEMPLOS DE LINKS DE CONVITE
-- ========================================

DO $$
DECLARE
  rec RECORD;
  base_url TEXT := 'http://localhost:3000'; -- Ou sua URL de produção
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'LINKS DE CONVITE PARA TESTE:';
  RAISE NOTICE '========================================';
  
  FOR rec IN 
    SELECT id, email, status 
    FROM invites 
    WHERE status = 'pending'
    ORDER BY created_at DESC
    LIMIT 5
  LOOP
    RAISE NOTICE '';
    RAISE NOTICE 'Email: %', rec.email;
    RAISE NOTICE 'Status: %', rec.status;
    RAISE NOTICE 'Link: %/invite/%', base_url, rec.id;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

