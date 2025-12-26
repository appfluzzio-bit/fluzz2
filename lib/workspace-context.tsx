"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Workspace } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({
  children,
  initialWorkspace,
  initialWorkspaces,
}: {
  children: React.ReactNode;
  initialWorkspace?: Workspace | null;
  initialWorkspaces?: Workspace[];
}) {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(
    initialWorkspace || null
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>(
    initialWorkspaces || []
  );

  // Persist workspace selection
  const setCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem("currentWorkspaceId", workspace.id);
    } else {
      // null significa "Todos" - salvar como string especial
      localStorage.setItem("currentWorkspaceId", "all");
    }
  };

  // Função para recarregar workspaces do banco
  const refreshWorkspaces = async () => {
    const supabase = createClient();
    
    try {
      // Pegar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pegar organização do usuário
      const { data: orgMember } = await (supabase
        .from("organization_members") as any)
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) return;

      // Buscar workspaces
      const { data: workspacesData } = await (supabase
        .from("workspaces") as any)
        .select("*")
        .eq("organization_id", (orgMember as any).organization_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (workspacesData) {
        setWorkspaces(workspacesData);
        
        // Se o workspace atual foi deletado, selecionar o primeiro disponível
        if (currentWorkspace && !workspacesData.find((w: any) => w.id === currentWorkspace.id)) {
          setCurrentWorkspaceState(workspacesData[0] || null);
        }
      }
    } catch (error) {
      console.error("Erro ao recarregar workspaces:", error);
    }
  };

  // Load persisted workspace on mount
  useEffect(() => {
    if (currentWorkspace === undefined && workspaces.length > 0) {
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
      if (savedWorkspaceId === "all") {
        // Usuário tinha "Todos" selecionado
        setCurrentWorkspaceState(null);
      } else if (savedWorkspaceId) {
        const savedWorkspace = workspaces.find((w) => w.id === savedWorkspaceId);
        if (savedWorkspace) {
          setCurrentWorkspaceState(savedWorkspace);
        } else {
          // Workspace salvo não existe mais, selecionar "Todos"
          setCurrentWorkspaceState(null);
        }
      } else {
        // Primeira vez, selecionar "Todos"
        setCurrentWorkspaceState(null);
      }
    }
  }, [workspaces, currentWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        setCurrentWorkspace,
        workspaces,
        setWorkspaces,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

