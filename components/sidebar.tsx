"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Send,
  Users,
  Building2,
  MessageSquare,
  ChevronDown,
  CreditCard,
  FileText,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/lib/workspace-context";
import { useSidebar } from "@/lib/sidebar-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Ícone do WhatsApp em SVG
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Campanhas",
    href: "/campanhas",
    icon: Send,
  },
  {
    name: "Contatos",
    href: "/contatos",
    icon: Users,
  },
  {
    name: "Whatsapp",
    href: "/instancias",
    icon: "whatsapp" as any, // Custom icon
  },
];

const settings = [
  {
    name: "Workspaces",
    href: "/workspaces",
    icon: Building2,
  },
  {
    name: "Departamentos",
    href: "/departments",
    icon: Layers,
  },
  {
    name: "Usuários",
    href: "/team",
    icon: Users,
  },
  {
    name: "Assinatura",
    href: "/subscription",
    icon: CreditCard,
  },
  {
    name: "Templates de Mensagens",
    href: "/templates",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { isExpanded } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
      isExpanded ? "w-64" : "w-20"
    )}>
      {/* Logo alinhada à esquerda */}
      <div className={cn(
        "flex h-24 items-center py-6 transition-all duration-300",
        isExpanded ? "px-6" : "px-4 justify-center"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2 relative">
          {isExpanded ? (
            <div className="relative w-[130px] h-[44px]">
              <Image
                src="/images/fluzz-logo1-painel.png"
                alt="Fluzz"
                width={130}
                height={44}
                priority
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  mounted && theme === "light" ? "opacity-0" : "opacity-100"
                )}
              />
              <Image
                src="/images/fluzz-logo2.png"
                alt="Fluzz"
                width={130}
                height={44}
                priority
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  mounted && theme === "light" ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          ) : (
            <Image
              src="/images/fluzz-icone-painel.png"
              alt="Fluzz"
              width={40}
              height={40}
              priority
              className="transition-opacity duration-300"
            />
          )}
        </Link>
      </div>
      
      {/* Linha verde sutil */}
      {isExpanded && (
        <div className="px-6 pb-4">
          <div className="h-px w-full bg-primary/20" />
        </div>
      )}

      {/* Workspace Switcher - só aparece se tiver mais de 1 workspace e sidebar expandida */}
      {workspaces.length > 1 && isExpanded && (
        <div className="px-4 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center justify-between rounded-xl bg-primary/10 dark:bg-primary/5 px-4 py-3 hover:bg-primary/15 dark:hover:bg-primary/10 transition-all duration-200 border border-primary/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-lg bg-primary/20">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-primary" />
                  </div>
                  <span className="text-sm font-semibold truncate text-foreground">
                    {currentWorkspace?.name || "Workspace"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-primary" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => setCurrentWorkspace(workspace)}
                  className={cn(
                    "cursor-pointer",
                    currentWorkspace?.id === workspace.id && "bg-primary/10 text-primary"
                  )}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  {workspace.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Navigation - layout mais moderno */}
      <nav className="flex-1 py-2 space-y-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon === "whatsapp" ? WhatsAppIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 py-3.5 text-sm font-medium transition-all duration-200",
                  isExpanded ? "pl-6" : "pl-0 justify-center",
                  isActive
                    ? "text-white"
                    : "text-foreground/60 hover:text-foreground hover:bg-accent/50"
                )}
                title={!isExpanded ? item.name : undefined}
              >
                {/* Degradê verde no background quando ativo - largura total com borda esquerda destacada */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                  </>
                )}
                
                {item.icon === "whatsapp" ? (
                  <WhatsAppIcon className="h-5 w-5 flex-shrink-0 relative z-10" />
                ) : (
                  <Icon className="h-5 w-5 flex-shrink-0 relative z-10" />
                )}
                {isExpanded && <span className="flex-1 relative z-10">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Separador mais sutil */}
        <div className="relative px-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
        </div>

        <div className="space-y-1">
          {isExpanded && (
            <div className="px-7 py-2 pt-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Configurações
            </div>
          )}
          {settings.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 py-3.5 text-sm font-medium transition-all duration-200",
                  isExpanded ? "pl-6" : "pl-0 justify-center",
                  isActive
                    ? "text-white"
                    : "text-foreground/60 hover:text-foreground hover:bg-accent/50"
                )}
                title={!isExpanded ? item.name : undefined}
              >
                {/* Degradê verde no background quando ativo - largura total com borda esquerda destacada */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                  </>
                )}
                
                <Icon className="h-5 w-5 flex-shrink-0 relative z-10" />
                {isExpanded && <span className="flex-1 relative z-10">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

