'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType, useCart } from '@/context/CartContext';
import Link from 'next/link';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    return (
        <div className="flex gap-4 py-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <Link href={`/shop/${item.id}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
            </Link>

            <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                    <div>
                        <Link href={`/shop/${item.id}`} className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
                            {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {item.category}
                        </p>
                    </div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {(item.price * item.quantity).toLocaleString()} KRW
                    </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center rounded-full border border-zinc-200 dark:border-zinc-700">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-black dark:hover:text-white text-zinc-500 transition-colors"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-black dark:hover:text-white text-zinc-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
