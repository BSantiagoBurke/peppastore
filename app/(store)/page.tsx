import { Catalog } from "@/components/store/Catalog";
import { Hero } from "@/components/store/Hero";
import { HowToBuy } from "@/components/store/HowToBuy";
import { Story } from "@/components/store/Story";
import { Ticker } from "@/components/store/Ticker";
import { getCategories, getProducts, getSettings } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const tickerWords = [...categories.map((c) => c.name), "Piezas únicas", "Envíos a todo el país"];
  return (
    <>
      <Hero instagram={settings.instagram} />
      <Ticker words={tickerWords} />
      <Story categoryCount={categories.length} />
      <Catalog products={products} categories={categories} />
      <HowToBuy settings={settings} />
    </>
  );
}
