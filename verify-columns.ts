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

async function addColumns() {
    // We can't easily run arbitrary SQL via the client without a function, 
    // but we can try to insert a dummy record with these columns to see if it works, 
    // or use the rest API's meta features if available.
    // Actually, the best way is to ask the user to run the SQL or use an MCP tool if I had one for Supabase.
    // Wait, I can try to use `rpc` if there's an `exec_sql` function, but usually there isn't for security.

    console.log("Attempting to verify columns exist by fetching them...");
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('payment_method, payment_info')
        .limit(1);

    if (error) {
        console.log("Columns likely missing. Error:", error.message);
    } else {
        console.log("Columns verified!");
    }
}

addColumns();
