"use client";

import { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { LogOut, Settings, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { useSidebar } from "@/lib/sidebar-context";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { currentWorkspace } = useWorkspace();
  const { toggleSidebar } = useSidebar();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      if (!currentWorkspace?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        // Busca o saldo de créditos da organização
        const { data, error } = await supabase
          .from("credit_ledger")
          .select("amount")
          .eq("organization_id", currentWorkspace.organization_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching credits:", error);
          setLoading(false);
          return;
        }

        // Calcula o total de créditos (soma de todos os lançamentos)
        const total = data?.reduce((acc, item) => acc + item.amount, 0) || 0;
        setCredits(total);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();
  }, [currentWorkspace, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-6">
        {/* Créditos */}
        <div className="flex items-center gap-2 text-sm">
          {loading ? (
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <span className="text-muted-foreground">Créditos:</span>
              <span className="font-semibold text-primary">
                {credits.toLocaleString("pt-BR")}
              </span>
            </>
          )}
        </div>

        {/* Toggle de tema */}
        <ThemeToggle />

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {user.name?.split(" ")[0] || user.email.split("@")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

