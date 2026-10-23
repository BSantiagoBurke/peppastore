export type Category = { id: string; name: string; slug: string; position: number };

export type ProductImage = { id: string; storagePath: string; alt: string | null; position: number };

export type SizeStock = { sizeId: string; label: string; position: number; quantity: number };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  position: number;
  updatedAt: string;
  category: Category;
  images: ProductImage[];
  stock: SizeStock[];
  totalStock: number;
};

export type StoreSettings = {
  whatsapp: string;
  instagram: string;
  hours: string;
  deliveryZones: string[];
  paymentMethods: string[];
  shippingText: string;
};
