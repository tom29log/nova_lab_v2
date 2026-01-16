'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';

export function AddToCartButton({ product }: { product: Product }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAdd}
            disabled={added}
            className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all text-lg
        ${added
                    ? 'bg-green-600 text-white dark:bg-green-500 dark:text-black scale-95'
                    : 'bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-105'
                }`}
        >
            {added ? (
                <>
                    <Check className="w-5 h-5" />
                    담기 완료
                </>
            ) : (
                <>
                    <ShoppingBag className="w-5 h-5" />
                    장바구니 담기
                </>
            )}
        </button>
    );
}
