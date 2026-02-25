import { prisma } from "./src/lib/prisma";

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "test@gmail.com" },
        });

        if (user) {
            console.log(`User found: ${user.email}, Role: ${user.role}`);
        } else {
            console.log("User not found.");
        }
    } catch (error) {
        console.error("Error checking user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
