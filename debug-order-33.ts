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

async function inspectOrder() {
    console.log("Fetching order #33...");
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', 33)
        .single();

    if (error) {
        console.error("Error fetching order:", error);
        return;
    }

    console.log("Order Columns:", Object.keys(order));
    console.log("vbank_num:", order.vbank_num);
    console.log("Payment Method:", order.payment_method);
    console.log("Payment Info Structure:");
    console.log(JSON.stringify(order.payment_info, null, 2));
}

inspectOrder();
