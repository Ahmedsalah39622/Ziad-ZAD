import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const adminEmail = "admin@zad.com";
        const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (existing) {
            return NextResponse.json({ message: "Admin already exists", user: adminEmail });
        }

        const hashedPassword = await bcrypt.hash("Admin123!", 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: "ZAD Admin",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        return NextResponse.json({ message: "Admin created successfully", user: adminEmail, password: "Admin123!" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create admin", details: error instanceof Error ? error.message : "internal error" }, { status: 500 });
    }
}
