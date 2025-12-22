import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "./actions";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Get invite
  const { data: invite, error } = await supabase
    .from("invites")
    .select("*, organizations(*), workspaces(*)")
    .eq("id", id)
    .single();

  if (error || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">Convite não encontrado</h2>
            <p className="text-center text-sm text-muted-foreground">
              Este convite não existe ou já foi utilizado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if expired
  if (
    invite.status !== "pending" ||
    new Date(invite.expires_at) < new Date()
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">Convite expirado</h2>
            <p className="text-center text-sm text-muted-foreground">
              Este convite expirou ou já foi aceito.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user's email matches invite
  if (user && user.email !== invite.email) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">E-mail não corresponde</h2>
            <p className="text-center text-sm text-muted-foreground">
              Este convite foi enviado para {invite.email}. Por favor, faça login
              com o e-mail correto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not logged in, redirect to login with return URL
  if (!user) {
    redirect(`/auth/login?redirect=/invite/${id}`);
  }

  const targetName = invite.workspace_id
    ? (invite.workspaces as any)?.name
    : (invite.organizations as any)?.name;

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/fluzz-logo1-painel.png"
            alt="Fluzz"
            width={150}
            height={48}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Você foi convidado!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Você foi convidado para fazer parte de:
              </p>
              <p className="mb-2 text-xl font-bold">{targetName}</p>
              <p className="text-sm text-muted-foreground">
                como {invite.role}
              </p>
            </div>

            <form action={acceptInvite}>
              <input type="hidden" name="invite_id" value={invite.id} />
              <Button type="submit" className="w-full" size="lg">
                <CheckCircle className="mr-2 h-5 w-5" />
                Aceitar Convite
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Ao aceitar, você terá acesso às funcionalidades conforme sua
              função.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

