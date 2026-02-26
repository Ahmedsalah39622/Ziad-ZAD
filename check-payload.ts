import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: { id: true, name: true, images: true, details: true, colors: true, sizes: true, description: true }
    });

    let totalSize = 0;
    for (const p of products) {
        const size = Buffer.byteLength(JSON.stringify(p), 'utf-8');
        totalSize += size;
        console.log(`Product ${p.name}: ${(size / 1024 / 1024).toFixed(2)} MB`);
    }
    console.log(`\nTotal DB payload size for getProducts: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main().finally(() => prisma.$disconnect());
