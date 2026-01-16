'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Fallback strictly for dev, should use SERVICE_ROLE for admin actions usually
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseInt(formData.get('price') as string);
    const category = formData.get('category') as string;
    const imageUrl = formData.get('imageUrl') as string;

    if (!name || !price || !category) {
        return { success: false, error: 'Missing required fields' };
    }

    const imageFile = formData.get('image') as File;
    let finalImageUrl = imageUrl;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, imageFile, {
                contentType: imageFile.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { success: false, error: 'Image upload failed' };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
    }

    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                name,
                description,
                price,
                category,
                images: [finalImageUrl], // Storing as array as per schema
                stock: 10, // Default stock
            },
        ])
        .select();

    if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    return { success: true, data };
}

export async function deleteProduct(id: number) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/products');
    return { success: true };
}

export async function updateProduct(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const priceStr = formData.get('price') as string;
    const stockStr = formData.get('stock') as string;
    const imageUrl = formData.get('imageUrl') as string; // Define imageUrl from formData

    // Parse numbers carefully (handle commas)
    const price = priceStr ? Number(priceStr.replace(/,/g, '')) : NaN;
    const stock = stockStr ? Number(stockStr.replace(/,/g, '')) : 0;

    if (!id || !name || isNaN(price)) {
        return { success: false, error: 'Invalid data provided' };
    }

    const updates: any = {
        name,
        description: formData.get('description'),
        price,
        stock,
        category: formData.get('category'),
    };

    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, imageFile, {
                contentType: imageFile.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { success: false, error: 'Image upload failed' };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        updates.images = [publicUrl];
    }

    if (imageUrl) {
        updates.images = [imageUrl];
        console.log('[updateProduct] New image URL received:', imageUrl);
    } else {
        console.log('[updateProduct] No new image URL provided.');
    }

    console.log('[updateProduct] Updates object:', JSON.stringify(updates, null, 2));

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
        console.error('Update returned no data. Possible RLS issue or ID mismatch.');
        return { success: false, error: 'Update failed: Product not found or Access Denied. Check server logs.' };
    }

    revalidatePath('/shop');
    revalidatePath('/admin/products');
    return { success: true, data };
}
