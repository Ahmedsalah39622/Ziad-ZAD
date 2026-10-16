import "dotenv/config";
import { db, pool } from "./src/lib/db";

async function testAll() {
  console.log("--- 1. Testing Products ---");
  try {
    const prods = await db.query.products.findMany({ limit: 2, with: { category: true } });
    console.log("Products OK! Count:", prods.length);
  } catch (e: any) {
    console.error("Products FAILED:", e.message || e);
  }

  console.log("--- 2. Testing Orders ---");
  try {
    const ords = await db.query.orders.findMany({ limit: 2, with: { items: true } });
    console.log("Orders OK! Count:", ords.length);
  } catch (e: any) {
    console.error("Orders FAILED:", e.message || e);
  }

  console.log("--- 3. Testing Categories ---");
  try {
    const cats = await db.query.categories.findMany({ limit: 2 });
    console.log("Categories OK! Count:", cats.length);
  } catch (e: any) {
    console.error("Categories FAILED:", e.message || e);
  }

  console.log("--- 4. Testing Users ---");
  try {
    const usrs = await db.query.users.findMany({ limit: 2 });
    console.log("Users OK! Count:", usrs.length);
  } catch (e: any) {
    console.error("Users FAILED:", e.message || e);
  }

  console.log("--- 5. Testing Discount Codes ---");
  try {
    const dcs = await db.query.discountCodes.findMany({ limit: 2 });
    console.log("DiscountCodes OK! Count:", dcs.length);
  } catch (e: any) {
    console.error("DiscountCodes FAILED:", e.message || e);
  }

  console.log("--- 6. Testing Site Settings ---");
  try {
    const stg = await db.query.siteSettings.findMany({ limit: 2 });
    console.log("SiteSettings OK! Count:", stg.length);
  } catch (e: any) {
    console.error("SiteSettings FAILED:", e.message || e);
  }
}

testAll().then(() => pool.end());
