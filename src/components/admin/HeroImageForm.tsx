'use client';

import { useState } from 'react';
import { updateSiteConfig } from '@/actions/site-config';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Upload, Save, ImageIcon } from 'lucide-react';

// Client-side Supabase for Storage Upload
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function HeroImageForm({ initialUrl }: { initialUrl?: string }) {
    const [url, setUrl] = useState(initialUrl || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hero_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('products') // Reuse products bucket or create 'site' bucket
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

            setUrl(publicUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateSiteConfig('hero_image', url);
        setIsSaving(false);

        if (result.success) {
            alert('Main image updated!');
        } else {
            alert('Failed to update image.');
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-zinc-500" />
                <h3 className="font-bold text-lg">Main Hero Image</h3>
            </div>

            <p className="text-sm text-zinc-500">Change the large background image on the homepage.</p>

            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                {url ? (
                    <img src={url} alt="Hero Preview" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-zinc-400 text-sm">No image set</span>
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <label className="flex-1 cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-300 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload New
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !url}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
