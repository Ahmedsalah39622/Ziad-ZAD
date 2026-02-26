"use server";

import { revalidatePath } from "next/cache";

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

export async function getOrders(options?: { status?: string; startDate?: Date; endDate?: Date }) {
    const { status, startDate, endDate } = options || {};
    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            const d = new Date(startDate);
            if (!isNaN(d.getTime())) where.createdAt.gte = d;
        }
        if (endDate) {
            const d = new Date(endDate);
            if (!isNaN(d.getTime())) where.createdAt.lte = d;
        }
    }
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
    const result = await prisma.order.update({
        where: { id },
        data: { status },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return result;
}

export async function deleteOrder(id: string) {
    await requireAdmin();
    const prisma = await getPrisma();
    return prisma.order.delete({ where: { id } });
}

export async function getDashboardStats(options?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = options || {};
    await requireAdmin();

    const where: any = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            const d = new Date(startDate);
            if (!isNaN(d.getTime())) where.createdAt.gte = d;
        }
        if (endDate) {
            const d = new Date(endDate);
            if (!isNaN(d.getTime())) where.createdAt.lte = d;
        }
    }

    const prisma = await getPrisma();

    try {
        // Fetch only the essentials: Product count and the main Order data
        const [totalProducts, allOrders] = await Promise.all([
            prisma.product.count({ where: { active: true } }),
            prisma.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                include: { items: { include: { product: true } } }
            })
        ]);

        // Aggregate everything in a single JS pass
        let totalRevenue = 0;
        const statusMap = new Map<string, number>();
        const productMap = new Map<string, { id: string; name: string; quantity: number; price: number }>();
        const clientMap = new Map<string, { name: string; email: string; phone: string; totalSpent: number; orderCount: number; lastOrder: Date }>();
        const dailyRevenueMap = new Map<string, { date: string; revenue: number; orders: number }>();

        allOrders.forEach(order => {
            // Basic counters
            totalRevenue += order.total;
            statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);

            // Client aggregation
            const client = clientMap.get(order.customerEmail);
            if (client) {
                client.totalSpent += order.total;
                client.orderCount += 1;
                if (order.createdAt > client.lastOrder) client.lastOrder = order.createdAt;
            } else {
                clientMap.set(order.customerEmail, {
                    name: order.customerName,
                    email: order.customerEmail,
                    phone: order.customerPhone,
                    totalSpent: order.total,
                    orderCount: 1,
                    lastOrder: order.createdAt
                });
            }

            // Daily aggregation
            const dayKey = order.createdAt.toISOString().split('T')[0];
            const daily = dailyRevenueMap.get(dayKey);
            if (daily) {
                daily.revenue += order.total;
                daily.orders += 1;
            } else {
                dailyRevenueMap.set(dayKey, {
                    date: dayKey,
                    revenue: order.total,
                    orders: 1
                });
            }

            // Product aggregation
            order.items.forEach(item => {
                const existing = productMap.get(item.productId);
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    productMap.set(item.productId, {
                        id: item.productId,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price
                    });
                }
            });
        });

        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 50);

        const clientStats = Array.from(clientMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent);

        const dailyStats = Array.from(dailyRevenueMap.values())
            .sort((a, b) => b.date.localeCompare(a.date));

        const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
            status,
            count
        }));

        return {
            totalProducts,
            totalOrders: allOrders.length,
            totalRevenue,
            totalCustomers: clientMap.size,
            recentOrders: allOrders.slice(0, 5),
            ordersByStatus,
            topProducts,
            clientStats,
            dailyStats,
            allOrders // Exposed to avoid redundant fetch on the page
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        throw new Error("Unable to generate report data. Please check your data or try again.");
    }
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
    discountCode?: string;
}) {
    const session = await requireUser();
    const prisma = await getPrisma();

    return prisma.$transaction(async (tx) => {
        let discountPct = 0;
        if (data.discountCode) {
            const dc = await tx.discountCode.findUnique({ where: { code: data.discountCode } });
            if (!dc) throw new Error("Invalid discount code");
            if (dc.expiresAt && dc.expiresAt < new Date()) throw new Error("Discount code has expired");
            if (dc.usedCount >= dc.usesPerCode) throw new Error("Discount code has no uses remaining");
            discountPct = dc.discountPct;
            await tx.discountCode.update({
                where: { code: data.discountCode },
                data: { usedCount: { increment: 1 } },
            });
        }

        const finalTotal = data.total * (1 - discountPct / 100);

        const order = await tx.order.create({
            data: {
                userId: session.user?.id,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                address: data.address,
                city: data.city,
                notes: data.notes,
                total: finalTotal,
                discountCode: data.discountCode,
                discountPct,
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
