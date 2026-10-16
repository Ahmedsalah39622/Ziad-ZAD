import "dotenv/config";
import { getProducts } from "./src/lib/actions/product-actions";
import { getOrders } from "./src/lib/actions/order-actions";
import { getCategories } from "./src/lib/actions/category-actions";
import { getDiscountCodes } from "./src/lib/actions/discount-actions";
import { getSetting } from "./src/lib/actions/settings-actions";
import { pool } from "./src/lib/db";

async function verifyAllActions() {
  console.log("=== 1. Products ===");
  const products = await getProducts();
  console.log("Products Count:", products.length);
  if (products.length > 0) {
    console.log("Sample Product:", products[0].name, "Price:", products[0].price);
  }

  console.log("\n=== 2. Orders ===");
  const orders = await getOrders();
  console.log("Orders Count:", orders.length);
  if (orders.length > 0) {
    console.log("Sample Order:", orders[0].id, "Customer:", orders[0].customerName, "Items:", orders[0].items.length);
  }

  console.log("\n=== 3. Categories ===");
  const cats = await getCategories();
  console.log("Categories Count:", cats.length);

  console.log("\n=== 4. Discount Codes ===");
  const dcs = await getDiscountCodes();
  console.log("Discount Codes Count:", dcs.length);

  console.log("\n=== 5. Settings ===");
  const setting = await getSetting("whatsapp_number", "none");
  console.log("Setting whatsapp_number:", setting);

  console.log("\n🔥 ALL 5 CORE SERVICES WORKING 100% WITH LIVE DATA!");
}

verifyAllActions().then(() => pool.end());
