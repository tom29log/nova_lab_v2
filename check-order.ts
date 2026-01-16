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
const supabaseAdminKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);

async function checkOrder(orderId: number) {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    if (error) {
        console.error('Error fetching order:', error);
    } else {
        console.log('Order Data Found:');
        console.log(JSON.stringify(data, null, 2));
    }
}

const orderId = 32;
checkOrder(orderId);
