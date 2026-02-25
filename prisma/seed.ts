import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
    // Create admin user
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    await prisma.user.upsert({
        where: { email: "admin@zad.com" },
        update: {},
        create: {
            email: "admin@zad.com",
            name: "ZAD Admin",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    // Create categories
    const categories = [
        { name: "Men's Streetwear", slug: "mens-streetwear" },
        { name: "Outerwear", slug: "outerwear" },
        { name: "Accessories", slug: "accessories" },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    const mensCategory = await prisma.category.findUnique({
        where: { slug: "mens-streetwear" },
    });
    const outerwearCategory = await prisma.category.findUnique({
        where: { slug: "outerwear" },
    });
    const accessoriesCategory = await prisma.category.findUnique({
        where: { slug: "accessories" },
    });

    // Seed products
    const products = [
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
            categoryId: mensCategory?.id,
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
            categoryId: mensCategory?.id,
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
            categoryId: outerwearCategory?.id,
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
            categoryId: mensCategory?.id,
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
            categoryId: accessoriesCategory?.id,
            stock: 100,
            active: true,
        },
    ];

    for (const product of products) {
        const existing = await prisma.product.findFirst({
            where: { name: product.name },
        });
        if (!existing) {
            await prisma.product.create({ data: product });
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
        await prisma.$disconnect();
    });
