import { NextResponse } from "next/server";
import { supabaseFetch, isSupabaseConfigured, getLocalDb } from "@/lib/server-db";

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const [prodsRes, plansRes, discRes, custRes] = await Promise.all([
        supabaseFetch("products?select=*,variants:product_variants(*)&order=name"),
        supabaseFetch("plans?select=*&order=name"),
        supabaseFetch("discounts?select=*&order=code"),
        supabaseFetch("profiles?select=*&role=eq.CUSTOMER&order=name"),
      ]);

      const [products, plans, discounts, customers] = await Promise.all([
        prodsRes.json(),
        plansRes.json(),
        discRes.json(),
        custRes.json(),
      ]);

      return NextResponse.json({
        products: Array.isArray(products) ? products : [],
        plans: Array.isArray(plans) ? plans : [],
        discounts: Array.isArray(discounts) ? discounts : [],
        customers: Array.isArray(customers) ? customers : [],
      });
    }

    // Fallback to local SQLite
    const db = getLocalDb();
    const products = db.query(`
      SELECT p.*,
        json_group_array(
          json_object('id', pv.id, 'product_id', pv.product_id, 'variant_name', pv.variant_name, 'extra_price', pv.extra_price)
        ) as variants
      FROM products p
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      GROUP BY p.id
      ORDER BY p.name
    `).all().map((p: any) => ({
      ...p,
      variants: p.variants ? JSON.parse(p.variants).filter((v: any) => v.id !== null) : [],
    }));

    const plans = db.query("SELECT * FROM plans ORDER BY name").all();
    const discounts = db.query("SELECT * FROM discounts ORDER BY code").all();
    const customers = db.query("SELECT * FROM profiles WHERE role = 'CUSTOMER' ORDER BY name").all();

    return NextResponse.json({ products, plans, discounts, customers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load catalogue bootstrap data" },
      { status: 500 }
    );
  }
}
