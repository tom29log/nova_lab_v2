import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

async function checkColumns() {
    // Dynamic import to ensure env vars are loaded first
    const { supabaseAdmin } = await import('./src/lib/supabase-admin');

    console.log("Checking columns in 'orders' table...");
    const { data, error } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'orders' });

    if (error) {
        // Fallback or if RPC not available
        console.error("RPC error:", error);
        // Try selecting one row to see error or data
        const { data: row, error: selectError } = await supabaseAdmin.from('orders').select('shipping_memo, recipient_name, shipping_zipcode').limit(1);
        if (selectError) {
            console.error("Select error (likely columns missing):", selectError);
        } else {
            console.log("Columns exist!");
        }
    } else {
        console.log("Columns:", data);
    }
}

checkColumns();
