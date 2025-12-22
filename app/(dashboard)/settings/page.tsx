import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/auth";

// TODO: Implement full settings functionality
export default async function SettingsPage() {
  const user = await getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Informações da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium">Nome</div>
            <div className="text-sm text-muted-foreground">
              {user?.name || "Não informado"}
            </div>
          </div>
          <Separator />
          <div>
            <div className="text-sm font-medium">E-mail</div>
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="mb-2 text-lg font-semibold">Em Desenvolvimento</h3>
          <p className="text-center text-sm text-muted-foreground">
            Mais configurações serão adicionadas em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

