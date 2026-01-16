
import { AdminSidebar } from '@/components/admin/Sidebar';

export default function AdminSidebarDebugPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pl-64">
            <AdminSidebar />
            <main className="p-8">
                <h1 className="text-3xl font-bold">Sidebar Debug Page</h1>
                <p>If you see this, the sidebar is working fine.</p>
            </main>
        </div>
    );
}
