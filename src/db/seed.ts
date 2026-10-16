import "dotenv/config";
import { db, users, categories, products, discountCodes, pool } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

console.log("Database URL configured:", Boolean(process.env.DATABASE_URL));

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123!", 10);

  // 1. Admin User
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, "admin@zad.com"),
  });

  if (!existingAdmin) {
    await db.insert(users).values({
      email: "admin@zad.com",
      name: "ZAD Admin",
      password: hashedPassword,
      role: "ADMIN",
    });
  }

  // 2. Categories
  const categoryData = [
    { name: "Men's Streetwear", slug: "mens-streetwear" },
    { name: "Outerwear", slug: "outerwear" },
    { name: "Accessories", slug: "accessories" },
  ];

  for (const cat of categoryData) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cat.slug),
    });
    if (!existing) {
      await db.insert(categories).values(cat);
    }
  }

  const mensCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, "mens-streetwear"),
  });
  const outerwearCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, "outerwear"),
  });
  const accessoriesCategory = await db.query.categories.findFirst({
    where: eq(categories.slug, "accessories"),
  });

  // 3. Products
  const seedProducts = [
    {
      name: "ZAD Genesis 001",
      price: 599,
      images: JSON.stringify([{ url: "/zad_green_shirt_studio.png" }]),
      tag: "Best Seller",
      colors: JSON.stringify([
        { name: "Black", hex: "#000" },
        { name: "White", hex: "#fff" },
        { name: "Forest", hex: "#1a472a" },
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      description:
        "The flagship piece of Collection 001. Engineered with premium heavyweight cotton and nanobana fiber technology for a fit that moves with you.",
      details: JSON.stringify([
        "300 GSM heavyweight cotton",
        "Nanobana fiber-infused fabric",
        "Relaxed oversized fit",
        "Ribbed cuffs and hem",
        "Screen-printed ZAD branding",
      ]),
      categoryId: mensCategory?.id || null,
      stock: 50,
      active: true,
    },
    {
      name: "Nano-Weave Tee",
      price: 420,
      images: JSON.stringify([]),
      tag: "New",
      colors: JSON.stringify([
        { name: "Carbon", hex: "#555" },
        { name: "Black", hex: "#000" },
      ]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      description:
        "Ultra-lightweight nano-weave construction for breathable all-day comfort.",
      details: JSON.stringify([
        "180 GSM nano-weave cotton",
        "Moisture-wicking technology",
        "Slim-relaxed fit",
        "Reinforced shoulder seams",
      ]),
      categoryId: mensCategory?.id || null,
      stock: 35,
      active: true,
    },
    {
      name: "Holo-Shell Jacket",
      price: 1250,
      images: JSON.stringify([]),
      colors: JSON.stringify([{ name: "Shadow", hex: "#111" }]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      description:
        "A statement outerwear piece with a reflective inner shell that catches light in motion.",
      details: JSON.stringify([
        "Reflective holographic inner lining",
        "Water-resistant outer shell",
        "YKK zippers throughout",
        "Adjustable hem and cuffs",
        "Hidden interior pocket",
      ]),
      categoryId: outerwearCategory?.id || null,
      stock: 20,
      active: true,
    },
    {
      name: "ZAD Oversize Hoodie",
      price: 799,
      images: JSON.stringify([{ url: "/zad_green_shirt_studio.png" }]),
      tag: "Limited",
      colors: JSON.stringify([
        { name: "White", hex: "#ffffff" },
        { name: "Black", hex: "#000000" },
      ]),
      sizes: JSON.stringify(["M", "L", "XL", "XXL"]),
      description:
        "Heavy-duty oversized hoodie with a dropped shoulder and kangaroo pocket.",
      details: JSON.stringify([
        "400 GSM heavyweight fleece",
        "Oversized dropped-shoulder fit",
        "Double-layered hood",
        "Embroidered ZAD logo",
        "Kangaroo pocket",
      ]),
      categoryId: mensCategory?.id || null,
      stock: 30,
      active: true,
    },
    {
      name: "Protocol Hat",
      price: 220,
      images: JSON.stringify([]),
      colors: JSON.stringify([{ name: "Black", hex: "#000" }]),
      sizes: JSON.stringify(["One Size"]),
      description:
        "Structured unisex cap with an embossed ZAD logo on the front.",
      details: JSON.stringify([
        "Structured 6-panel construction",
        "Embossed metal ZAD logo",
        "Adjustable metal buckle strap",
        "Ventilation eyelets",
      ]),
      categoryId: accessoriesCategory?.id || null,
      stock: 100,
      active: true,
    },
  ];

  for (const product of seedProducts) {
    const existing = await db.query.products.findFirst({
      where: eq(products.name, product.name),
    });
    if (!existing) {
      await db.insert(products).values(product);
    }
  }

  // 4. Discount Codes
  const sampleDiscounts = [
    {
      code: "WELCOME10",
      discountPct: 10,
      usesPerCode: 100,
    },
    {
      code: "SPRING25",
      discountPct: 25,
      usesPerCode: 50,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const disc of sampleDiscounts) {
    const existing = await db.query.discountCodes.findFirst({
      where: eq(discountCodes.code, disc.code),
    });
    if (!existing) {
      await db.insert(discountCodes).values(disc);
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log("   Admin: admin@zad.com / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
