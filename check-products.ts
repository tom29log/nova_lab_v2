import { supabaseAdmin } from './src/lib/supabase-admin';

async function checkProducts() {
    const { data, error } = await supabaseAdmin.from('products').select('id, name');
    if (error) {
        console.error('Error fetching products:', error);
    } else {
        console.log('Available products:', data);
    }
}

checkProducts();
