"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Workspace } from "@/types";

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
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
      localStorage.removeItem("currentWorkspaceId");
    }
  };

  // Load persisted workspace on mount
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0) {
      const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
      if (savedWorkspaceId) {
        const savedWorkspace = workspaces.find((w) => w.id === savedWorkspaceId);
        if (savedWorkspace) {
          setCurrentWorkspaceState(savedWorkspace);
        } else {
          setCurrentWorkspaceState(workspaces[0]);
        }
      } else {
        setCurrentWorkspaceState(workspaces[0]);
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

