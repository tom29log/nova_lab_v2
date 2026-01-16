'use client';

import { useState } from 'react';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { createProduct } from '@/app/actions/product';

// Initialize Supabase Client for Storage Upload
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ProductForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        // 1. Upload Image
        const file = (formData.get('image') as File);
        if (!file || file.size === 0) {
            alert('Please select an image.');
            setIsSubmitting(false);
            return;
        }

        // 2. Submit to Server Action
        const actionFormData = new FormData();
        actionFormData.append('name', formData.get('name') as string);
        actionFormData.append('price', formData.get('price') as string);
        actionFormData.append('description', formData.get('description') as string);
        actionFormData.append('category', formData.get('category') as string);
        if (file) {
            actionFormData.append('image', file);
        }

        const result = await createProduct(actionFormData);

        if (result.success) {
            setIsOpen(false);
            setPreviewUrl(null);
            // Optional: Reset form
        } else {
            alert('Failed to create product: ' + result.error);
        }

        setIsSubmitting(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            >
                <Plus className="w-4 h-4" />
                Add Product
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-xl font-serif font-bold">New Product</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image</label>
                                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center relative hover:border-zinc-400 transition-colors">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="h-40 mx-auto object-contain rounded-md" />
                                    ) : (
                                        <div className="space-y-2 text-zinc-400">
                                            <Upload className="w-8 h-8 mx-auto" />
                                            <p className="text-xs">Click to upload</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <input name="name" className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm" required placeholder="Product Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price (KRW)</label>
                                    <input type="number" name="price" className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm" required placeholder="0" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select name="category" className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm" required>
                                    <option value="Necklace">목걸이</option>
                                    <option value="Ring">반지</option>
                                    <option value="Earring">귀걸이</option>
                                    <option value="Bracelet">팔찌</option>
                                    <option value="Hairpin">헤어핀</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea name="description" rows={3} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-sm" required placeholder="Product description..." />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
