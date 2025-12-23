"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    document.title = "Criar Organização - Fluzz";
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!organizationName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da organização é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simula delay de criação
    setTimeout(() => {
      // Salva dados mockados no localStorage
      const mockOrganization = {
        id: crypto.randomUUID(),
        name: organizationName,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("fluzz_organization", JSON.stringify(mockOrganization));
      localStorage.setItem("fluzz_onboarding_completed", "true");

      toast({
        title: "Sucesso!",
        description: "Organização criada com sucesso",
      });

      // Redireciona para o dashboard
      router.push("/dashboard");
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mb-8 flex items-center gap-2">
        <Image
          src="/images/fluzz-logo1-painel.png"
          alt="Fluzz"
          width={150}
          height={48}
        />
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Criar Organização</CardTitle>
          <p className="text-sm text-muted-foreground">
            Para começar, crie sua organização. Você poderá criar múltiplos
            workspaces depois.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Minha Empresa"
                required
                disabled={isLoading}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Organização"
                  )}
                </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
