"use server";

import bcrypt from "bcryptjs";

// Dynamic imports for server-only dependencies - prevents bundling them into client code
async function getPrisma() {
    const prismaModule = await import("@/lib/prisma");
    return prismaModule.prisma;
}

async function getAuthHelpers() {
    const authModule = await import("@/lib/auth");
    return { signIn: authModule.signIn, signOut: authModule.signOut, auth: authModule.auth };
}

export async function adminLoginAction(email: string, password: string) {
    try {
        const prisma = await getPrisma();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== "ADMIN") {
            return { error: "Invalid credentials or insufficient permissions" };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: "Invalid credentials" };
        }

        const { signIn } = await getAuthHelpers();
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: true };
    } catch {
        return { error: "Login failed. Please try again." };
    }
}

export async function loginAction(email: string, password: string) {
    try {
        const { signIn } = await getAuthHelpers();
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        return { success: true };
    } catch (err) {
        if (err && typeof err === 'object' && 'type' in err && err.type === "CredentialsSignin") {
            return { error: "Invalid credentials" };
        }
        return { error: "Something went wrong" };
    }
}

export async function registerAction(data: {
    email: string;
    password: string;
    name: string;
}) {
    try {
        const prisma = await getPrisma();
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            return { error: "User already exists with this email" };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                role: "CLIENT",
            },
        });

        return { success: true };
    } catch (err) {
        console.error("Registration error:", err);
        return { error: err instanceof Error ? err.message : "Registration failed. Please check your connection and try again." };
    }
}

export async function logoutAction() {
    const { signOut } = await getAuthHelpers();
    await signOut({ redirect: false });
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
) {
    const { auth } = await getAuthHelpers();
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
        where: { id: (session.user as { id: string }).id },
    });
    if (!user) throw new Error("User not found");

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new Error("Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
    });

    return { success: true };
}
