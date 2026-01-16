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

async function inspectOrder36() {
    console.log("Fetching order #36...");
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', 36)
        .single();

    if (error) {
        console.error("Error fetching order:", error);
        return;
    }

    console.log("Order #36 Status:", order.status);
    console.log("Payment Method:", order.payment_method);
    console.log("Payment ID:", order.payment_id);
    console.log("VBank Num:", order.vbank_num);
    console.log("Full Payment Info Keys:", order.payment_info ? Object.keys(order.payment_info) : 'null');

    if (order.payment_info?.method) {
        console.log("Payment Info Method:", order.payment_info.method);
    }
}

inspectOrder36();
