'use client';

import { useCart } from '@/context/CartContext';
import { useUser } from '@clerk/nextjs';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
// import * as PortOne from "@portone/browser-sdk/v2";
// import { logOrder } from '@/actions/order';

import { useRouter } from 'next/navigation';

export function CartDrawer() {
    const { items, removeItem, updateQuantity, total, isOpen, closeCart, clearCart } = useCart();
    const { user } = useUser();
    const router = useRouter();
    const [userPoints, setUserPoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);

    // Fetch points when drawer opens
    useEffect(() => {
        if (isOpen && user) {
            import('@/actions/user').then(({ getUserPoints }) => {
                getUserPoints(user.id).then(pts => setUserPoints(pts));
            });
        }
    }, [isOpen, user]);

    // Derived total
    const finalTotal = Math.max(0, total - pointsToUse);
    const earnedPoints = Math.floor(finalTotal * 0.02); // 2% accum

    const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        if (isNaN(val)) return;
        // Limit usage to (Total Amount) or (User Holdings), whichever is lower
        const maxUse = Math.min(total, userPoints);
        setPointsToUse(Math.min(val, maxUse));
    };

    const handlePayment = () => {
        closeCart();
        router.push('/cart');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        장바구니
                        <span className="text-sm font-normal text-zinc-500">({items.length}개)</span>
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <ShoppingBag className="w-12 h-12 text-zinc-300" />
                            <p className="text-zinc-500">장바구니가 비어있습니다.</p>
                            <button
                                onClick={closeCart}
                                className="text-sm font-medium underline underline-offset-4"
                            >
                                쇼핑 계속하기
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                                            <p className="text-sm text-zinc-500">{item.price.toLocaleString()} KRW</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-full px-2 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-1 hover:text-black dark:hover:text-white disabled:opacity-30"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:text-black dark:hover:text-white"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with Points and Total */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">

                        {/* Point Usage Section */}
                        {user && (
                            <div className="bg-white dark:bg-black p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">포인트 사용</span>
                                    <span className="text-xs text-zinc-500">보유: {userPoints.toLocaleString()}P</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={pointsToUse > 0 ? pointsToUse : ''}
                                        placeholder="0"
                                        onChange={handlePointChange}
                                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    />
                                    <button
                                        onClick={() => setPointsToUse(Math.min(total, userPoints))}
                                        className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200"
                                    >
                                        전액사용
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm text-zinc-500">
                                <span>주문 금액</span>
                                <span>{total.toLocaleString()} KRW</span>
                            </div>
                            {pointsToUse > 0 && (
                                <div className="flex justify-between items-center text-sm text-red-500">
                                    <span>포인트 할인</span>
                                    <span>- {pointsToUse.toLocaleString()} P</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <span className="text-base font-medium">최종 결제 금액</span>
                                <div className="text-right">
                                    <span className="block text-xl font-bold">{finalTotal.toLocaleString()} KRW</span>
                                    {user && <span className="text-xs text-blue-500">Expected +{earnedPoints.toLocaleString()}P (2%)</span>}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-full font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                        >
                            {finalTotal.toLocaleString()}원 결제하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
