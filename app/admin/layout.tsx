import type { Metadata } from "next";
import styles from "@/components/admin/admin.module.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Peppa" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>;
}
