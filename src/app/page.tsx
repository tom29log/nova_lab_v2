import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden min-h-screen">

        {/* Luxury Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay for readability */}
          {/* Placeholder for high-quality jewelry image - using Unsplash source directly for demo */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 animate-slow-zoom"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop')" }}
          />
        </div>

        <div className="relative z-20 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <main className="flex flex-col gap-8 items-center text-center text-white">
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-sans font-thin tracking-widest text-white drop-shadow-2xl">
                NOVA LAB
              </h1>
              <div className="h-px w-24 bg-white/60 mx-auto" />
              <p className="text-lg sm:text-2xl font-light tracking-[0.2em] uppercase text-white/90 break-keep max-w-2xl mx-auto leading-relaxed">
                당신의 가장 빛나는 순간을 위한,<br className="sm:hidden" /> 가볍지 않은 우아함.
              </p>
            </div>

            <div className="flex gap-6 items-center flex-col sm:flex-row pt-12">
              <Link
                href="/shop"
                className="group relative px-10 py-4 bg-transparent border border-white text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  VIEW COLLECTION
                </span>
              </Link>
            </div>
          </main>
        </div>
      </section>

      {/* Abstract spacer or visual element */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
    </div>
  );
}
