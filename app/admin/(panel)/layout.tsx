import Link from "next/link";
import { Isotipo } from "@/components/store/Logo";
import styles from "@/components/admin/admin.module.css";
import { signOut } from "@/lib/actions/auth";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <Link className={styles.brand} href="/admin" aria-label="Productos">
            <Isotipo />
            <span>PEPPA</span>
          </Link>
          <nav className={styles.barLinks} aria-label="Admin">
            <Link href="/" target="_blank" rel="noopener">
              Ver sitio
            </Link>
            <form action={signOut}>
              <button type="submit">Salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </>
  );
}
