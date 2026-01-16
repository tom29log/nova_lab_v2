import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/product';

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function ShopPage() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return <div>Failed to load products.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                    컬렉션
                </h1>
                <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                    당신의 빛나는 순간을 위해
                </p>
            </header>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {(products as Product[])?.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </div>

            {(!products || products.length === 0) && (
                <div className="text-center py-20 text-zinc-500">
                    <p>등록된 상품이 없습니다. 관리자에게 문의하세요.</p>
                </div>
            )}
        </div>
    );
}
