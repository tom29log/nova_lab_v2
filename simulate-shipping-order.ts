
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

async function simulateShippingOrder() {
    console.log('Creating order with Shipping Info...');

    // 1. Create Order with Shipping Info
    // This mimics what createOrder in src/actions/order.ts does, but directly via Supabase for simulation
    const shippingData = {
        recipient_name: '홍길동',
        recipient_phone: '010-1234-5678',
        shipping_address: '서울시 강남구 테헤란로 123',
        shipping_detail_address: '101동 101호',
        shipping_zipcode: '06234',
        shipping_memo: '문 앞에 놔주세요'
    };

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            user_id: 'user_37qlIRqrpHDfx9zAf8DGd1Z2KCI', // 'novaman'
            total_amount: 30000,
            status: 'paid', // Paid status to check display
            payment_method: 'CARD',
            ...shippingData
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        return;
    }

    console.log('Created Order ID:', order.id);

    // 2. Verify Data Saved
    const { data: savedOrder } = await supabase
        .from('orders')
        .select('recipient_name, recipient_phone, shipping_address, shipping_detail_address, shipping_zipcode, shipping_memo')
        .eq('id', order.id)
        .single();

    console.log('Saved Shipping Info:', savedOrder);
}

simulateShippingOrder();
