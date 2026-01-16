'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrder } from '@/actions/order';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function OrderCompleteContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user } = useUser();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !user) {
                if (!orderId) setLoading(false);
                return;
            }

            const response = await getOrder(parseInt(orderId), user.id);

            if (response.success) {
                setOrder(response.order);
            }
            setLoading(false);
        };

        fetchOrder();
    }, [orderId, user]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">주문 정보를 불러오는 중...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                    주문을 찾을 수 없습니다
                </h2>
                <Link
                    href="/shop"
                    className="mt-8 px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-medium"
                >
                    쇼핑하러 가기
                </Link>
            </div>
        );
    }

    const isPaid = order.status === 'paid';
    const isReady = order.status === 'ready';

    // Priority: Explicit columns > payment_info JSON (multiple structures)
    const rawVBank = order.payment_info?.virtualAccount ||
        order.payment_info?.payment?.virtualAccount ||
        order.payment_info?.payment?.method?.virtualAccount ||
        order.payment_info?.method?.virtualAccount ||
        (order.payment_info?.method?.type === 'PaymentMethodVirtualAccount' ? order.payment_info.method : null) ||
        (order.payment_info?.type === 'PaymentMethodVirtualAccount' ? order.payment_info : null) ||
        (order.payment_info?.accountNumber ? order.payment_info : null);

    const vbank = {
        num: order.vbank_num || rawVBank?.accountNumber || rawVBank?.num,
        name: order.vbank_name || rawVBank?.bank || rawVBank?.bankName,
        holder: order.vbank_holder || rawVBank?.holder || rawVBank?.remitteeName || rawVBank?.customerName,
        date: order.vbank_date || rawVBank?.expiryDate || rawVBank?.dueDate || rawVBank?.expiredAt || rawVBank?.expiry
    };

    const isVBank = order.payment_method === 'VIRTUAL_ACCOUNT' || !!vbank.num;

    const getBankName = (bankCode: string) => {
        if (!bankCode) return "";
        const banks: Record<string, string> = {
            'KOREA_EXCHANGE_BANK': '하나은행',
            'KOOKMIN_BANK': 'KB국민은행',
            'SHINHAN_BANK': '신한은행',
            'WOORI_BANK': '우리은행',
            'NONGHYUP_BANK': 'NH농협은행',
            'IBK_BANK': 'IBK기업은행',
            'KEB_HANA_BANK': '하나은행',
            'SC_BANK': 'SC제일은행',
            'CITI_BANK': '한국씨티은행',
            'POST_BANK': '우체국',
            'K_BANK': '케이뱅크',
            'KAKAO_BANK': '카카오뱅크',
            'TOSS_BANK': '토스뱅크',
            'SUHYUP_BANK': '수협은행',
            'KYONGNAM_BANK': '경남은행',
            'KWANGJU_BANK': '광주은행',
            'DAEGU_BANK': '대구은행',
            'BUSAN_BANK': '부산은행',
            'JEONBUK_BANK': '전북은행',
            'JEJU_BANK': '제주은행',
            'KOREA_DEVELOPMENT_BANK': 'KDB산업은행'
        };
        return banks[bankCode] || bankCode;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <div className="text-center mb-12">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isPaid ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    }`}>
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">
                    {isPaid ? '결제가 완료되었습니다' : isReady ? '주문을 완료해 주세요' : '주문 처리 중...'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                    주문번호: #{order.id} | 상태: <span className="font-medium text-zinc-900 dark:text-zinc-100">{isPaid ? '결제완료' : isReady ? '입금대기' : '처리중'}</span>
                </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 mb-8 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                {isVBank && vbank.num && (
                    <div className="mb-10 p-8 bg-white dark:bg-zinc-800 rounded-3xl border-2 border-blue-100 dark:border-blue-900/30 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                입금하실 계좌 정보
                            </h3>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-700/50">
                                <span className="text-zinc-500 font-medium text-base">입금 은행</span>
                                <span className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">{getBankName(vbank.name)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-700/50">
                                <span className="text-zinc-500 font-medium text-base">계좌 번호</span>
                                <div className="text-right">
                                    <span className="text-blue-600 dark:text-blue-400 font-black text-2xl tracking-tight leading-none block">{vbank.num}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(vbank.num || '');
                                            alert('계좌번호가 복사되었습니다.');
                                        }}
                                        className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md mt-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors uppercase font-bold"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-700/50">
                                <span className="text-zinc-500 font-medium text-base">예금주</span>
                                <span className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">{vbank.holder}</span>
                            </div>
                            <div className="mt-8 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 text-center">
                                <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">입금 기한</p>
                                <p className="text-blue-700 dark:text-blue-300 font-black text-xl">
                                    {vbank.date ? formatDate(vbank.date) : '24시간 이내'} 까지
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isVBank && !vbank.num && order.status === 'pending' && (
                    <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm text-center">
                        <p className="font-semibold text-base">결제 정보를 생성하고 있습니다...</p>
                        <p className="mt-1 opacity-80">잠시만 기다려 주시거나 새로고침을 해주세요.</p>
                    </div>
                )}

                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    주문 상품
                </h2>
                <div className="space-y-4">
                    {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                                    {item.products?.name}
                                </span>
                                <span className="text-zinc-500">x{item.quantity}</span>
                            </div>
                            <span className="text-zinc-900 dark:text-zinc-100">
                                {(item.price * item.quantity).toLocaleString()} KRW
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium text-base">최종 결제 금액</span>
                    <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {order.total_amount.toLocaleString()} KRW
                    </span>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
                        배송지 정보
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-start text-sm">
                            <span className="text-zinc-500 w-24 flex-shrink-0">받는 분</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                                {order.recipient_name || order.shipping_address?.name || user?.fullName || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between items-start text-sm">
                            <span className="text-zinc-500 w-24 flex-shrink-0">연락처</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                                {order.recipient_phone || order.shipping_address?.phone || user?.primaryPhoneNumber?.phoneNumber || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between items-start text-sm">
                            <span className="text-zinc-500 w-24 flex-shrink-0">주소</span>
                            <div className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                                <p>{order.shipping_address}{order.shipping_detail_address ? ` ${order.shipping_detail_address}` : ''}</p>
                                {order.shipping_zipcode && <p className="text-zinc-400 text-xs mt-0.5">({order.shipping_zipcode})</p>}
                            </div>
                        </div>
                        {order.shipping_memo && (
                            <div className="flex justify-between items-start text-sm">
                                <span className="text-zinc-500 w-24 flex-shrink-0">배송 메모</span>
                                <span className="text-zinc-900 dark:text-zinc-100 font-medium text-right">
                                    {order.shipping_memo}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/shop"
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full font-medium hover:scale-[1.02] transition-transform"
                >
                    <ShoppingBag className="w-4 h-4" />
                    쇼핑 계속하기
                </Link>
                <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700 rounded-full font-medium hover:scale-[1.02] transition-transform"
                >
                    메인으로 이동
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

export default function OrderCompletePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">로딩 중...</div>
            </div>
        }>
            <OrderCompleteContent />
        </Suspense>
    );
}
