"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvite } from "./actions";
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

export default function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string>("");
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    params.then(({ id: inviteId }) => {
      setId(inviteId);
      loadInvite(inviteId);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInvite(inviteId: string) {
    try {
      const response = await fetch(`/api/invites/${inviteId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao carregar convite");
        return;
      }

      setInvite(data);
    } catch (err) {
      setError("Erro ao carregar convite");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    formData.append("invite_id", id);

    const result = await acceptInvite(formData);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
      setSubmitting(false);
    } else {
      toast({
        title: "Sucesso",
        description: "Bem-vindo! Redirecionando...",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="mb-4 h-16 w-16 text-destructive" />
            <h2 className="mb-2 text-2xl font-bold">Convite Inválido</h2>
            <p className="text-center text-sm text-muted-foreground">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metadata = invite?.metadata || {};
  const targetName = invite?.workspace_name || invite?.organization_name;

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/fluzz-logo1-painel.png"
            alt="Fluzz"
            width={180}
            height={60}
            priority
          />
        </div>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Bem-vindo ao Fluzz!</CardTitle>
            <CardDescription>
              Complete seu cadastro para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                Você foi convidado para:
              </p>
              <p className="text-xl font-bold text-primary">{targetName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                como <span className="font-semibold">{invite?.role}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={invite?.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha segura"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Aceitar Convite e Criar Conta
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Ao aceitar o convite, você concorda com nossos termos de uso e
              política de privacidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

