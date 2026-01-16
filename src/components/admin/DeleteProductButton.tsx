'use client';

import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/actions/product';
import { useTransition } from 'react';

export function DeleteProductButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this product?')) {
            startTransition(async () => {
                const result = await deleteProduct(id);
                if (!result.success) {
                    alert('Failed to delete: ' + result.error);
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            title="Delete Product"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
