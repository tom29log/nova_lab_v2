'use server';

import { prependRow } from '@/lib/google-sheets';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface OrderItemInput {
    productId: number;
    quantity: number;
    price: number;
}

export interface CreateOrderData {
    userId: string;
    totalAmount: number;
    items: OrderItemInput[];
    paymentId?: string;
    // Shipping Info
    recipientName?: string;
    recipientPhone?: string;
    shippingAddress?: string;
    shippingDetailAddress?: string;
    shippingZipcode?: string;
    shippingMemo?: string;
}

interface OrderData {
    paymentId: string;
    total: number;
    items: string; // JSON string of items or simplified summary
    customerEmail: string;
}

export async function createOrder(data: CreateOrderData) {
    try {
        // 1. Create the order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: data.userId,
                total_amount: data.totalAmount,
                status: 'pending',
                payment_id: data.paymentId,
                // Shipping columns
                recipient_name: data.recipientName,
                recipient_phone: data.recipientPhone,
                shipping_address: data.shippingAddress, // Caution: Schema might be JSONB, but user requested Text. If valid logic, this saves.
                shipping_detail_address: data.shippingDetailAddress,
                shipping_zipcode: data.shippingZipcode,
                shipping_memo: data.shippingMemo,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create order items
        const orderItems = data.items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error };
    }
}

function logDebug(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    try {
        const fs = require('fs');
        fs.appendFileSync('server-debug.log', logMessage);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

async function getPortOnePaymentDetails(paymentId: string) {
    logDebug('getPortOnePaymentDetails called', { paymentId });
    try {
        const secret = process.env.PORTONE_API_SECRET;
        if (!secret) {
            logDebug('PORTONE_API_SECRET is not set');
            throw new Error('API Secret is missing on Server');
        }

        // 1. Check if ID is likely a Merchant ID (starts with ORD-) or generic ID (not UUID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentId);

        // If it's NOT a UUID, we must FIND the Real UUID first using the Merchant ID
        let targetUuid = paymentId;

        if (!isUuid) {
            logDebug(`Input ID '${paymentId}' is NOT a UUID. Attempting lookup by Merchant ID...`);

            // Try searching by 'merchant_uid' (Common PortOne parameter) or 'paymentId' (V2 specific)
            // Strategy: Try 'paymentId' first (V2), if empty try 'merchant_uid' (Legacy/Hybrid)
            // Actually, based on recent docs, V2 might use specific filter object or different path.
            // But let's try the most likely query params.

            // Attempt 1: merchant_uid[] (V2 Standard for searching by Merchant ID)
            // PortOne V2 API often uses `merchant_uid[]` to return a list.
            let searchUrl = `https://api.portone.io/payments?merchant_uid[]=${paymentId}`;

            const searchResponse = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `PortOne ${secret}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            if (!searchResponse.ok) {
                const err = await searchResponse.text();
                logDebug('Merchant ID Lookup failed', { status: searchResponse.status, body: err });
                // If 404, we really can't find it.
            } else {
                const searchData = await searchResponse.json();
                // Check format - V2 Response usually { data: [...] } or { payments: [...] } or just [...]
                let foundItem = null;
                if (searchData.data && Array.isArray(searchData.data)) foundItem = searchData.data[0];
                else if (Array.isArray(searchData)) foundItem = searchData[0];

                if (foundItem) {
                    targetUuid = foundItem.id || foundItem.paymentId;
                    logDebug(`Found UUID from Merchant ID: ${targetUuid}`);
                } else {
                    logDebug('Merchant ID lookup returned no results', searchData);
                    // Critical: If lookup fails, maybe try V1 style just in case? Or stop.
                    // Let's assume V2 works with merchant_uid[].
                }
            }
        }

        // 2. Fetch Payment Details using UUID
        const response = await fetch(`https://api.portone.io/payments/${targetUuid}`, {
            method: 'GET',
            headers: {
                'Authorization': `PortOne ${secret}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Ensure fresh data
        });

        if (!response.ok) {
            const errorText = await response.text();
            logDebug('PortOne API fetch failed', { status: response.status, body: errorText, targetUuid });
            const maskedSecret = secret ? secret.substring(0, 5) + '...' : 'NONE';
            throw new Error(`API Error ${response.status}: ${errorText} (Secret: ${maskedSecret})`);
        }

        const data = await response.json();
        logDebug('PortOne API fetch success', { keys: Object.keys(data) });
        return data;
    } catch (error: any) {
        logDebug('Error fetching PortOne payment details', error);
        console.error('Error fetching PortOne payment details:', error);
        throw error; // Re-throw to be caught by verifyPayment
    }
}

export async function updateOrderStatus(
    orderId: number,
    status: string,
    paymentId?: string,
    paymentMethod?: string,
    paymentInfo?: any,
    vbankNum?: string,
    vbankName?: string,
    vbankHolder?: string,
    vbankDate?: string
) {
    logDebug('updateOrderStatus called', { orderId, status, paymentId, paymentMethod, vbankNum });
    try {
        let finalPaymentInfo = paymentInfo;
        let finalVbankNum = vbankNum;
        let finalVbankName = vbankName;
        let finalVbankHolder = vbankHolder;
        let finalVbankDate = vbankDate;

        // If it's a virtual account but we don't have the number, try fetching from PortOne API
        if (paymentMethod === 'VIRTUAL_ACCOUNT' && !vbankNum && paymentId) {
            console.log('Fetching full payment details from PortOne for:', paymentId);
            const fullPaymentData = await getPortOnePaymentDetails(paymentId);

            if (fullPaymentData) {
                finalPaymentInfo = fullPaymentData;
                // Extract vbank details from full API response
                // PortOne V2 structure: method { type: 'PaymentMethodVirtualAccount', accountNumber: '...', ... }
                const method = fullPaymentData.method;
                const va = fullPaymentData.virtualAccount ||
                    fullPaymentData.payment?.virtualAccount ||
                    (method && method.type === 'PaymentMethodVirtualAccount' ? method : null) ||
                    method?.virtualAccount;

                if (va) {
                    finalVbankNum = va.accountNumber;
                    // Map generic bank code or name
                    // PortOne V2 API returns 'NONGHYUP' etc. for bank
                    finalVbankName = va.bank || va.bankName;
                    // Holder might be remitteeName (Receiver - PG/Merchant)
                    finalVbankHolder = va.holder || va.remitteeName || va.customerName;
                    finalVbankDate = va.expiryDate || va.dueDate || va.expiredAt;
                    console.log('Extracted VBank details:', { finalVbankNum, finalVbankName });
                }
            }
        }

        const updateData: any = {
            status,
            payment_id: paymentId,
            payment_method: paymentMethod,
            payment_info: finalPaymentInfo, // Save full info including JSON
        };

        // Only add explicit columns if we have data (or if we want to explicitly null them)
        // We add them to the update object. If the columns don't exist in DB, this might throw error,
        // but user said they added them.
        if (finalVbankNum) updateData.vbank_num = finalVbankNum;
        if (finalVbankName) updateData.vbank_name = finalVbankName;
        if (finalVbankHolder) updateData.vbank_holder = finalVbankHolder;
        if (finalVbankDate) updateData.vbank_date = finalVbankDate;

        logDebug('Updating Supabase with data', updateData);

        const { error } = await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) {
            logDebug('Supabase update error', error);
            throw error;
        }
        logDebug('Supabase update success');
        return { success: true };
    } catch (error) {
        logDebug('updateOrderStatus failed', error);
        console.error('Error updating order status:', error);
        return { success: false, error };
    }
}

// Enhanced logOrder with fallback for missing items (e.g., mobile redirect)
// Enhanced logOrder with fallback for missing items (e.g., mobile redirect)
export async function logOrder(orderData: OrderData & {
    userId?: string;
    usedPoints?: number;
    earnedPoints?: number;
    dbOrderId?: number; // Optional DB ID for fallback lookup
}) {
    let itemsStr = orderData.items;
    let recipientName = '';
    let recipientPhone = '';
    let shippingAddress = '';

    // Fallback: Fetch missing details from DB if we have an Order ID
    if (orderData.dbOrderId) {
        try {
            const { data: order } = await supabaseAdmin
                .from('orders')
                .select(`
                    recipient_name, 
                    recipient_phone, 
                    shipping_address, 
                    shipping_detail_address, 
                    shipping_zipcode,
                    order_items(quantity, products(name))
                `)
                .eq('id', orderData.dbOrderId)
                .single();

            if (order) {
                // 1. Recover Items if missing
                if (!itemsStr || itemsStr.length < 2) {
                    if (order.order_items) {
                        itemsStr = order.order_items
                            .map((i: any) => `${i.products?.name} (${i.quantity})`)
                            .join(', ');
                    }
                }

                // 2. Get Shipping Info
                recipientName = order.recipient_name || '';
                recipientPhone = order.recipient_phone || '';

                const addr = order.shipping_address || '';
                const detail = order.shipping_detail_address || '';
                const zip = order.shipping_zipcode || '';
                shippingAddress = `(${zip}) ${addr} ${detail}`.trim();

                console.log(`[logOrder] Fetched details from DB for Order #${orderData.dbOrderId}: ${itemsStr}`);
            }
        } catch (e) {
            console.error('[logOrder] Failed to fetch details from DB fallback:', e);
        }
    }

    // 1. Prepend to 'Orders' sheet (Insert at top)
    // Columns: [Date, PaymentID, Total, Items, Email, Check, Name, Phone, Address]
    await prependRow('Orders!A:I', [
        new Date().toISOString(),
        orderData.paymentId,
        orderData.total.toString(),
        itemsStr || 'No Items (Log Error)',
        orderData.customerEmail,
        'FALSE', // Initial Checkbox Value
        recipientName,
        recipientPhone,
        shippingAddress
    ]);

    // 2. Handle Points if User exists
    if (orderData.userId) {
        const { updateUserPoints } = await import('./user');

        // Deduct used points
        if (orderData.usedPoints && orderData.usedPoints > 0) {
            await updateUserPoints(orderData.userId, orderData.customerEmail, -orderData.usedPoints);
        }

        // Add earned points
        if (orderData.earnedPoints && orderData.earnedPoints > 0) {
            await updateUserPoints(orderData.userId, orderData.customerEmail, orderData.earnedPoints);
        }
    }

    return { success: true };
}

export async function getOrder(orderId: number, userId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return { success: true, order: data };
    } catch (error) {
        console.error('Error fetching order:', error);
        return { success: false, error };
    }
}

export async function getUserOrders(userId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, orders: data };
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return { success: false, error };
    }
}

export async function verifyPayment(paymentId: string) {
    console.log(`[verifyPayment] Starting verification. Input ID: '${paymentId}'`);
    try {
        if (!paymentId) {
            console.error('[verifyPayment] Error: paymentId is empty or undefined');
            return { success: false, message: 'Payment ID is missing' };
        }

        // Check format (basic logging)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentId);
        console.log(`[verifyPayment] ID Format check - Is UUID? ${isUuid}. Requesting PortOne API...`);

        const paymentData = await getPortOnePaymentDetails(paymentId);
        // getPortOnePaymentDetails now throws detailed errors if it fails

        return { success: true, payment: paymentData };
    } catch (error: any) {
        console.error('Payment verification failed:', error);
        return { success: false, message: error.message || 'Unknown verification error' };
    }
}

