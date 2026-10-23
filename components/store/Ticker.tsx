import styles from "./Ticker.module.css";

export function Ticker({ words }: { words: string[] }) {
  // Se repite hasta llenar y se duplica para el loop sin corte (translateX -50%).
  const base = words.length ? words : ["Piezas únicas"];
  const half = Array.from({ length: Math.max(2, Math.ceil(10 / base.length)) }, () => base).flat();
  const all = [...half, ...half];
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.track}>
        {all.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  );
}
