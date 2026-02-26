import { getDashboardStats } from "@/lib/actions/order-actions";
import { formatCurrency } from "@/lib/format-currency";
import { ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReportFilters } from "@/components/admin/report-filters";
import { ReportTabs } from "@/components/admin/report-tabs";

interface ReportsPageProps {
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
        tab?: string;
        q?: string;
    }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const params = await searchParams;
    const activeTab = params.tab || "revenue";
    const searchQuery = params.q?.toLowerCase() || "";

    // Parse dates safely
    const startDate = params.startDate ? new Date(params.startDate) : undefined;
    const endDate = params.endDate ? new Date(params.endDate) : undefined;

    let stats: {
        dailyStats: { date: string, orders: number, revenue: number }[];
        clientStats: { name: string, email: string, phone: string, orderCount: number, totalSpent: number }[];
        topProducts: { id: string, name: string, quantity: number, price: number }[];
        allOrders: { id: string, customerName: string, customerEmail: string, createdAt: Date, total: number, status: string }[];
    };
    try {
        stats = await getDashboardStats({ startDate, endDate }) as typeof stats;
    } catch (error) {
        console.error("Reports Page Fetch Error:", error);
        return (
            <div className="max-w-4xl mx-auto p-20 text-center space-y-4">
                <div className="h-20 w-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Reporting Sync Error</h1>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">We encountered a temporary issue while aggregating your data. This is usually caused by an invalid date range or heavy server load.</p>
                <div className="pt-6">
                    <Link href="/admin/reports">
                        <Button className="bg-primary hover:opacity-90 text-primary-foreground font-black uppercase tracking-widest text-xs h-12 px-8">
                            Reset Report Filters
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const orders = stats.allOrders || [];

    const reportRange = startDate && endDate
        ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        : "All Time Performance";

    // Filtering logic for the active tab
    let filteredData: Array<Record<string, unknown>> = [];
    let tabTitle = "";

    if (activeTab === "revenue") {
        tabTitle = "Revenue Ledger";
        filteredData = stats.dailyStats.filter((d: { date: string }) => d.date.includes(searchQuery));
    } else if (activeTab === "clients") {
        tabTitle = "Client Database";
        filteredData = stats.clientStats.filter((c: { name: string; email: string; phone: string }) =>
            c.name.toLowerCase().includes(searchQuery) ||
            c.email.toLowerCase().includes(searchQuery) ||
            c.phone.includes(searchQuery)
        );
    } else if (activeTab === "orders") {
        tabTitle = "Order Registry";
        filteredData = orders.filter((o: { id: string; customerName: string; customerEmail: string }) =>
            o.id.toLowerCase().includes(searchQuery) ||
            o.customerName.toLowerCase().includes(searchQuery) ||
            o.customerEmail.toLowerCase().includes(searchQuery)
        );
    } else if (activeTab === "products") {
        tabTitle = "Product Performance";
        filteredData = stats.topProducts.filter((p: { name: string; id: string }) =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.id.toLowerCase().includes(searchQuery)
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-4 pb-20 order-print-container">
            {/* Custom Blue Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .order-print-container { max-width: 100% !important; margin: 0 !important; }
                    .blue-print-header { 
                        display: flex !important; 
                        justify-content: space-between; 
                        align-items: start;
                        border-bottom: 2px solid #2563eb; 
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .blue-table-header { background-color: #2563eb !important; color: white !important; -webkit-print-color-adjust: exact; }
                    .blue-table-header th { color: white !important; text-align: left !important; }
                    .print-summary-box { 
                        background-color: #f8fafc !important; 
                        border: 1px solid #e2e8f0 !important; 
                        padding: 15px; 
                        margin-top: 20px;
                        text-align: right;
                        -webkit-print-color-adjust: exact;
                    }
                }
            ` }} />

            {/* Header / Actions - Hidden in Print */}
            <div className="flex items-center justify-between no-print mb-4 px-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-foreground/5 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Business Intelligence</h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Ziad-ZAD Corporate</p>
                    </div>
                </div>
            </div>

            <ReportTabs />
            <ReportFilters totalCount={filteredData.length} data={filteredData} activeTab={activeTab} />

            {/* Print Only Header (WESCO Style) */}
            <div className="hidden blue-print-header items-center">
                <div>
                    <h1 className="text-3xl font-black text-blue-700 uppercase tracking-tighter mb-1">Ziad-ZAD Intelligence</h1>
                    <p className="text-lg font-black text-blue-600/80 uppercase mb-2">{tabTitle}</p>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] space-y-1">
                        <p>Report Date: {new Date().toLocaleDateString()}</p>
                        <p>Period: {reportRange}</p>
                    </div>
                </div>
                <div className="text-right">
                    {/* Placeholder for Logo matching the screenshot's right-aligned logo */}
                    <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl ml-auto mb-2">ZZ</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-900">Ziad-ZAD Corporate</div>
                </div>
            </div>

            {/* Print Only: Total Records Box (Top Position) */}
            <div className="hidden print:block bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Total Records Summary</span>
                    <span className="text-xl font-black text-blue-700 font-mono">{filteredData.length} entries</span>
                </div>
            </div>

            {/* Table Content */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-foreground/[0.02] text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border blue-table-header">
                        {activeTab === "revenue" && (
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Transactions</th>
                                <th className="px-6 py-4 text-right">Gross Revenue</th>
                            </tr>
                        )}
                        {activeTab === "clients" && (
                            <tr>
                                <th className="px-6 py-4">Client Detail</th>
                                <th className="px-6 py-4 text-center">Orders</th>
                                <th className="px-6 py-4 text-right">Total Spent</th>
                                <th className="px-6 py-4 text-right">Retention</th>
                            </tr>
                        )}
                        {activeTab === "orders" && (
                            <tr>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4 text-right">Value</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        )}
                        {activeTab === "products" && (
                            <tr>
                                <th className="px-6 py-4">Item Catalog</th>
                                <th className="px-6 py-4 text-center">Quantity Sold</th>
                                <th className="px-6 py-4 text-right">Income Generated</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {activeTab === "revenue" && filteredData.map((d: { date?: string; orders?: number; revenue?: number; }, i: number) => (
                            <tr key={i} className="hover:bg-foreground/[0.01]">
                                <td className="px-6 py-4 font-bold font-mono tracking-tighter">{d.date as string}</td>
                                <td className="px-6 py-4 text-center font-black">{d.orders as number} Transactions</td>
                                <td className="px-6 py-4 text-right font-black font-mono text-blue-600">{formatCurrency(d.revenue as number)}</td>
                            </tr>
                        ))}
                        {activeTab === "clients" && filteredData.map((c: { name?: string; phone?: string; email?: string; orderCount?: number; totalSpent?: number; }, i: number) => (
                            <tr key={i} className="hover:bg-foreground/[0.01]">
                                <td className="px-6 py-4">
                                    <div className="font-black uppercase text-[11px] underline decoration-blue-500/30">{c.name as string}</div>
                                    <div className="text-[9px] text-muted-foreground font-mono">{c.phone as string} • {c.email as string}</div>
                                </td>
                                <td className="px-6 py-4 text-center font-black">{c.orderCount as number}</td>
                                <td className="px-6 py-4 text-right font-black font-mono text-emerald-600">{formatCurrency(c.totalSpent as number)}</td>
                                <td className="px-6 py-4 text-right text-muted-foreground font-medium italic">{((c.totalSpent as number) / (c.orderCount as number)).toFixed(0)} avg. purchase</td>
                            </tr>
                        ))}
                        {activeTab === "orders" && filteredData.map((o: { id?: string; customerName?: string; createdAt?: string; total?: number; status?: string; }) => (
                            <tr key={o.id as string} className="hover:bg-foreground/[0.01]">
                                <td className="px-6 py-4 font-mono text-[10px]">#{(o.id as string).substring(0, 8).toUpperCase()}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold uppercase">{o.customerName as string}</div>
                                    <div className="text-[9px] text-muted-foreground">{new Date(o.createdAt as string).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-black font-mono text-blue-600">{formatCurrency(o.total as number)}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-[9px] font-black uppercase tracking-tighter bg-foreground/5 px-2 py-0.5 rounded italic">{o.status as string}</span>
                                </td>
                            </tr>
                        ))}
                        {activeTab === "products" && filteredData.map((p: { name?: string; id?: string; quantity?: number; price?: number; }, i: number) => (
                            <tr key={i} className="hover:bg-foreground/[0.01]">
                                <td className="px-6 py-4">
                                    <div className="font-black uppercase text-[11px]">{p.name as string}</div>
                                    <div className="text-[9px] text-muted-foreground font-mono italic">Ref: {(p.id as string).substring(0, 8)}</div>
                                </td>
                                <td className="px-6 py-4 text-center font-black">{p.quantity as number} Units</td>
                                <td className="px-6 py-4 text-right font-black font-mono text-emerald-600">{formatCurrency((p.quantity as number) * (p.price as number))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredData.length === 0 && (
                    <div className="p-20 text-center space-y-2">
                        <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No records found matching your filters</p>
                    </div>
                )}
            </div>

            {/* Print Footer Summary */}
            <div className="hidden print:block print-summary-box">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Record Count</p>
                <p className="text-2xl font-black text-blue-700 font-mono tracking-tighter">{filteredData.length}</p>
            </div>
        </div>
    );
}

