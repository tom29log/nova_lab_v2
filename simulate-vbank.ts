
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

async function simulateVBankOrder() {
    console.log('Creating dummy order for Real User...');

    // 1. Create Order
    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            user_id: 'user_37qlIRqrpHDfx9zAf8DGd1Z2KCI', // Correct user ID
            total_amount: 50000,
            status: 'pending',
            payment_method: 'VIRTUAL_ACCOUNT'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        return;
    }

    console.log('Created Order ID:', order.id);

    // 2. Simulate Update with VBank Info
    console.log('Updating with VBank info...');
    const vbankData = {
        vbank_num: '123-456-7890',
        vbank_name: 'TEST_BANK',
        vbank_holder: 'Test Holder',
        vbank_date: new Date(Date.now() + 86400000).toISOString() // +1 day
    };

    const { error: updateError } = await supabase
        .from('orders')
        .update({
            status: 'ready',
            payment_method: 'VIRTUAL_ACCOUNT',
            ...vbankData
        })
        .eq('id', order.id);

    if (updateError) {
        console.error('Error updating order:', updateError);
        return;
    }

    // 3. Verify
    const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();

    console.log('Updated Order VBank Columns:', {
        vbank_num: updatedOrder.vbank_num,
        vbank_name: updatedOrder.vbank_name,
        vbank_holder: updatedOrder.vbank_holder,
        vbank_date: updatedOrder.vbank_date
    });
}

simulateVBankOrder();
