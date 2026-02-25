import { prisma } from "./src/lib/prisma";

async function setAdmin() {
    try {
        const user = await prisma.user.update({
            where: { email: "client@gmail.com" },
            data: { role: "ADMIN" },
        });

        console.log(`Success: Role for ${user.email} updated to ${user.role}`);
    } catch (error) {
        console.error("Error updating user role:", error);
    } finally {
        await prisma.$disconnect();
    }
}

setAdmin();
