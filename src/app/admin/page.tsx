
export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Cards */}
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-2">Total revenue</h3>
                    <p className="text-3xl font-bold">₩0</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-2">Orders</h3>
                    <p className="text-3xl font-bold">+0</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-2">Active Products</h3>
                    <p className="text-3xl font-bold">12</p>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-96 flex items-center justify-center text-zinc-400">
                Chart Placeholder
            </div>
        </div>
    );
}
