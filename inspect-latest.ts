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

async function inspectLatestOrder() {
    console.log("Fetching latest order...");
    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching order:", error);
        return;
    }

    const order = orders[0];
    console.log("Latest Order ID:", order.id);
    console.log("Payment ID:", order.payment_id);

    const secret = getEnv('PORTONE_API_SECRET');
    if (secret && order.payment_id) {
        console.log("Fetching from PortOne API with secret...");
        try {
            const response = await fetch(`https://api.portone.io/payments/${order.payment_id}`, {
                headers: {
                    'Authorization': `PortOne ${secret}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log("PortOne API Response View:");
            if (data.virtualAccount) console.log("Found data.virtualAccount:", data.virtualAccount);
            if (data.payment?.virtualAccount) console.log("Found data.payment.virtualAccount:", data.payment.virtualAccount);
            if (data.method) console.log("Found data.method:", JSON.stringify(data.method, null, 2));
            console.log("Full Structure Keys:", Object.keys(data));
        } catch (e) {
            console.error("API Error:", e);
        }
    }
}

inspectLatestOrder();
