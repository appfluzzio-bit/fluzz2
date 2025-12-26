# Fluxo de Convites de Usuários

## Visão Geral

O sistema de gerenciamento de usuários do Fluzz utiliza um fluxo de convites para adicionar novos usuários à plataforma. Este documento descreve o processo completo.

## Fluxo Completo

### 1. Criar Novo Usuário (Administrador)

**Localização**: `/team` → Botão "Adicionar Usuário"

**Campos do Formulário**:
- **Tipo de Usuário** (apenas para membros da organização):
  - Usuário da Organização: Acesso a todos os workspaces
  - Usuário de Workspace: Acesso apenas a workspace específico
  
- **Dados Pessoais**:
  - Nome Completo *
  - E-mail *
  - Telefone (máscara: (44)99180-7473, salvo sem máscara)

- **Nível de Acesso**:
  - Para Organização: Administrador ou Gerente
  - Para Workspace: Administrador, Gerente ou Atendente

- **Workspace** (se aplicável):
  - Seleção do workspace (apenas se não for usuário da organização)

### 2. Sistema Cria Convite

Ao submeter o formulário:
1. Sistema valida os dados
2. Verifica se o e-mail já existe
3. Cria um convite pendente na tabela `invites`
4. Armazena metadados (nome, telefone, tipo) no campo `metadata`
5. Define data de expiração (7 dias)
6. Gera link de convite: `/invite/[id]`

### 3. Usuário Acessa Link de Convite

**Localização**: `/invite/[id]`

**Página exibe**:
- Logo do Fluzz
- Nome da organização/workspace
- Nível de acesso
- E-mail do convite
- Formulário de senha

**Validações**:
- Convite deve estar pendente
- Convite não pode estar expirado
- E-mail não pode já existir no sistema

### 4. Usuário Define Senha

**Campos**:
- Senha (mínimo 6 caracteres)
- Confirmar Senha

**Ao submeter**:
1. Valida senha
2. Cria usuário no Supabase Auth
3. Cria registro na tabela `users` com nome e telefone
4. Adiciona a `organization_members` ou `workspace_members`
5. Se for membro da organização, adiciona a todos os workspaces
6. Marca convite como "accepted"
7. Faz login automático
8. Redireciona para `/dashboard`

## Regras de Negócio

### Tipos de Usuário

**Usuário da Organização**:
- Tem acesso a TODOS os workspaces automaticamente
- Níveis: Administrador ou Gerente (Proprietário é único)
- Criado apenas por administradores da organização

**Usuário de Workspace**:
- Tem acesso apenas ao(s) workspace(s) vinculado(s)
- Níveis: Administrador, Gerente ou Atendente
- Se criado por membro da organização: seleciona workspace
- Se criado por membro de workspace: vinculado ao mesmo workspace

### Permissões

**Admin/Owner da Organização**:
- Vê todos os usuários da organização e workspaces
- Pode criar usuários de organização ou workspace
- Pode escolher qualquer workspace

**Gerente/Admin de Workspace**:
- Vê apenas usuários do(s) seu(s) workspace(s)
- Pode criar apenas usuários de workspace
- Novo usuário é vinculado ao mesmo workspace

### Telefone

- Máscara visual: `(44)99180-7473`
- Armazenamento: apenas números `44991807473`
- Campo opcional

## Estrutura de Dados

### Tabela: invites

**Schema SQL:**
```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  workspace_id UUID REFERENCES workspaces(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Estrutura TypeScript:**
```typescript
{
  id: string;
  organization_id: string;
  workspace_id: string | null;
  email: string;
  role: string; // "admin", "manager", "agent"
  status: string; // "pending", "accepted", "expired", "cancelled"
  expires_at: string;
  invited_by: string;
  metadata: {
    nome: string;
    telefone: string | null;
    is_organization_user: boolean;
  };
  created_at: string;
  updated_at: string;
}
```

**Scripts SQL:**
- 📄 `/database/migrations/create_invites_table.sql` - Criar tabela do zero
- 📄 `/database/migrations/add_metadata_to_invites.sql` - Adicionar metadata à tabela existente
- 📄 `/database/migrations/cleanup_invites.sql` - Limpeza e manutenção
- 📄 `/database/README.md` - Documentação completa

### Fluxo de Criação de Usuário

```
Admin clica "Adicionar Usuário"
    ↓
Preenche formulário
    ↓
Sistema cria convite pendente
    ↓
Link gerado: /invite/[id]
    ↓
Usuário acessa link
    ↓
Define senha
    ↓
Conta criada + Login automático
    ↓
Redireciona para dashboard
```

## Componentes UI

### Botões Clicáveis (ao invés de Select)

**Tipo de Usuário**:
- Dois cards clicáveis lado a lado
- Visual moderno com ícones e descrições

**Nível de Acesso**:
- 2-3 botões (dependendo do tipo)
- Feedback visual ao selecionar

**Workspace**:
- Grid de botões com nome do workspace
- Ícone de building em cada botão

## Endpoints

### API Routes

**GET** `/api/invites/[id]`
- Retorna dados do convite
- Valida se está pendente e não expirado
- Retorna nome da organização/workspace

### Server Actions

**POST** `createUser` (team/actions.ts)
- Cria convite
- Valida permissões
- Armazena metadados

**POST** `acceptInvite` (invite/[id]/actions.ts)
- Cria usuário no Auth
- Cria registro em users
- Adiciona a memberships
- Login automático

## Gerenciamento de Convites

### Listagem de Convites

Na página `/team`, há uma seção "Convites Pendentes" que mostra:

**Para cada convite:**
- ✉️ Email do convidado
- 📋 Link completo do convite (`https://app.fluzz.io/invite/[id]`)
- 📋 Botão "Copiar" para copiar o link
- 🏢 Workspace/Organização e nível de acesso
- ⏰ Status (Pendente/Expirado) e data de expiração
- 🔄 Botão "Reenviar" (se expirado)
- ❌ Botão "Cancelar"

### Reenviar Convite

Quando um convite expira:
1. Admin clica em "Reenviar"
2. Sistema cancela (marca como "expired") o convite antigo
3. Cria um NOVO convite com novo ID
4. Nova data de expiração (+7 dias)
5. Link atualizado automaticamente na interface
6. Mantém todos os dados do convite original (email, role, metadata)

**Importante**: Cada reenvio gera um novo ID de convite!

### Cancelar Convite

- Marca o convite como "cancelled"
- Não deleta do banco (mantém histórico)
- Remove da listagem de pendentes

## Estados do Convite

- `pending`: Aguardando aceite
- `accepted`: Usuário aceitou e criou conta
- `expired`: Passou da data de expiração
- `cancelled`: Admin cancelou manualmente

## Melhorias Futuras

- [ ] Envio automático de e-mail com link de convite
- [x] Opção de reenviar convite
- [x] Dashboard de convites pendentes/expirados
- [ ] Notificações quando convite é aceito
- [ ] Personalização do e-mail de convite
- [ ] Histórico completo de convites

