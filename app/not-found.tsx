import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ paddingBlock: "120px", textAlign: "center" }}>
      <p className="eyebrow" style={{ opacity: 0.6 }}>
        Error 404
      </p>
      <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", margin: "18px 0 32px" }}>Esta prenda ya no está.</h1>
      <Link className="cta" href="/#catalogo">
        Ver la colección <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
