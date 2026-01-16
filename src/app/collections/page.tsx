import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Product } from '@/types/product';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CollectionsPage() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching collections (products):', error);
        return <div>Failed to load collections.</div>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-thin tracking-widest uppercase text-zinc-900 dark:text-white">
                        Collections
                    </h1>
                    <div className="h-px w-16 bg-zinc-400 mx-auto" />
                    <p className="text-zinc-500 dark:text-zinc-400 tracking-wider font-light max-w-2xl mx-auto">
                        Timeless elegance, curated for you.
                    </p>
                </div>

                {/* Grid */}
                {(!products || products.length === 0) ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 font-light">
                            No products found. Please add products in the Admin Dashboard.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(products as Product[]).map((item, index) => (
                            <div
                                key={item.id}
                                className="group relative break-inside-avoid space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                    {item.images && item.images[0] ? (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-300">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                                    {/* Sold Out Badge */}
                                    {item.stock <= 0 && (
                                        <div className="absolute top-0 right-0 m-4 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10">
                                            Sold Out
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 text-center">
                                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white uppercase tracking-widest">
                                        {item.name}
                                    </h3>
                                    {item.description && (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.price > 0 && (
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white pt-2">
                                            {item.price.toLocaleString()} KRW
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
