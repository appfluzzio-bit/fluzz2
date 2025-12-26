"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { createOrganization } from "./actions";

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition();
  const [organizationName, setOrganizationName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Criar Organização - Fluzz";
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await createOrganization(formData);

        if (result?.error) {
          toast({
            title: "Ops! Algo deu errado",
            description: result.error,
            variant: "destructive",
          });
        }
        // Se não houver erro, o redirect será feito automaticamente
      } catch (error) {
        // Se chegou aqui, provavelmente é um redirect (comportamento esperado)
        console.log("Redirecionando para dashboard...");
      }
    });
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
                disabled={isPending}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando organização...
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
