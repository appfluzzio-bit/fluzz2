import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Confirme seu Email - Fluzz",
};

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="mb-8">
        <Image
          src="/images/fluzz-logo1-painel.png"
          alt="Fluzz"
          width={150}
          height={48}
          priority
          className="dark:block hidden"
        />
        <Image
          src="/images/fluzz-logo2.png"
          alt="Fluzz"
          width={150}
          height={48}
          priority
          className="dark:hidden block"
        />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verifique seu E-mail</h1>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Enviamos um link de confirmação para o seu e-mail.
          </p>
          <p className="text-sm text-muted-foreground">
            Por favor, verifique sua caixa de entrada e clique no link de confirmação
            para ativar sua conta.
          </p>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Não recebeu o e-mail?</p>
            <ul className="text-left space-y-1 text-muted-foreground">
              <li>• Verifique sua pasta de spam ou lixo eletrônico</li>
              <li>• Certifique-se de que digitou o e-mail corretamente</li>
              <li>• Aguarde alguns minutos, pode haver um atraso</li>
            </ul>
          </div>

          <div className="pt-4 space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Após confirmar o e-mail, você poderá fazer login normalmente
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground text-center max-w-md">
        Se continuar com problemas, entre em contato com nosso suporte.
      </p>
    </div>
  );
}

