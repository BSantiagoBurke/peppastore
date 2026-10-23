import { joinPaymentMethods, splitHours } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";
import styles from "./HowToBuy.module.css";

export function HowToBuy({ settings }: { settings: StoreSettings }) {
  const [days, times] = splitHours(settings.hours);
  return (
    <section className={styles.info} id="envios">
      <div className={`wrap ${styles.inner}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>Cómo comprar</p>
        <h2>Elegís, nos escribís y te lo llevamos.</h2>
        <div className={styles.grid}>
          <div>
            <h3>Envíos</h3>
            <p>{settings.shippingText}</p>
          </div>
          <div>
            <h3>Horarios</h3>
            <p className={styles.hours}>
              {days}
              {times && (
                <>
                  <br />
                  {times}
                </>
              )}
            </p>
          </div>
          <div>
            <h3>Costo</h3>
            <p>Depende de tu zona. Te lo confirmamos por WhatsApp antes de cerrar el pedido.</p>
          </div>
          <div>
            <h3>Pago</h3>
            <p>{joinPaymentMethods(settings.paymentMethods)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
