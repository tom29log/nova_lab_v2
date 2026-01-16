'use client';

import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { CreditCard } from 'lucide-react';

import { useRouter } from 'next/navigation';

export function BuyNowButton({ product }: { product: Product }) {
    const { addItem } = useCart();
    const router = useRouter();

    const handleBuyNow = () => {
        addItem(product);
        router.push('/cart');
    };

    return (
        <button
            onClick={handleBuyNow}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white rounded-full font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-lg"
        >
            <CreditCard className="w-5 h-5" />
            바로 구매하기
        </button>
    );
}
