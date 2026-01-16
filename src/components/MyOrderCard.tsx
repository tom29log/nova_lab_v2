'use client';

import { CheckCircle2, Copy } from 'lucide-react';
import Link from 'next/link';

interface OrderProps {
    order: any;
}

export function MyOrderCard({ order }: OrderProps) {
    const isPaid = order.status === 'paid';
    const isReady = order.status === 'ready';
    const isCancelled = order.status === 'cancelled';

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
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getStatusBadge = () => {
        if (isPaid) return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">결제완료</span>;
        if (isReady) return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">입금대기</span>;
        if (isCancelled) return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">취소됨</span>;
        return <span className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold">처리중</span>;
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-500">
                            {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        {getStatusBadge()}
                    </div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        주문번호 #{order.id}
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                        {order.total_amount?.toLocaleString()} KRW
                    </div>
                </div>
            </div>

            {/* Shipping Summary */}
            {(order.recipient_name || order.shipping_address) && (
                <div className="px-6 py-2 bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">배송지:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {order.recipient_name || (typeof order.shipping_address === 'string' ? order.shipping_address.split(' ')[0] : '기본 배송지')}
                        {order.recipient_name && <span className="text-zinc-400 font-normal ml-1">({order.shipping_address})</span>}
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {/* Order Items Summary */}
                <div className="space-y-2 mb-6">
                    {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-zinc-700 dark:text-zinc-300">
                                {item.products?.name} <span className="text-zinc-400">x{item.quantity}</span>
                            </span>
                            <span className="text-zinc-500">
                                {(item.price * item.quantity).toLocaleString()} KRW
                            </span>
                        </div>
                    ))}
                </div>

                {/* Virtual Account Info (Only if Ready and VBank exists) */}
                {isReady && isVBank && vbank.num && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-bold text-blue-900 dark:text-blue-100">입금 계좌 정보</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">은행</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{getBankName(vbank.name)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">계좌번호</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-700 dark:text-blue-300 text-base">{vbank.num}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(vbank.num || '');
                                            alert('계좌번호가 복사되었습니다.');
                                        }}
                                        className="p-1 hover:bg-white/50 rounded-md transition-colors"
                                        title="복사하기"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">예금주</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{vbank.holder}</span>
                            </div>
                            {vbank.date && (
                                <div className="pt-2 mt-2 border-t border-blue-100 dark:border-blue-900/20 text-center">
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        {formatDate(vbank.date)} 까지 입금해주세요
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <Link href={`/order/complete?orderId=${order.id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 underline underline-offset-4">
                    상세보기
                </Link>
            </div>
        </div>
    );
}
