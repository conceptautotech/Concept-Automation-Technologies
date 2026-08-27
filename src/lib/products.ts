import { Product, ProductSpec } from "@/data/catalog";
import { supabase } from "./supabase";

export interface DbProduct {
  id?: string;
  name: string;
  part_number: string;
  brand: string;
  category: string;
  type: string;
  price?: string;
  description: string;
  specifications: any; // JSON array of specifications [{label, value}]
  image: string;
  slug: string;
  stock: boolean;
  stock_count: number;
  is_custom: boolean;
  is_deleted?: boolean;
  created_at?: string;
}

export interface ExtendedProduct extends Product {
  stockCount: number;
  isCustom: boolean;
  isDeleted?: boolean;
}

/**
 * Fetch all products from Supabase products table
 */
export async function getDbProducts(): Promise<DbProduct[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch products error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Failed to fetch products from Supabase:", err);
    return [];
  }
}

/**
 * Insert or update a product override or custom product in Supabase
 */
export async function saveProductOverride(product: Partial<DbProduct>) {
  try {
    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "slug" })
      .select();

    if (error) {
      console.error("Failed to save product to Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Error saving product:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Delete a product override or custom product from Supabase
 */
export async function deleteProductOverride(slug: string) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error("Failed to delete product from Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting product:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Merge static products catalog with Supabase overrides/additions
 */
export function mergeProducts(staticProducts: Product[], dbProducts: DbProduct[]): ExtendedProduct[] {
  const mergedMap = new Map<string, ExtendedProduct>();

  // 1. Load static products
  staticProducts.forEach((p) => {
    const filteredSpecs = (p.specifications || []).filter(
      (spec) => spec.value !== "In Stock - Ready for Express Dispatch"
    );
    mergedMap.set(p.slug || p.id, {
      ...p,
      specifications: filteredSpecs,
      stockCount: p.stock ? 1000 : 0, // default stock count for static products
      isCustom: false,
      isDeleted: false,
    });
  });

  // 2. Override with DB products
  dbProducts.forEach((dbP) => {
    let specs: ProductSpec[] = [];
    if (typeof dbP.specifications === "string") {
      try {
        specs = JSON.parse(dbP.specifications);
      } catch (e) {
        specs = [];
      }
    } else if (Array.isArray(dbP.specifications)) {
      specs = dbP.specifications;
    }

    const filteredSpecs = specs.filter(
      (spec) => spec.value !== "In Stock - Ready for Express Dispatch"
    );

    const key = dbP.slug;
    const existing = mergedMap.get(key);

    const mergedItem: ExtendedProduct = {
      id: dbP.id || existing?.id || dbP.slug,
      name: dbP.name,
      partNumber: dbP.part_number,
      brand: dbP.brand,
      category: dbP.category,
      type: dbP.type as any,
      price: dbP.price || existing?.price || "On Request",
      description: dbP.description || "",
      specifications: filteredSpecs,
      image: dbP.image || "",
      slug: dbP.slug,
      stock: dbP.stock,
      stockCount: dbP.stock_count,
      isCustom: dbP.is_custom,
      isDeleted: dbP.is_deleted || false,
    };

    mergedMap.set(key, mergedItem);
  });

  return Array.from(mergedMap.values());
}

/**
 * Upload an image file directly to Supabase Storage and return its public URL
 */
export async function uploadProductImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `product-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error.message);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Error uploading image:", err);
    return { success: false, error: err.message || "Unknown upload error" };
  }
}

/**
 * Fetch global settings from Supabase (with localStorage fallback)
 */
export async function getGlobalSettings(): Promise<Record<string, any>> {
  const localDefault = { show_stock_status: true };
  
  // Read local storage initial value
  try {
    const localValStr = localStorage.getItem("show_stock_status");
    if (localValStr !== null) {
      localDefault.show_stock_status = localValStr === "true";
    }
  } catch (e) {
    console.warn("localStorage read warning:", e);
  }

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*");

    if (error) {
      console.warn("Supabase fetch settings failed, using localStorage fallback:", error.message);
      return localDefault;
    }

    const settingsObj: Record<string, any> = { ...localDefault };
    data?.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    return settingsObj;
  } catch (err) {
    console.error("Failed to fetch settings from Supabase, using localStorage fallback:", err);
    return localDefault;
  }
}

/**
 * Save a global setting in Supabase (with localStorage fallback)
 */
export async function saveGlobalSetting(key: string, value: any) {
  // Sync to local storage first so it always works immediately on the client browser
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.warn("localStorage write warning:", e);
  }

  try {
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      console.warn("Supabase upsert settings failed (likely table does not exist yet):", error.message);
      // Return success true anyway because the localStorage fallback will keep it working for their browser!
      return { success: true, warning: "Saved locally. Run SQL scripts in Supabase to sync globally." };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Error saving setting:", err);
    // Return success true anyway to avoid blocking the UI toggle since we synchronized it locally
    return { success: true, warning: err.message };
  }
}
