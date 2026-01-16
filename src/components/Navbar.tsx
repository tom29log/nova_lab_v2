'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { itemCount, openCart } = useCart();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide Navbar on Admin pages to prevent layout conflicts
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const displayName = user?.username || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md dark:bg-black/80 border-b border-zinc-100 dark:border-zinc-800 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="text-xl font-bold tracking-tighter">
            NOVA_LAB
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/collections" className="hover:text-black dark:hover:text-white transition-colors">
              COLLECTIONS
            </Link>
            <Link href="/shop" className="hover:text-black dark:hover:text-white transition-colors">
              SHOP
            </Link>
            <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">
              ABOUT
            </Link>
            <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
              CONTACT
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            className="relative p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                {itemCount}
              </span>
            )}
          </button>

          <div className="flex items-center min-w-[32px] gap-3">
            <SignedIn>
              <span className="text-xs md:text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {displayName}님
              </span>
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="마이 페이지 (주문 내역)"
                    labelIcon={<ShoppingCart className="w-4 h-4" />}
                    onClick={() => window.location.href = '/my-page'}
                  />
                  <UserButton.Action
                    label="Admin Dashboard"
                    labelIcon={<Menu className="w-4 h-4" />}
                    onClick={() => window.open('/admin', '_blank')}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  로그인
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-black border-b border-zinc-100 dark:border-zinc-800 md:hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col p-4 gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link
              href="/collections"
              className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              COLLECTIONS
            </Link>
            <Link
              href="/shop"
              className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              SHOP
            </Link>
            <Link
              href="/about"
              className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link
              href="/contact"
              className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
