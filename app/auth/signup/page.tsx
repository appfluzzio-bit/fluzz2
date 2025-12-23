import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Cadastro - Fluzz",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Features */}
      <div className="hidden w-1/2 bg-fluzz-dark p-16 text-white lg:block">
        <div className="mb-8 flex items-center gap-2">
          <Image
            src="/images/fluzz-logo1-painel.png"
            alt="Fluzz"
            width={150}
            height={48}
          />
        </div>

        <h2 className="mb-4 text-4xl font-bold">
          Transforme sua comunicação com clientes
        </h2>
        <p className="mb-8 text-lg text-gray-300">
          A plataforma mais completa e confiável para engajamento profissional
          via WhatsApp. Junte-se a milhares de empresas que já crescem com o
          Fluzz e alcance resultados extraordinários.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Comunicação em Escala</h3>
            <p className="text-sm text-gray-400">
              Conecte-se com milhares de clientes simultaneamente de forma
              personalizada e eficiente, mantendo a qualidade e proximidade em
              cada interação.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Automação Inteligente</h3>
            <p className="text-sm text-gray-400">
              Otimize seu tempo com fluxos automatizados personalizados.
              Configure uma vez e deixe a plataforma trabalhar por você 24 horas
              por dia, 7 dias por semana.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Proteção Anti-Ban</h3>
            <p className="text-sm text-gray-400">
              Sistema avançado de segurança que protege suas contas com
              estratégias inteligentes, garantindo máxima entregabilidade e
              confiabilidade das mensagens.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Suporte Dedicado</h3>
            <p className="text-sm text-gray-400">
              Equipe especializada pronta para ajudar no seu sucesso. Conte com
              atendimento ágil e suporte técnico completo sempre que precisar.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-16">
        <Link
          href="/auth/login"
          className="absolute left-8 top-8 text-sm text-muted-foreground hover:text-primary"
        >
          ← Voltar para o Login
        </Link>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src="/images/fluzz-logo1-painel.png"
              alt="Fluzz"
              width={150}
              height={48}
            />
          </div>

          <h1 className="mb-2 text-3xl font-bold">Criar Conta</h1>
          <p className="mb-8 text-muted-foreground">
            Preencha os dados abaixo para começar
          </p>

          <SignupForm />

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

