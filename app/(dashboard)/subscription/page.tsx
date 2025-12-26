import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Assinatura - Fluzz",
};
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check } from "lucide-react";

export default async function SubscriptionPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e plano atual
        </p>
      </div>

      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>Seu plano ativo e detalhes de cobrança</CardDescription>
            </div>
            <Badge className="bg-primary">Premium</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Valor Mensal</p>
              <p className="text-2xl font-bold">R$ 99,00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
              <p className="text-lg font-semibold">22 de Janeiro, 2025</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Recursos Inclusos:</h4>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Workspaces ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Usuários ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Instâncias ilimitadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">Suporte prioritário</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Alterar Forma de Pagamento
            </Button>
            <Button variant="outline">Cancelar Assinatura</Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>Últimas transações da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Plano Premium - Dezembro 2024</p>
                <p className="text-sm text-muted-foreground">22 de Dezembro, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">R$ 99,00</p>
                <Badge variant="outline" className="text-xs">Pago</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Plano Premium - Novembro 2024</p>
                <p className="text-sm text-muted-foreground">22 de Novembro, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">R$ 99,00</p>
                <Badge variant="outline" className="text-xs">Pago</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

