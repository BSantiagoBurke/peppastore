"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_IMAGES_BUCKET, publicImageUrl } from "@/lib/images";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./admin.module.css";

export type ImageItem = { storagePath: string; alt: string | null };

const MAX_IMAGES = 12;

/** WebP, lado mayor 1600 px, apuntando a < 400 KB. */
async function compress(file: File): Promise<Blob> {
  const { default: imageCompression } = await import("browser-image-compression");
  return imageCompression(file, {
    maxWidthOrHeight: 1600,
    maxSizeMB: 0.38,
    fileType: "image/webp",
    initialQuality: 0.82,
    useWebWorker: true,
  });
}

export function ImageManager({
  productId,
  value,
  onChange,
  onError,
}: {
  productId: string;
  value: ImageItem[];
  onChange: (next: ImageItem[]) => void;
  onError: (message: string) => void;
}) {
  const [progress, setProgress] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_IMAGES - value.length;
    if (room <= 0) return onError(`Máximo ${MAX_IMAGES} fotos por prenda.`);
    const selected = files.slice(0, room);

    const supabase = createSupabaseBrowserClient();
    const uploaded: ImageItem[] = [];
    try {
      for (const [i, file] of selected.entries()) {
        setProgress(`Subiendo ${i + 1} de ${selected.length}…`);
        const blob = await compress(file);
        const path = `${productId}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
        if (error) throw error;
        uploaded.push({ storagePath: path, alt: null });
      }
    } catch (err) {
      console.error(err);
      onError("No se pudo subir una foto. Revisá la conexión y probá de nuevo.");
    } finally {
      setProgress(null);
      if (uploaded.length) onChange([...value, ...uploaded]);
    }
    if (files.length > selected.length) onError(`Se subieron ${selected.length}. Máximo ${MAX_IMAGES} fotos por prenda.`);
  }

  function move(from: number, to: number) {
    const next = [...value];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      {value.length > 0 && (
        <div className={styles.images}>
          {value.map((img, i) => (
            <div key={img.storagePath} className={styles.imageCard}>
              <div className={styles.imageWrap}>
                <Image src={publicImageUrl(img.storagePath)} alt={`Foto ${i + 1}`} fill sizes="160px" />
                {i === 0 && <span className={styles.mainTag}>Principal</span>}
              </div>
              <div className={styles.imageTools}>
                <button type="button" aria-label={`Mover foto ${i + 1} a la izquierda`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                  ←
                </button>
                <button type="button" aria-label={`Borrar foto ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  Borrar
                </button>
                <button
                  type="button"
                  aria-label={`Mover foto ${i + 1} a la derecha`}
                  disabled={i === value.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  →
                </button>
                {i > 0 && (
                  <button type="button" className={styles.makeMain} onClick={() => move(i, 0)}>
                    Hacer principal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <label className={styles.upload} aria-disabled={progress !== null}>
        <input type="file" accept="image/*" multiple onChange={onFiles} disabled={progress !== null} />
        {progress ?? (value.length ? "+ Sumar más fotos" : "+ Subir fotos")}
      </label>
      <p className={styles.hint} style={{ marginTop: 8 }}>
        La primera es la principal. La segunda se ve al pasar el mouse en el catálogo. Los cambios de fotos se aplican al
        tocar Guardar.
      </p>
    </div>
  );
}
