
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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrder() {
    console.log('Fetching Order #40...');

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', 40)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return;
    }

    console.log('Order Full Object:', JSON.stringify(order, null, 2));
}

checkOrder();
