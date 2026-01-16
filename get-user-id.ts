
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function getEnv(key: string) {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')!;
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserForOrder() {
    const { data: order, error } = await supabase
        .from('orders')
        .select('user_id, id')
        .eq('id', 46) // Using 46 as it was seen in browser
        .single();

    if (error) {
        console.error('Error fetching order 46:', error);
        // Fallback: fetch any order
        const { data: anyOrder } = await supabase.from('orders').select('user_id, id').limit(1).single();
        if (anyOrder) console.log('Fallback Any Order User ID:', anyOrder.user_id);
        return;
    }

    console.log('Order 46 User ID:', order.user_id);
}

getUserForOrder();
