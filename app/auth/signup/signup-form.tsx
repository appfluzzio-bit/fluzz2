"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await signup(formData);

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
        console.log("Redirecionando para confirmação de email...");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input
          id="nome"
          name="nome"
          type="text"
          placeholder="Seu nome completo"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone (opcional)</Label>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="segmento">Segmento (opcional)</Label>
        <Input
          id="segmento"
          name="segmento"
          type="text"
          placeholder="Ex: E-commerce, Serviços, etc"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••"
          required
          minLength={6}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  );
}

