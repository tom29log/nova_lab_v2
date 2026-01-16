
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    // 1. Check if user is logged in
    if (!user) {
        redirect('/');
    }

    // 2. Check if user email matches ADMIN_EMAIL
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!adminEmail || userEmail !== adminEmail) {
        console.warn(`Unauthorized admin access attempt: ${userEmail}`);
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pl-64">
            <AdminSidebar />
            <main className="p-8">
                {children}
            </main>
        </div>
    );
}
