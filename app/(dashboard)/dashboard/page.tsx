import { Metadata } from "next";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard - Fluzz",
};
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  CreditCard,
  Send,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Get user's organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organizations(*)")
    .eq("user_id", user.id)
    .single();

  const organization = orgMember?.organizations as any;

  // Get workspaces count
  const { count: workspacesCount } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organization?.id);

  // Get credit wallet
  const { data: wallet } = await supabase
    .from("credit_wallets")
    .select("*")
    .eq("organization_id", organization?.id)
    .single();

  // Get recent credit transactions
  const { data: recentTransactions } = await supabase
    .from("credit_ledger")
    .select("*")
    .eq("organization_id", organization?.id || "")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get subscription
  const { data: subscription } = await supabase
    .from("organization_subscriptions")
    .select("*, plans(*)")
    .eq("organization_id", organization?.id)
    .eq("status", "active")
    .single();

  // Mock data for campaigns (TODO: implement when campaigns are ready)
  const campaignsCount = 0;
  const contactsCount = 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta, {user.name}! Aqui está um resumo das suas
          atividades.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organização</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {workspacesCount || 0} workspace(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.balance || 0}</div>
            <p className="text-xs text-muted-foreground">
              Saldo disponível para envios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription ? (subscription.plans as any)?.name : "Gratuito"}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription ? "Ativo" : "Sem assinatura"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignsCount}</div>
            <p className="text-xs text-muted-foreground">
              Campanhas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/campanhas/new"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent"
            >
              <Send className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Nova Campanha</div>
                <div className="text-xs text-muted-foreground">
                  Criar uma nova campanha de mensagens
                </div>
              </div>
            </a>

            <a
              href="/contatos/new"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Adicionar Contatos</div>
                <div className="text-xs text-muted-foreground">
                  Importar ou adicionar novos contatos
                </div>
              </div>
            </a>

            <a
              href="/workspaces"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent"
            >
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Gerenciar Workspaces</div>
                <div className="text-xs text-muted-foreground">
                  Criar e organizar seus workspaces
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações de Créditos</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {transaction.type} - {transaction.reference_type || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

