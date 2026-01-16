
import { clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Helper to fetch points for a list of users
async function getUsersPoints(clerkIds: string[]) {
    if (clerkIds.length === 0) return {};

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Using service role to bypass potential RLS issues for admin view
    const { data } = await supabase
        .from('users')
        .select('clerk_id, points')
        .in('clerk_id', clerkIds);

    const pointMap: Record<string, number> = {};
    data?.forEach((r) => {
        pointMap[r.clerk_id] = r.points;
    });
    return pointMap;
}

export default async function AdminUsersPage(props: {
    searchParams: Promise<{ search?: string; page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const query = searchParams.search || '';

    let users: any[] = [];
    let totalCount = 0;
    let userPoints: Record<string, number> = {};

    try {
        const client = await clerkClient();

        // 1. Get filtered user list
        const userList = await client.users.getUserList({
            limit,
            offset,
            query: query.length > 0 ? query : undefined,
            orderBy: '-created_at',
        });

        users = userList.data;
        totalCount = userList.totalCount;

        // Fetch points for these users from Supabase
        const clerkIds = users.map(u => u.id);
        userPoints = await getUsersPoints(clerkIds);

    } catch (error) {
        console.error('Failed to fetch users:', error);
    }

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full text-sm font-medium">
                        {totalCount} Total
                    </span>
                </div>

                <form className="relative w-full sm:w-72">
                    <input
                        type="text"
                        name="search"
                        defaultValue={query}
                        placeholder="Search ID or username..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                </form>
            </div>

            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium text-zinc-500">Username</th>
                                <th className="px-6 py-4 text-left font-medium text-zinc-500">ID</th>
                                <th className="px-6 py-4 text-left font-medium text-zinc-500">Password</th>
                                <th className="px-6 py-4 text-left font-medium text-zinc-500">Points</th>
                                <th className="px-6 py-4 text-left font-medium text-zinc-500">Joined</th>
                                <th className="px-6 py-4 text-left font-medium text-zinc-500">Last Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.imageUrl}
                                                    alt={user.username || 'User'}
                                                    className="w-10 h-10 rounded-full bg-zinc-100 object-cover border border-zinc-100 dark:border-zinc-800"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {user.username || user.emailAddresses[0]?.emailAddress || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                                            {// Primary email as ID
                                                user.emailAddresses[0]?.emailAddress}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 text-xs tracking-widest">
                                            ********
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                                            {(userPoints[user.id] || 0).toLocaleString()} P
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {user.lastSignInAt
                                                ? new Date(user.lastSignInAt).toLocaleDateString()
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div className="text-xs text-zinc-500">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            {page > 1 && (
                                <a
                                    href={`?page=${page - 1}&search=${query}`}
                                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Previous
                                </a>
                            )}
                            {page < totalPages && (
                                <a
                                    href={`?page=${page + 1}&search=${query}`}
                                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    Next
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Ensure the page is dynamic since it uses searchParams
export const dynamic = 'force-dynamic';
