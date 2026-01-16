
import Link from "next/link";
import { ArrowRight, Gem, Feather, Star } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
            {/* 1. Hero Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    {/* Luxury atelier or jewelry closeup */}
                    <div
                        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2000&auto=format&fit=crop')" }}
                    />
                </div>

                <div className="relative z-20 text-center space-y-6 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <span className="text-white/80 tracking-[0.3em] uppercase text-xs sm:text-sm">Our Philosophy</span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white leading-tight">
                        비범한 빛,<br />그 이상의 가치
                    </h1>
                    <p className="text-white/90 max-w-xl mx-auto text-lg font-light leading-relaxed">
                        NOVA LAB은 단순히 액세서리를 팔지 않습니다.<br />
                        당신의 가장 빛나는 순간을 조각합니다.
                    </p>
                </div>
            </section>

            {/* 2. Story Section (Split Layout) */}
            <section className="py-24 sm:py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-[4/5] overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1200&auto=format&fit=crop')" }}
                        />
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-3xl sm:text-4xl font-serif">
                            Curated Masterpieces for<br />
                            <span className="italic text-zinc-500">Timeless Elegance</span>
                        </h2>
                        <div className="space-y-6 text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
                            <p>
                                우리는 전 세계에서 가장 감각적이고 독창적인 주얼리를 엄선하여 소개합니다.
                                화려함 속에 감춰진 절제미, 그리고 착용하는 순간 느껴지는 무게 없는 편안함을 추구합니다.
                            </p>
                            <p>
                                유행을 쫓기보다, 시간이 흘러도 변치 않는 가치를 지향합니다.
                                NOVA LAB의 컬렉션은 당신의 일상에 은은하지만 확실한 존재감을 더해줄 것입니다.
                            </p>
                        </div>
                        <div className="pt-4">
                            <div className="h-px w-24 bg-zinc-900 dark:bg-zinc-100" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Values Section */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl font-serif">Core Values</h2>
                        <p className="text-zinc-500">우리가 지키고자 하는 약속들</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Value 1 */}
                        <div className="space-y-6 text-center group">
                            <div className="w-16 h-16 mx-auto bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Gem className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-medium tracking-wide">Craftsmanship</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm">
                                타협하지 않는 품질.<br />
                                작은 디테일 하나까지 완벽을 기합니다.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="space-y-6 text-center group">
                            <div className="w-16 h-16 mx-auto bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Star className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-medium tracking-wide">Exclusivity</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm">
                                흔하지 않은, 오직 소수만을 위한<br />
                                특별한 컬렉션을 제안합니다.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="space-y-6 text-center group">
                            <div className="w-16 h-16 mx-auto bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Feather className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-medium tracking-wide">Comfort</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm">
                                아름다움은 불편하지 않아야 합니다.<br />
                                깃털처럼 가벼운 착용감을 선사합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. CTA Section */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl sm:text-5xl font-serif leading-tight">
                        당신의 이야기를<br />완성할 시간입니다.
                    </h2>
                    <div className="pt-8">
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 border-b border-black dark:border-white pb-1 hover:opacity-50 transition-opacity uppercase tracking-widest text-sm"
                        >
                            View Collection <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
