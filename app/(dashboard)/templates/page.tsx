import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Trash2, Copy } from "lucide-react";

export default async function TemplatesPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock templates
  const templates = [
    {
      id: 1,
      name: "Boas-vindas",
      category: "Automação",
      message: "Olá! Bem-vindo(a) à nossa empresa. Como podemos ajudar você hoje?",
      uses: 245,
    },
    {
      id: 2,
      name: "Confirmação de Pedido",
      category: "E-commerce",
      message: "Seu pedido #{{numero}} foi confirmado! Previsão de entrega: {{data}}.",
      uses: 189,
    },
    {
      id: 3,
      name: "Lembrete de Pagamento",
      category: "Cobrança",
      message: "Olá {{nome}}, identificamos um pagamento pendente. Acesse: {{link}}",
      uses: 156,
    },
    {
      id: 4,
      name: "Agendamento Confirmado",
      category: "Serviços",
      message: "Seu agendamento foi confirmado para {{data}} às {{hora}}. Local: {{endereco}}",
      uses: 134,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Mensagens</h1>
          <p className="text-muted-foreground">
            Crie e gerencie modelos de mensagens reutilizáveis
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mais Usado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Boas-vindas</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">724</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Templates</CardTitle>
          <CardDescription>Gerencie seus modelos de mensagens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {template.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usado {template.uses} vezes
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dica */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Dica: Use Variáveis</h4>
              <p className="text-sm text-muted-foreground">
                Use variáveis como <code className="px-1.5 py-0.5 rounded bg-background">
                  {`{{nome}}`}
                </code>, <code className="px-1.5 py-0.5 rounded bg-background">
                  {`{{data}}`}
                </code> ou <code className="px-1.5 py-0.5 rounded bg-background">
                  {`{{link}}`}
                </code> para personalizar suas mensagens automaticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

