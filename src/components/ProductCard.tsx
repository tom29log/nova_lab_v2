import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
    return (
        <Link href={`/shop/${product.id}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover Overlay / Quick Add could go here */}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5 dark:group-hover:bg-white/5" />
            </div>
            <div className="mt-4 space-y-1">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {product.price.toLocaleString()} KRW
                </p>
            </div>
        </Link>
    );
}
