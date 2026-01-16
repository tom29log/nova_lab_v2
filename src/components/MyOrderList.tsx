'use client';

import { useState } from 'react';
import { MyOrderCard } from './MyOrderCard';
import { Package, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface MyOrderListProps {
    orders: any[];
}

export function MyOrderList({ orders }: MyOrderListProps) {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [filterPeriod, setFilterPeriod] = useState<'1M' | '3M' | '6M' | 'ALL'>('ALL');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const getFilteredOrders = () => {
        if (!orders) return [];

        const now = new Date();
        const filtered = orders.filter(order => {
            const orderDate = new Date(order.created_at);

            // Period Filter
            if (filterPeriod === '1M') {
                const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                if (orderDate < oneMonthAgo) return false;
            } else if (filterPeriod === '3M') {
                const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                if (orderDate < threeMonthsAgo) return false;
            } else if (filterPeriod === '6M') {
                const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                if (orderDate < sixMonthsAgo) return false;
            }

            // Custom Date Range
            if (customStartDate) {
                const start = new Date(customStartDate);
                if (orderDate < start) return false;
            }
            if (customEndDate) {
                // End date should include the entire day
                const end = new Date(customEndDate);
                end.setHours(23, 59, 59, 999);
                if (orderDate > end) return false;
            }

            return true;
        });

        return filtered;
    };

    const filteredOrders = getFilteredOrders();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return '결제완료';
            case 'ready': return '입금대기';
            case 'cancelled': return '취소됨';
            default: return '처리중';
        }
    };

    return (
        <div>
            {/* Filter Section */}
            <div className="bg-white dark:bg-zinc-900 bg-opacity-50 backdrop-blur-md rounded-2xl p-4 mb-6 border border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {(['1M', '3M', '6M', 'ALL'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => {
                                    setFilterPeriod(period);
                                    setCustomStartDate('');
                                    setCustomEndDate('');
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterPeriod === period && !customStartDate
                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md transform scale-105'
                                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                {period === '1M' ? '1개월' : period === '3M' ? '3개월' : period === '6M' ? '6개월' : '전체'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => {
                                setCustomStartDate(e.target.value);
                                setFilterPeriod('ALL'); // Reset preset when picking dates
                            }}
                            className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 outline-none text-zinc-600 dark:text-zinc-300 w-32"
                        />
                        <span className="text-zinc-400">~</span>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => {
                                setCustomEndDate(e.target.value);
                                setFilterPeriod('ALL');
                            }}
                            className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 outline-none text-zinc-600 dark:text-zinc-300 w-32"
                        />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                        <Package className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                        검색된 주문 내역이 없습니다
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        기간을 변경하여 다시 검색해보세요
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
                                {/* Simple Header Row (Always Visible) */}
                                <div
                                    onClick={() => toggleExpand(order.id)}
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                {formatDate(order.created_at)}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-zinc-100 text-zinc-700'
                                                }`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                        <span className="text-zinc-500 dark:text-zinc-400 text-sm truncate max-w-[200px] sm:max-w-xs">
                                            {order.order_items?.[0]?.products?.name}
                                            {order.order_items?.length > 1 && ` 외 ${order.order_items.length - 1}건`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                            {order.total_amount?.toLocaleString()}원
                                        </span>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                                    </div>
                                </div>

                                {/* Expanded Content (MyOrderCard) */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <MyOrderCard order={order} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
