import { AuthShell } from "@/components/admin/AuthShell";
import { RecoverForm } from "@/components/admin/RecoverForm";

export const metadata = { title: "Recuperar contraseña" };

export default function RecoverPage() {
  return (
    <AuthShell title="¿Olvidaste la contraseña?" subtitle="Te mandamos un link por email para elegir una nueva.">
      <RecoverForm />
    </AuthShell>
  );
}
