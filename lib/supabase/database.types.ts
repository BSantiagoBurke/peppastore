// Escrito a mano siguiendo el formato de `supabase gen types`.
// Regenerar con `npm run db:types` una vez linkeado el proyecto (supabase link).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      categories: {
        Row: { id: string; name: string; slug: string; position: number; created_at: string };
        Insert: { id?: string; name: string; slug: string; position?: number; created_at?: string };
        Update: { id?: string; name?: string; slug?: string; position?: number; created_at?: string };
        Relationships: [];
      };
      sizes: {
        Row: { id: string; label: string; position: number };
        Insert: { id?: string; label: string; position?: number };
        Update: { id?: string; label?: string; position?: number };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string;
          price: number;
          compare_at_price: number | null;
          badge: string | null;
          status: "draft" | "published" | "archived";
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id: string;
          price: number;
          compare_at_price?: number | null;
          badge?: string | null;
          status?: "draft" | "published" | "archived";
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category_id?: string;
          price?: number;
          compare_at_price?: number | null;
          badge?: string | null;
          status?: "draft" | "published" | "archived";
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_stock: {
        Row: { product_id: string; size_id: string; quantity: number };
        Insert: { product_id: string; size_id: string; quantity?: number };
        Update: { product_id?: string; size_id?: string; quantity?: number };
        Relationships: [
          {
            foreignKeyName: "product_stock_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_stock_size_id_fkey";
            columns: ["size_id"];
            isOneToOne: false;
            referencedRelation: "sizes";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: { id: string; product_id: string; storage_path: string; alt: string | null; position: number };
        Insert: { id?: string; product_id: string; storage_path: string; alt?: string | null; position?: number };
        Update: { id?: string; product_id?: string; storage_path?: string; alt?: string | null; position?: number };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          id: number;
          whatsapp: string;
          instagram: string;
          hours: string;
          delivery_zones: string[];
          payment_methods: string[];
          shipping_text: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          whatsapp?: string;
          instagram?: string;
          hours?: string;
          delivery_zones?: string[];
          payment_methods?: string[];
          shipping_text?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          whatsapp?: string;
          instagram?: string;
          hours?: string;
          delivery_zones?: string[];
          payment_methods?: string[];
          shipping_text?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      products_public: {
        Row: {
          id: string | null;
          name: string | null;
          slug: string | null;
          description: string | null;
          price: number | null;
          compare_at_price: number | null;
          badge: string | null;
          position: number | null;
          updated_at: string | null;
          category: Json | null;
          images: Json | null;
          stock: Json | null;
          total_stock: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      adjust_stock: { Args: { p_product_id: string; p_size_id: string; p_delta: number }; Returns: number };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
