import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Whatsapp - Fluzz",
};
import { Zap } from "lucide-react";

// TODO: Implement WhatsApp instances functionality
export default function InstanciasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Instâncias WhatsApp</h1>
        <p className="text-muted-foreground">
          Gerencie suas conexões com WhatsApp
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Zap className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Em Desenvolvimento</h3>
          <p className="text-center text-sm text-muted-foreground">
            A funcionalidade de instâncias será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

