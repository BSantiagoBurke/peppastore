import { LOGO_PATH, MARK_PATH } from "./logo-paths";

type Props = { className?: string; title?: string };

/** Isotipo (las dos "p" enfrentadas). Toma el color de `currentColor`. */
export function Isotipo({ className, title }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 1230 1008"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path fillRule="evenodd" fill="currentColor" d={MARK_PATH} />
    </svg>
  );
}

/** Logo completo: isotipo + PEPPA. */
export function LogoCompleto({ className, title = "Peppa" }: Props) {
  return (
    <svg className={className} viewBox="0 0 1424 1492" role="img" aria-label={title}>
      <path fillRule="evenodd" fill="currentColor" d={LOGO_PATH} />
    </svg>
  );
}
