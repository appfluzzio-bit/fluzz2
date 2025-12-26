import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Campanhas - Fluzz",
};
import { Send } from "lucide-react";

// TODO: Implement campaigns functionality
export default function CampanhasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campanhas de Mensagens</h1>
        <p className="text-muted-foreground">
          Gerencie suas campanhas de WhatsApp
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Send className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Em Desenvolvimento</h3>
          <p className="text-center text-sm text-muted-foreground">
            A funcionalidade de campanhas será implementada em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

