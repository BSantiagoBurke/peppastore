import { Isotipo } from "@/components/store/Logo";
import styles from "./admin.module.css";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className={styles.auth}>
      <div className={styles.authCard}>
        <Isotipo className={styles.authLogo} />
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </main>
  );
}
