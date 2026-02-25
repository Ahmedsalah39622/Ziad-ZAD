"use server";

// Lazy imports to keep server logic out of client bundles
async function getPrisma() {
    const m = await import("@/lib/prisma");
    return m.prisma;
}

async function getAuth() {
    const m = await import("@/lib/auth");
    return m.auth;
}

async function requireAdmin() {
    const auth = await getAuth();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

async function requireUser() {
    const auth = await getAuth();
    const session = await auth();
    if (!session?.user) {
        throw new Error("You must be logged in to complete this action");
    }
    return session;
}

export async function getOrders(status?: string) {
    const where = status && status !== "ALL" ? { status } : {};
    const prisma = await getPrisma();
    return prisma.order.findMany({
        where,
        include: {
            items: {
                include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getOrderById(id: string) {
    const prisma = await getPrisma();
    return prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: { product: true },
            },
        },
    });
}

export async function updateOrderStatus(id: string, status: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.order.update({
        where: { id },
        data: { status },
    });
}

export async function deleteOrder(id: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.order.delete({ where: { id } });
}

export async function getDashboardStats() {
    await requireAdmin();

    const prisma = await getPrisma();
    const [totalProducts, totalOrders, totalRevenue, recentOrders, ordersByStatus] =
        await Promise.all([
            prisma.product.count({ where: { active: true } }),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { total: true } }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { items: { include: { product: true } } },
            }),
            prisma.order.groupBy({
                by: ["status"],
                _count: { id: true },
            }),
        ]);

    const totalCustomers = await prisma.order.findMany({
        distinct: ["customerEmail"],
        select: { customerEmail: true },
    });

    return {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers: totalCustomers.length,
        recentOrders,
        ordersByStatus: ordersByStatus.map((s) => ({
            status: s.status,
            count: s._count.id,
        })),
    };
}

export async function createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    city: string;
    notes?: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
        size?: string;
        color?: string;
    }[];
    total: number;
}) {
    const session = await requireUser();
    const prisma = await getPrisma();

    return prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
            data: {
                userId: session.user?.id,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                address: data.address,
                city: data.city,
                notes: data.notes,
                total: data.total,
                status: "PENDING",
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size,
                        color: item.color,
                    })),
                },
            },
        });

        // Optional: Update stock
        for (const item of data.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        return order;
    });
}
