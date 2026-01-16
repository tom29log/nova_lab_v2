import { getSiteConfig } from '@/actions/site-config';
import { HeroImageForm } from '@/components/admin/HeroImageForm';
import { createClient } from '@supabase/supabase-js';

// ... existing imports ...

// Helper for stats
async function getStats() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Simple counts (optional enhancement)
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    // For orders/revenue we'd need more complex queries or accept 0 for now
    return { productCount: productCount || 0 };
}

export default async function AdminDashboardPage() {
    const heroImage = await getSiteConfig('hero_image');
    const stats = await getStats();

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
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-2">Active Products</h3>
                    <p className="text-3xl font-bold">{stats.productCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Image Manager */}
                <HeroImageForm initialUrl={heroImage} />

                {/* Placeholder for Chart or other widgets */}
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-400">
                    Chart Placeholder
                </div>
            </div>
        </div>
    );
}
