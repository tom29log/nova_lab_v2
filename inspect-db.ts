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

async function inspectTable() {
    console.log("Inspecting 'orders' table columns...");
    // Fetch one row to see what columns come back
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching order:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in first row:", Object.keys(data[0]));
    } else {
        // If table is empty, we can try to get metadata but Supabase JS doesn't have a direct way.
        // We can try to select a column we suspect might not exist.
        console.log("Table might be empty. Trying to select suspected columns...");
        const cols = [
            'vbank_num', 'vbank_name', 'vbank_holder', 'vbank_date',
            'recipient_name', 'recipient_phone', 'shipping_address', 'shipping_detail_address', 'shipping_zipcode', 'shipping_memo',
            'cash_receipt_number', 'cash_receipt_type'
        ];
        for (const col of cols) {
            const { error: colError } = await supabaseAdmin.from('orders').select(col).limit(1);
            if (colError) {
                console.log(`Column '${col}' does NOT exist or error:`, colError.message);
            } else {
                console.log(`Column '${col}' exists.`);
            }
        }
    }
}

inspectTable();
