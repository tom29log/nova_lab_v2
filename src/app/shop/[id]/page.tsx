import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/AddToCartButton';
import { BuyNowButton } from '@/components/BuyNowButton';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for product pages
export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        notFound();
    }

    const p = product as Product;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-black dark:hover:text-white mb-8 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                목록으로 돌아가기
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-md">
                        <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    {/* Additional thumbnails could go here */}
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-center">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                            {p.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                        {p.name}
                    </h1>
                    <p className="text-2xl font-light text-zinc-900 dark:text-zinc-50 mb-8">
                        {p.price.toLocaleString()} KRW
                    </p>

                    <div className="prose prose-zinc dark:prose-invert mb-10 max-w-none">
                        <p>{p.description}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <AddToCartButton product={p} />
                        <BuyNowButton product={p} />
                    </div>

                    {/* Features list (if available or mocked for now) */}
                    <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-sm font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                            제품 특징
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                프리미엄 소재
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                수작업 디테일
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                안티 그래비티 디자인
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                친환경 패키징
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
