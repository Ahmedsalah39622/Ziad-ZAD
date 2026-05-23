export const dynamic = 'force-dynamic';

import { getDashboardStats } from "@/lib/actions/order-actions";
import { ClientList } from "./client-list";

export const metadata = {
    title: "Clients - Admin",
};

// ISR: Revalidate every 1 minute
export const revalidate = 60;

export default async function ClientsPage() {
    // We already have a robust aggregation function from the dashboard
    // No need to write a new one unless it gets too slow.
    const stats = await getDashboardStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter uppercase">Clients</h1>
                <p className="text-muted-foreground mt-2">
                    Manage customers and view their complete order history.
                </p>
            </div>

            <ClientList
                clientStats={stats.clientStats}
                allOrders={stats.allOrders}
            />
        </div>
    );
}
