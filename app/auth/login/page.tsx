import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login - Fluzz",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Login Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2">
            <Image
              src="/images/fluzz-logo1-painel.png"
              alt="Fluzz"
              width={150}
              height={48}
            />
          </div>

          <h1 className="mb-2 text-3xl font-bold">Bem-vindo(a) de volta</h1>
          <p className="mb-8 text-muted-foreground">
            Acesse sua plataforma de comunicação
          </p>

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
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
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Lembrar de mim</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden w-1/2 bg-fluzz-dark p-16 text-white lg:block">
        <h2 className="mb-4 text-4xl font-bold">
          Transforme sua comunicação com clientes
        </h2>
        <p className="mb-8 text-lg text-gray-300">
          A plataforma mais completa e confiável para engajamento profissional
          via WhatsApp. Escalabilidade, segurança e resultados garantidos.
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Comunicação em Escala</h3>
              <p className="text-sm text-gray-400">
                Conecte-se com milhares de clientes simultaneamente de forma
                personalizada e eficiente.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">
                Proteção Inteligente Anti-Ban
              </h3>
              <p className="text-sm text-gray-400">
                Sistema avançado de segurança que protege suas contas com
                estratégias inteligentes.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Automação Completa</h3>
              <p className="text-sm text-gray-400">
                Otimize seu tempo com fluxos automatizados personalizados.
                Configure uma vez e deixe a plataforma trabalhar 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

