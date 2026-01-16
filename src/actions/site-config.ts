'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getSiteConfig(key: string) {
    const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', key)
        .single();

    if (error) {
        // First run might return no row, which is fine
        return null;
    }
    return data?.value;
}

export async function updateSiteConfig(key: string, value: string) {
    const { error } = await supabase
        .from('site_config')
        .upsert({ key, value })
        .select();

    if (error) {
        console.error(`Error updating config ${key}:`, error);
        return { success: false, error: 'Failed to update configuration' };
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
}
