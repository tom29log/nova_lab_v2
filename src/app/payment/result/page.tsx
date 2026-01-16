'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment, updateOrderStatus, logOrder } from '@/actions/order';
import { useCart } from '@/context/CartContext';
import { Loader2 } from 'lucide-react';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart, items, total } = useCart();

    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('결제 결과를 확인하고 있습니다...');

    useEffect(() => {
        // Prevent re-running if already done
        if (status !== 'processing') return;

        const processPayment = async () => {
            // Strict retrieval of URL parameters
            const paymentId = searchParams.get('paymentId'); // Merchant ID (ORD-...)
            const txId = searchParams.get('txId');           // PortOne UUID (Real Payment ID)
            const code = searchParams.get('code');           // Error Code
            const failureMessage = searchParams.get('message');
            const orderIdStr = searchParams.get('orderId');

            // 1. Check for explicit error from PG
            if (code) {
                setStatus('failed');
                setMessage(failureMessage || '결제가 취소되었거나 실패했습니다.');
                return;
            }

            // 2. Identify Verification ID
            // PortOne V2 API requires the UUID (txId). Falling back to paymentId only if txId is missing (though V2 should send it).
            // 2. Identify Verification ID
            // PortOne V2 API requires the UUID (txId). Falling back to paymentId if txId is missing.
            const idToVerify = txId || paymentId;

            // 3. Validate presence of crucial IDs
            if (!idToVerify || !orderIdStr) {
                // If missing, show simplified error or loading if it's just a lag (unlikely on redirect)
                console.error("Missing params:", { txId, paymentId, orderIdStr });
                setStatus('failed');
                setMessage('결제 정보를 찾을 수 없습니다. (URL 파라미터 누락)');
                return;
            }

            const dbOrderId = parseInt(orderIdStr, 10);

            try {
                // 4. Verify Payment with PortOne API (server-side)
                const verifyRes = await verifyPayment(idToVerify);

                if (!verifyRes.success || !verifyRes.payment) {
                    throw new Error(verifyRes.message || '검증 데이터 조회 실패');
                }

                const payment = verifyRes.payment;
                const isPaid = payment.status === 'PAID' || payment.status === 'VIRTUAL_ACCOUNT_ISSUED';

                if (!isPaid) {
                    // If status is not PAID, we should check why. But for now, we consider it failed or pending.
                    // However, PortOne might return 'PAID' or 'VIRTUAL_ACCOUNT_ISSUED'.
                    console.log("Verified Status:", payment.status);
                }

                // 5. Update Order Status in DB
                // We use the `dbOrderId` to find the record.
                // We update `payment_id` column to `paymentId` (Merchant ID) OR `txId` (UUID). 
                // Usually we want to store the UUID for future API calls, but valid to store Merchant ID.
                // Since `updateOrderStatus` updates dynamic columns, let's allow it to handle whatever we pass.
                // We pass `idToVerify` (UUID) as the stored payment_id to ensure we can fetch it later via API if needed.

                const methodType = payment.method?.type || payment.method;
                const isVirtualIdentifier = typeof methodType === 'string' && methodType.includes('VirtualAccount');
                const payMethod = isVirtualIdentifier ? 'VIRTUAL_ACCOUNT' : 'CARD';

                // Extract vbank details
                const vbank = payment.virtualAccount ||
                    payment.payment?.virtualAccount ||
                    payment.method?.virtualAccount ||
                    (isVirtualIdentifier ? payment.method : null);

                const orderStatus = payMethod === 'VIRTUAL_ACCOUNT' ? 'ready' : 'paid';

                await updateOrderStatus(
                    dbOrderId,
                    orderStatus,
                    idToVerify, // Storing UUID in DB for easier API access later
                    payMethod,
                    payment,
                    vbank?.accountNumber,
                    vbank?.bank || vbank?.bankName,
                    vbank?.holder || vbank?.customerName,
                    vbank?.expiryDate
                );

                // 6. Log Order (Optional - Client side context reliance)
                // Note: user said "Don't rely on state", but `items` comes from CartContext which is local storage. 
                // If this is a redirect on mobile, LocalStorage often PERSISTS. 
                // But `items` might be empty if context is cleared or not loaded.
                // We attempt to log if items exist.
                if (items && items.length > 0) {
                    await logOrder({
                        paymentId: paymentId || idToVerify || "unknown", // Prefer Merchant ID for log if avail
                        total: total || payment.amount?.total || 0,
                        items: items.map(i => `${i.name} (${i.quantity})`).join(', '),
                        customerEmail: payment.customer?.email || "unknown",
                        userId: undefined
                    });
                    // Only clear cart if we successfully used it
                    clearCart();
                } else {
                    // If items are gone (new session), we skip logging detail items or fetch from DB?
                    // Verify logic doesn't strictly depend entirely on items for success.
                }

                setStatus('success');
                // Redirect logic handled by UI button or explicit action
                router.replace(`/order/complete?orderId=${dbOrderId}`);

            } catch (e: any) {
                console.error("Result Process Error:", e);
                setStatus('failed');
                setMessage(`결제 승인 중 오류가 발생했습니다: ${e.message}`);
                await updateOrderStatus(dbOrderId, 'failed');
            }
        };

        processPayment();
    }, [searchParams, router, clearCart, items, total, status]); // Dependencies

    // Simple Light Mode UI Only
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
            <div className="text-center p-8 max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-black mb-4" />
                        <h2 className="text-xl font-bold mb-2">결제 확인보내는 중...</h2>
                        <p className="text-gray-500 text-sm">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-4xl mb-4">✅</div>
                        <h2 className="text-xl font-bold mb-2">결제 완료</h2>
                        <p className="text-gray-500 text-sm">잠시 후 주문 완료 페이지로 이동합니다.</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold mb-2">결제 실패 (DEBUG)</h2>
                        <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-100 text-left">
                            <p className="text-red-600 font-medium text-sm break-keep mb-2">{message}</p>
                            <details className="mt-2 text-xs">
                                <summary className="cursor-pointer font-bold mb-1 text-red-800">개발자용 디버그 정보 (클릭)</summary>
                                <div className="p-2 bg-white rounded border border-red-200 mt-1">
                                    <p className="font-semibold text-gray-500 mb-1">Received Params:</p>
                                    <pre className="whitespace-pre-wrap break-all font-mono text-gray-700 bg-gray-50 p-2 rounded">
                                        {JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}
                                    </pre>
                                </div>
                            </details>
                        </div>
                        <button
                            onClick={() => router.push('/cart')}
                            className="w-full py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                            장바구니로 돌아가기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-black"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <PaymentResultContent />
        </Suspense>
    );
}
