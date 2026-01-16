'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CartItem } from '@/components/CartItem';
import { ShoppingBag } from 'lucide-react';
import * as PortOne from "@portone/browser-sdk/v2";
import Link from 'next/link';
import { logOrder, createOrder, updateOrderStatus } from '@/actions/order';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DaumPostcode from 'react-daum-postcode';

export default function CartPage() {
    const { items, total, clearCart } = useCart();
    const { user } = useUser();
    const router = useRouter();
    const [payMethod, setPayMethod] = useState<'CARD' | 'VIRTUAL_ACCOUNT'>('CARD');
    const [mounted, setMounted] = useState(false);

    // Shipping Info State
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [shippingZipcode, setShippingZipcode] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingDetailAddress, setShippingDetailAddress] = useState('');
    const [shippingMemo, setShippingMemo] = useState('');

    // Address Search Modal State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);



    // Shipping Memo logic
    const SHIPPING_MEMO_OPTIONS = [
        "배송 전에 미리 연락주세요.",
        "부재 시 경비실에 맡겨주세요.",
        "부재 시 문 앞에 놓아주세요.",
        "빠른 배송 부탁드립니다.",
        "택배함에 보관해 주세요.",
        "직접 입력"
    ];
    const [selectedMemoOption, setSelectedMemoOption] = useState('');

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRecipientPhone(formatPhoneNumber(e.target.value));
    };

    const handleMemoOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedMemoOption(value);
        if (value !== '직접 입력') {
            setShippingMemo(value);
        } else {
            setShippingMemo('');
        }
    };



    // Form Validation
    const isFormValid = recipientName &&
        recipientPhone.length >= 12 &&
        shippingZipcode &&
        shippingAddress &&
        shippingDetailAddress;

    const handleCompleteAddress = (data: any) => {
        setShippingZipcode(data.zonecode);
        setShippingAddress(data.address);
        setIsAddressModalOpen(false);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const handlePayment = async () => {
        if (items.length === 0) return;
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!isFormValid) {
            alert("배송지 정보를 모두 입력해 주세요.");
            return;
        }

        const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
        if (!storeId) {
            alert("PortOne Store ID is missing!");
            return;
        }

        const paymentId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        try {
            console.log("Starting checkout process...");
            // 1. Create Order in Supabase first (status: pending)
            const orderResponse = await createOrder({
                userId: user.id,
                totalAmount: total,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                // Shipping Info
                recipientName,
                recipientPhone,
                shippingAddress,
                shippingDetailAddress,
                shippingZipcode,
                shippingMemo,
            });

            console.log("Order creation response:", orderResponse);

            if (!orderResponse.success) {
                console.error("Order creation failed:", orderResponse.error);
                alert("주문 생성에 실패했습니다.");
                return;
            }

            const dbOrderId = orderResponse.orderId as number;

            // 2. Request Payment via PortOne
            console.log("Initiating PortOne payment with method:", payMethod);
            const response = await PortOne.requestPayment({
                storeId,
                paymentId,
                orderName: items.length > 1 ? `${items[0].name}외 ${items.length - 1}건` : items[0].name,
                totalAmount: total,
                currency: "CURRENCY_KRW",
                channelKey: "channel-key-a3befb38-a421-4153-8c9e-7dc176f66669", // Direct Hardcode for consistency
                payMethod: payMethod,
                redirectUrl: `${window.location.origin}/payment/result?orderId=${dbOrderId}`,
                // Add explicit mobile redirect (legacy/PG support) by casting to any if needed or just passing
                // @ts-ignore
                m_redirect_url: `${window.location.origin}/payment/result?orderId=${dbOrderId}`,
                virtualAccount: payMethod === 'VIRTUAL_ACCOUNT' ? {
                    accountExpiry: {
                        validHours: 24,
                    },
                } : undefined,
                customer: {
                    fullName: recipientName || user.fullName || "Guest",
                    phoneNumber: recipientPhone || user.primaryPhoneNumber?.phoneNumber || "010-0000-0000",
                    email: user.primaryEmailAddress?.emailAddress || "test@example.com",
                    address: {
                        addressLine1: shippingAddress,
                        addressLine2: shippingDetailAddress,
                    },
                    zipcode: shippingZipcode,
                }
            });

            console.log("PortOne payment response:", response);

            if (response?.code != null) {
                // Payment Failed
                console.error("Payment failed:", response);
                await updateOrderStatus(dbOrderId, 'cancelled');
                alert(`결제 실패: ${response.message}`);
            } else {
                // Payment Success (or Issuance Success for Virtual Account)
                console.log("Payment Success:", response);

                // Virtual account needs 'ready' status, credit card needs 'paid'
                const status = payMethod === 'VIRTUAL_ACCOUNT' ? 'ready' : 'paid';

                // Extract vbank details safely
                const vbank = (response as any).virtualAccount ||
                    (response as any).payment?.virtualAccount ||
                    (response as any).payment?.method?.virtualAccount ||
                    (response as any).method?.virtualAccount ||
                    ((response as any).method?.type === 'PaymentMethodVirtualAccount' ? (response as any).method : null);
                const vbankNum = vbank?.accountNumber || (vbank as any)?.num;
                const vbankName = vbank?.bank || (vbank as any)?.bankName;
                const vbankHolder = vbank?.holder || (vbank as any)?.customerName;
                const vbankDate = vbank?.expiryDate || vbank?.dueDate || (vbank as any)?.expiry;

                // 3. Update Order Status in Supabase with payment info and explicit vbank fields
                await updateOrderStatus(
                    dbOrderId,
                    status,
                    paymentId,
                    payMethod,
                    response,
                    vbankNum,
                    vbankName,
                    vbankHolder,
                    vbankDate
                );

                // 4. Log to Google Sheets (legacy or backup)
                await logOrder({
                    paymentId,
                    total,
                    items: items.map(i => `${i.name} (${i.quantity})`).join(', '),
                    customerEmail: user.primaryEmailAddress?.emailAddress || "test@example.com",
                    userId: user.id
                });

                clearCart();
                router.push(`/order/complete?orderId=${dbOrderId}`);
            }
        } catch (e: any) {
            console.error("Payment Error:", e);
            alert(`처리 중 오류가 발생했습니다: ${e?.message || e}`);
        }
    };

    if (!mounted) {
        return <div className="min-h-screen" />;
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <ShoppingBag className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-6" />
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                    Your cart is empty
                </h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm">
                    Looks like you haven't added any items to the cart yet.
                </p>
                <Link
                    href="/shop"
                    className="mt-8 px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-medium hover:scale-105 transition-transform"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-50 mb-8">
                Shopping Cart
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-7 space-y-2">
                    {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-5">
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 lg:sticky lg:top-24">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-6">
                            Order Summary
                        </h2>

                        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{total.toLocaleString()} KRW</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>

                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />

                        {/* Shipping Information Form */}
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
                                배송지 정보
                            </h2>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="받는 분 성함"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-zinc-500"
                                />
                                <input
                                    type="text"
                                    placeholder="연락처 (010-0000-0000)"
                                    value={recipientPhone}
                                    onChange={handlePhoneChange}
                                    maxLength={13}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-zinc-500"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="우편번호"
                                        value={shippingZipcode}
                                        readOnly
                                        className="w-1/3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
                                    />
                                    <button
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="flex-1 px-4 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        주소 검색
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="기본 주소"
                                    value={shippingAddress}
                                    readOnly
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
                                />
                                <input
                                    type="text"
                                    placeholder="상세 주소 (동/호수 등)"
                                    value={shippingDetailAddress}
                                    onChange={(e) => setShippingDetailAddress(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-zinc-500"
                                />
                                <div className="space-y-2">
                                    <select
                                        value={selectedMemoOption}
                                        onChange={handleMemoOptionChange}
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-zinc-500 appearance-none"
                                    >
                                        <option value="" disabled>배송 메모를 선택해주세요</option>
                                        {SHIPPING_MEMO_OPTIONS.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    {(selectedMemoOption === '직접 입력' || !selectedMemoOption) && (
                                        <input
                                            type="text"
                                            placeholder="배송 메모 직접 입력"
                                            value={shippingMemo}
                                            onChange={(e) => setShippingMemo(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-black dark:focus:border-zinc-500"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Search Modal */}
                        {isAddressModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="p-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
                                        <h3 className="font-medium">주소 검색</h3>
                                        <button onClick={() => setIsAddressModalOpen(false)} className="p-2">✕</button>
                                    </div>
                                    <div className="h-[400px]">
                                        <DaumPostcode onComplete={handleCompleteAddress} className="h-full" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />

                        <div className="mb-6">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3 block">
                                결제 수단 선택
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPayMethod('CARD')}
                                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${payMethod === 'CARD'
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                        }`}
                                >
                                    신용카드
                                </button>
                                <button
                                    onClick={() => setPayMethod('VIRTUAL_ACCOUNT')}
                                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${payMethod === 'VIRTUAL_ACCOUNT'
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                        }`}
                                >
                                    가상계좌
                                </button>
                            </div>


                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-base font-medium text-zinc-900 dark:text-zinc-50">Total</span>
                            <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                                {total.toLocaleString()} KRW
                            </span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={!isFormValid}
                            className={`w-full py-4 rounded-full font-medium transition-all shadow-lg ${isFormValid
                                ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                                }`}
                        >
                            {isFormValid ? 'Checkout' : '배송지 정보를 입력해주세요'}
                        </button>
                        <p className="mt-4 text-center text-xs text-zinc-400">
                            Secure payment via PortOne
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
