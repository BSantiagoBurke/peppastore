/**
 * Sube las fotos de supabase/seed/images/<slug>/ al bucket product-images con la misma ruta.
 * Uso: npm run seed:images  (lee .env.local; requiere SUPABASE_SERVICE_ROLE_KEY)
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile?.(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const ROOT = join(process.cwd(), "supabase/seed/images");
const BUCKET = "product-images";
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : Promise.resolve([join(dir, e.name)]))),
  );
  return nested.flat().filter((f) => f.endsWith(".webp"));
}

const files = await walk(ROOT);
if (files.length === 0) console.warn(`No hay .webp en ${ROOT}`);

let failed = 0;
for (const file of files) {
  const path = relative(ROOT, file).split("\\").join("/");
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await readFile(file), { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
  if (error) {
    failed++;
    console.error(`✗ ${path}: ${error.message}`);
  } else {
    console.log(`✓ ${path}`);
  }
}
process.exit(failed ? 1 : 0);
