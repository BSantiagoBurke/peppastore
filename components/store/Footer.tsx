import { formatPhone } from "@/lib/format";
import { BEECODE_URL } from "@/lib/site";
import type { StoreSettings } from "@/lib/types";
import { LogoCompleto } from "./Logo";
import styles from "./Footer.module.css";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <LogoCompleto className={styles.logo} />
        <div className={styles.row}>
          <span>
            WhatsApp <span className={styles.phone}>{formatPhone(settings.whatsapp)}</span>
          </span>
          <a href={`https://www.instagram.com/${settings.instagram}/`} target="_blank" rel="noopener">
            Instagram @{settings.instagram}
          </a>
          <a href={BEECODE_URL} target="_blank" rel="noopener">
            Sitio por BeeCode
          </a>
        </div>
      </div>
    </footer>
  );
}
