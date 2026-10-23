import { AuthShell } from "@/components/admin/AuthShell";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <AuthShell title="Panel de Peppa" subtitle="Entrá para cargar prendas y actualizar el stock.">
      <LoginForm next={next} initialError={error} />
    </AuthShell>
  );
}
