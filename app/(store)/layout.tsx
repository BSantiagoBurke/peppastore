import { Bag } from "@/components/store/Bag";
import { BagProvider } from "@/components/store/BagProvider";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { getProducts, getSettings } from "@/lib/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return (
    <BagProvider products={products} settings={settings}>
      <Header />
      <main>{children}</main>
      <Footer settings={settings} />
      <Bag />
    </BagProvider>
  );
}
