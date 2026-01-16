import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserOrders } from '@/actions/order';
import { MyOrderList } from '@/components/MyOrderList';
import { Package } from 'lucide-react';

export default async function MyPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/');
    }

    const { orders, error } = await getUserOrders(user.id);

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">마이 페이지</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    {user.firstName || user.username || '고객'}님의 주문 내역입니다.
                </p>
            </header>

            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    주문 내역을 불러오는 중 오류가 발생했습니다.
                </div>
            ) : (
                <MyOrderList orders={orders || []} />
            )}
        </div>
    );
}
