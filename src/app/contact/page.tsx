import { appendRow } from '@/lib/google-sheets';
import { ShoppingBag, Send } from 'lucide-react';

export default function ContactPage() {
    async function submitInquiry(formData: FormData) {
        'use server';

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        if (!name || !email || !message) return;

        // Append to 'Inquiries' sheet: [Date, Name, Email, Message]
        await appendRow('Inquiries!A:D', [
            new Date().toISOString(),
            name,
            email,
            message
        ]);
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <header className="mb-12 text-center">
                <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-50">
                    Contact Us
                </h1>
                <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                    Questions about our gravity-defying pieces? Let us know.
                </p>
            </header>

            <form action={submitInquiry} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4"
                        placeholder="Your Name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Message
                    </label>
                    <textarea
                        name="message"
                        id="message"
                        required
                        rows={5}
                        className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm focus:border-black focus:ring-black sm:text-sm py-3 px-4"
                        placeholder="How can we help?"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black py-4 rounded-full font-medium hover:scale-105 transition-transform"
                >
                    <Send className="w-4 h-4" />
                    Send Message
                </button>
            </form>
        </div>
    );
}
