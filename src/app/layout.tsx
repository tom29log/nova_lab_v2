import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { koKR } from '@clerk/localizations';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { CartDrawer } from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "NOVA LAB | 당신의 가장 빛나는 순간을 위해",
  description: "가볍지 않은 우아함, NOVA LAB 하이엔드 액세서리 컬렉션.",
};

const customLocalization = {
  ...koKR,
  signUp: {
    ...koKR.signUp,
    start: {
      ...koKR.signUp?.start,
      formFieldInputPlaceholder__username: '닉네임 (영문 포함 4자 이상)',
    },
  },
  unstable__errors: {
    ...koKR.unstable__errors,
    form_identifier_taken: '닉네임이 이미 사용중입니다.',
    form_username_taken: '닉네임이 이미 사용중입니다.',
    form_username_invalid: '적어도 한자는 영어알파벳이 들어가야 합니다.',
    form_password_length_invalid: '비밀번호는 8자 이상이어야 합니다.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={customLocalization}>
      <html lang="en" className="light" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-white text-zinc-900 font-sans`}
          suppressHydrationWarning
        >
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="pt-20 min-h-screen">
              {children}
            </main>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider >
  );
}
