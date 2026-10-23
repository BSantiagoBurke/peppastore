// Dibujos de prenda del demo. Solo se usan como placeholder cuando un producto no tiene foto.

const GARMENTS = {
  vestido: (
    <>
      <path d="M38 6c4 10 6 16 12 16s8-6 12-16M38 6c-2 8-4 18-6 24 4 6 6 14 4 24-8 30-16 52-22 72 22 6 50 6 72 0-6-20-14-42-22-72-2-10 0-18 4-24-2-6-4-16-6-24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M36 54c10 3 18 3 28 0" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".6" />
    </>
  ),
  top: (
    <>
      <path d="M30 34c6-4 12-12 14-22 2 6 4 9 6 9s4-3 6-9c2 10 8 18 14 22l-4 46c-10 4-22 4-32 0z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M50 22v58M36 44c9 4 19 4 28 0" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".55" />
    </>
  ),
  corset: (
    <>
      <path d="M28 30c8 4 14 6 22 2 8 4 14 2 22-2l-4 34c4 8 4 14 2 20-12 4-28 4-40 0-2-6-2-12 2-20z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M50 32v52M40 34l2 48M60 34l-2 48" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".55" />
    </>
  ),
  midi: (
    <>
      <path d="M34 20h32l4 8c4 30 10 60 14 92-22 6-46 6-68 0 4-32 10-62 14-92z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M36 28h28M66 40c2 30 4 56 6 80" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".55" />
    </>
  ),
} as const;

const TONES: [string, string, string][] = [
  ["#6B4A3F", "#3A2A24", "#E9D7CC"],
  ["#C9A08C", "#8C6655", "#2E231E"],
  ["#E6DCD3", "#C8B6A8", "#4A3A32"],
  ["#2E231E", "#4A3A32", "#C9A08C"],
  ["#8E5E52", "#4A2E28", "#F4EFEB"],
  ["#B9A396", "#7A675C", "#F4EFEB"],
];

const BY_CATEGORY: Record<string, keyof typeof GARMENTS> = {
  vestidos: "vestido",
  tops: "top",
  bodys: "corset",
  polleras: "midi",
};

export function GarmentArt({ categorySlug, seed, className }: { categorySlug: string; seed: number; className?: string }) {
  const tone = TONES[Math.abs(seed) % TONES.length] ?? TONES[0]!;
  const garment = GARMENTS[BY_CATEGORY[categorySlug] ?? "vestido"];
  return (
    <>
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 30% 15%, ${tone[0]}, ${tone[1]})` }}
      />
      <svg
        className={className}
        viewBox="0 0 100 130"
        aria-hidden="true"
        style={{ color: tone[2], position: "absolute", inset: "10% 14%", width: "72%", height: "80%" }}
      >
        {garment}
      </svg>
    </>
  );
}
