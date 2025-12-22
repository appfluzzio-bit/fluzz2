import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

// TODO: Implement contacts functionality
export default function ContatosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contatos</h1>
        <p className="text-muted-foreground">
          Gerencie sua base de contatos
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Em Desenvolvimento</h3>
          <p className="text-center text-sm text-muted-foreground">
            A funcionalidade de contatos será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

