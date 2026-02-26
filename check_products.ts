import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            take: 5
        });
        console.log(JSON.stringify(products, null, 2));
    } catch (err) {
        console.error("Error fetching products:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
