import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/history-order.scss';
import '../styles/modals-extra.scss';
import { API_BASE, apiFetch } from '../config';
import {
    ArrowLeft,
    PlusCircle,
    CreditCard,
    Info,
    RefreshCw,
    Star,
    PhoneCall
} from 'react-feather';
import Payment from './Payment';

function formatPrice(n) {
    return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}

const STATUS_COLOR = {
    pending: 'rm-status-pending',
    awaiting_payment: 'rm-status-awaiting',
    confirmed: 'rm-status-confirmed',
    preparing: 'rm-status-confirmed',
    delivering: 'rm-status-confirmed',
    serving: 'rm-status-served',
    completed: 'rm-status-served',
    delivered: 'rm-status-served',
    cancelled: 'rm-status-cancelled',
};

const STATUS_DISPLAY_VI = {
    pending: 'Chờ duyệt',
    awaiting_payment: 'Chờ thanh toán',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    cooking: 'Đang nấu',
    ready: 'Chờ lấy món',
    delivering: 'Đang giao hàng',
    serving: 'Đang phục vụ',
    completed: 'Hoàn thành',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
};

export default function HistoryOrder() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageMap, setImageMap] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [paymentInfo, setPaymentInfo] = useState(null);

    const [ordersList, setOrdersList] = useState([]);

    const fetchOrder = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Load from localStorage history
            let localList = [];
            try {
                const historyRaw = localStorage.getItem('orderHistoryList');
                if (historyRaw) localList = JSON.parse(historyRaw);
                const lastRaw = localStorage.getItem('lastOrder');
                if (lastRaw) {
                    const lo = JSON.parse(lastRaw);
                    if (lo && !localList.some(o => (o.paycode || o.pay_code || o.id) === (lo.paycode || lo.pay_code || lo.id))) {
                        localList.unshift(lo);
                    }
                }
            } catch (e) { }

            // 2. Fetch API lists
            let apiList = [];
            try {
                const headers = {};
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const [resHistory, resActive, resByUser] = await Promise.all([
                    apiFetch(`${API_BASE}/api/v1/orders/history/`, { headers }).catch(() => ({ ok: false })),
                    apiFetch(`${API_BASE}/api/v1/orders/active/`, { headers }).catch(() => ({ ok: false })),
                    token ? apiFetch(`${API_BASE}/api/v1/orders/by-user/`, { headers }).catch(() => ({ ok: false })) : Promise.resolve({ ok: false })
                ]);

                const mergedMap = {};
                for (const res of [resByUser, resActive, resHistory]) {
                    if (res && res.ok) {
                        const j = await res.json();
                        const items = j?.data?.results || j?.results || j?.data || (Array.isArray(j) ? j : []);
                        if (Array.isArray(items)) {
                            items.forEach(it => { if (it && (it.id || it.pay_code || it.paycode)) { mergedMap[it.pay_code || it.paycode || it.id] = it; } });
                        }
                    }
                }
                apiList = Object.values(mergedMap);
            } catch (e) { }

            // Merge local and API lists
            const allMap = {};
            [...localList, ...apiList].forEach(it => {
                const key = it.pay_code || it.paycode || it.id;
                if (key) {
                    if (allMap[key]) {
                        allMap[key] = { ...allMap[key], ...it };
                    } else {
                        allMap[key] = it;
                    }
                }
            });
            const finalOrders = Object.values(allMap).sort((a, b) => {
                const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
                const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
                return timeB - timeA;
            });
            setOrdersList(finalOrders);

            let currentPaycode = new URLSearchParams(window.location.search).get('paycode');
            if (!currentPaycode && order) {
                currentPaycode = order.pay_code || order.paycode || order.id;
            }
            if (!currentPaycode && finalOrders.length > 0) {
                const latest = finalOrders[0];
                currentPaycode = latest?.pay_code || latest?.paycode || latest?.id;
            }
            if (!currentPaycode) {
                currentPaycode = localStorage.getItem('paycode');
            }

            if (currentPaycode) {
                const initialLocalOrder = finalOrders.find(o => String(o.paycode || o.pay_code || o.id) === String(currentPaycode)) || finalOrders[0];
                if (initialLocalOrder) setOrder(initialLocalOrder);

                const [orderRes, productsRes, paymentRes] = await Promise.all([
                    apiFetch(`${API_BASE}/api/v1/orders/by-paycode/?pay_code=${encodeURIComponent(currentPaycode)}`).catch(() => ({ ok: false })),
                    apiFetch(`${API_BASE}/api/v1/menu/products/?page=1&per_page=200`).catch(() => ({ ok: false })),
                    apiFetch(`${API_BASE}/api/v1/payments/by_pay_code/?pay_code=${encodeURIComponent(currentPaycode)}`).catch(() => ({ ok: false }))
                ]);

                if (orderRes && orderRes.ok) {
                    const orderJson = await orderRes.json();
                    if (orderJson && orderJson.status !== 'error' && orderJson.data) {
                        const apiOrder = orderJson.data;
                        const localOrder = finalOrders.find(o => String(o.paycode || o.pay_code || o.id) === String(currentPaycode)) || {};
                        const merged = { ...localOrder, ...apiOrder };
                        setOrder(merged);
                        syncOrderStatus(merged);
                    } else {
                        const fallback = finalOrders.find(o => String(o.paycode || o.pay_code || o.id) === String(currentPaycode));
                        if (fallback) setOrder(fallback);
                    }
                } else {
                    const fallback = finalOrders.find(o => String(o.paycode || o.pay_code || o.id) === String(currentPaycode));
                    if (fallback) setOrder(fallback);
                }

                if (productsRes && productsRes.ok) {
                    const productsJson = await productsRes.json();
                    if (productsJson.status === 'success' || productsJson.status === true) {
                        const products = productsJson?.data?.results || productsJson?.results || productsJson?.data || [];
                        const map = {};
                        products.forEach(p => { if (p.id) map[p.id] = p.image_url || p.image || ''; });
                        setImageMap(map);
                    }
                }

                if (paymentRes && paymentRes.ok) {
                    const payJson = await paymentRes.json();
                    if (payJson.status === 'success' || payJson.status === true) {
                        setPaymentInfo(payJson.data || payJson);
                    } else {
                        setPaymentInfo(null);
                    }
                }
            } else {
                setOrder(null);
                if (finalOrders.length === 0) {
                    setError('Bạn chưa có đơn hàng nào trong lịch sử.');
                }
            }
        } catch (e) {
            setError('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, []);

    const syncOrderStatus = (updatedOrder) => {
        if (!updatedOrder) return;
        const key = updatedOrder.paycode || updatedOrder.pay_code || updatedOrder.id;
        if (!key) return;

        setOrdersList(prev => prev.map(o => {
            const oKey = o.paycode || o.pay_code || o.id;
            if (String(oKey) === String(key)) {
                return { ...o, ...updatedOrder, status: updatedOrder.status || o.status, status_display: updatedOrder.status_display || o.status_display };
            }
            return o;
        }));

        try {
            const lo = JSON.parse(localStorage.getItem('lastOrder') || '{}');
            if (lo && String(lo.paycode || lo.pay_code || lo.id) === String(key)) {
                const newLo = { ...lo, ...updatedOrder };
                localStorage.setItem('lastOrder', JSON.stringify(newLo));
            }
            const hist = JSON.parse(localStorage.getItem('orderHistoryList') || '[]');
            if (Array.isArray(hist)) {
                const updatedHist = hist.map(item => {
                    const iKey = item.paycode || item.pay_code || item.id;
                    if (item && String(iKey) === String(key)) {
                        return { ...item, ...updatedOrder };
                    }
                    return item;
                });
                localStorage.setItem('orderHistoryList', JSON.stringify(updatedHist));
            }
        } catch (e) { }
    };

    const handleSelectOrder = async (itemOrder) => {
        const pcode = itemOrder.paycode || itemOrder.pay_code || itemOrder.id;
        if (pcode) localStorage.setItem('paycode', String(pcode));
        setOrder(itemOrder);

        if (pcode) {
            try {
                const [orderRes, payRes] = await Promise.all([
                    apiFetch(`${API_BASE}/api/v1/orders/by-paycode/?pay_code=${encodeURIComponent(pcode)}`).catch(() => ({ ok: false })),
                    apiFetch(`${API_BASE}/api/v1/payments/by_pay_code/?pay_code=${encodeURIComponent(pcode)}`).catch(() => ({ ok: false }))
                ]);

                if (orderRes && orderRes.ok) {
                    const oJson = await orderRes.json();
                    if (oJson && oJson.data) {
                        setOrder(prev => ({ ...prev, ...oJson.data }));
                        syncOrderStatus(oJson.data);
                    }
                }

                if (payRes && payRes.ok) {
                    const pJson = await payRes.json();
                    if (pJson && (pJson.status === 'success' || pJson.status === true)) {
                        setPaymentInfo(pJson.data || pJson);
                    } else {
                        setPaymentInfo(null);
                    }
                } else {
                    setPaymentInfo(null);
                }
            } catch (e) {
                console.error('Failed to load details for order', pcode, e);
            }
        }
    };

    const items = React.useMemo(() => {
        const raw = order?.items || order?.cart || [];
        const map = {};
        raw.forEach(item => {
            const name = item.product_name || item.name || 'Món ăn';
            const key = `${name}__${item.size || ''}__${item.variant || ''}__${item.notes || item.note || ''}`;
            const qty = Number(item.quantity) || 1;
            const price = Number(item.total_price || item.subtotal || item.price || 0);
            if (map[key]) {
                map[key].quantity += qty;
                map[key].total_price += price;
            } else {
                map[key] = { ...item, product_name: name, quantity: qty, total_price: price, price: Number(item.price || price / qty) };
            }
        });
        return Object.values(map);
    }, [order]);

    const totalAmount = order?.total !== undefined ? Number(order.total) : (order ? Number(order.total_amount || 0) : 0);
    const currentStatus = order?.status || 'pending';

    const getStepIndex = (st) => {
        if (st === 'cancelled') return -1;
        if (st === 'pending' || st === 'awaiting_payment') return 0;
        if (st === 'confirmed') return 1;
        if (st === 'preparing' || st === 'cooking' || st === 'ready') return 2;
        if (st === 'delivering' || st === 'serving' || st === 'served') return 3;
        if (st === 'completed' || st === 'delivered') return 4;
        return 0;
    };
    const stepIdx = getStepIndex(currentStatus);

    const handleSendReview = (e) => {
        e.preventDefault();
        alert(`🎉 Cảm ơn bạn đã đánh giá ${rating} sao! Nhận xét: "${comment}". Bạn đã nhận được +100 điểm thưởng hội viên!`);
        setShowReviewModal(false);
    };

    const handleCancelOrder = async () => {
        if (!order || !order.id) return;
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

        try {
            const res = await apiFetch(`${API_BASE}/api/v1/orders/${order.id}/cancel/`, { method: 'POST' });
            const json = await res.json();
            if (!res.ok || json.status === 'error') throw new Error(json.msg || 'Không thể hủy đơn hàng.');

            const cancelledOrder = { ...order, status: 'cancelled', status_display: 'Đã hủy' };
            setOrder(cancelledOrder);
            syncOrderStatus(cancelledOrder);
            alert('Hủy đơn hàng thành công.');
            fetchOrder();
        } catch (e) {
            alert(e.message || 'Lỗi khi hủy đơn hàng.');
        }
    };

    return (
        <div className="rm-history-page">
            <header className="rm-history-header">
                <div className="rm-container rm-header-inner">
                    <button className="rm-icon-btn" onClick={() => window.history.back()} aria-label="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="rm-address-block">
                        <span className="rm-muted-label">Theo dõi Đơn hàng Online </span>
                    </div>
                    <button className="rm-icon-btn" onClick={fetchOrder} aria-label="Refresh" title="Làm mới">
                        <RefreshCw size={17} />
                    </button>
                </div>
            </header>

            <main className="rm-history-main container">
                {/* Orders List Section */}
                <section className="rm-history-card" style={{ marginBottom: '20px', padding: '18px', borderRadius: '18px', border: '1px solid #f3f4f6', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Danh Sách Lịch Sử Đơn Hàng ({ordersList.length})
                    </h2>
                    {loading && <div className="rm-empty" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Đang tải lịch sử đơn hàng...</div>}
                    {!loading && ordersList.length === 0 && (
                        <div className="rm-empty" style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
                            <p style={{ fontSize: '15px', marginBottom: '12px' }}>Bạn chưa có đơn hàng nào trong lịch sử.</p>
                            <button className="rm-btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', background: '#ff7a18', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/menu')}>
                                Đặt Món Ngay
                            </button>
                        </div>
                    )}
                    {!loading && ordersList.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                            {ordersList.map((itemOrder, idx) => {
                                const st = itemOrder.status || 'pending';
                                const isSelected = order && (String(order.paycode || order.pay_code || order.id) === String(itemOrder.paycode || itemOrder.pay_code || itemOrder.id));
                                const totalAmt = itemOrder.total_amount || itemOrder.total || itemOrder.subtotal || 0;
                                const timeStr = itemOrder.created_at || itemOrder.createdAt ? new Date(itemOrder.created_at || itemOrder.createdAt).toLocaleString('vi-VN') : 'Vừa xong';
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: '14px',
                                            border: isSelected ? '2px solid #ff7a18' : '1px solid #e5e7eb',
                                            background: isSelected ? '#fffaf5' : '#ffffff',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isSelected ? '0 4px 12px rgba(255,122,24,0.12)' : 'none'
                                        }}
                                        onClick={() => handleSelectOrder(itemOrder)}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                <strong style={{ fontSize: '15px', color: '#111827' }}>
                                                    #{itemOrder.pay_code || itemOrder.paycode || itemOrder.id}
                                                </strong>
                                                <span className={`rm-status-badge1 ${STATUS_COLOR[st] || 'rm-status-pending'}`} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                                                    {STATUS_DISPLAY_VI[st] || itemOrder.status_display || st}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                Bàn: <strong style={{ color: '#374151' }}>{itemOrder.table_number || itemOrder?.table_details?.table_number || itemOrder?.table?.table_number || '---'}</strong> &nbsp;•&nbsp; {timeStr}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff5200', marginBottom: '4px' }}>
                                                {formatPrice(totalAmt)}
                                            </div>
                                            <span style={{ fontSize: '12px', color: isSelected ? '#ff7a18' : '#3b82f6', fontWeight: 600 }}>
                                                {isSelected ? '✓ Đang xem' : 'Xem chi tiết →'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Order Tracking Stepper (F-08) */}
                {order && (
                    <div className="rm-stepper-container">
                        <div style={{ textAlign: 'center', marginBottom: '14px', fontWeight: 800, fontSize: '15px', color: '#111827' }}>
                            Tiến độ đơn hàng trực tuyến - #{order.paycode || order.pay_code || order.id}
                        </div>
                        {(currentStatus === 'cancelled' || stepIdx === -1) ? (
                            <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '14px', padding: '18px', textAlign: 'center', margin: '12px 0', color: '#991b1b' }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>❌ Đơn hàng #{order.paycode || order.pay_code || order.id} đã bị hủy</div>
                                <div style={{ fontSize: '13px', color: '#b91c1c' }}>Đơn hàng này đã kết thúc và không tiếp tục thực hiện. Vui lòng chọn món mới nếu bạn có nhu cầu.</div>
                            </div>
                        ) : (
                            <>
                                <div className="rm-stepper">
                                    <div className={`rm-step ${stepIdx === 0 ? 'active' : ''} ${stepIdx > 0 ? 'completed' : ''}`}>
                                        <div className="rm-step-circle">{stepIdx > 0 ? '✓' : '1'}</div>
                                        <div className="rm-step-label">Chờ duyệt</div>
                                    </div>
                                    <div className={`rm-step ${stepIdx === 1 ? 'active' : ''} ${stepIdx > 1 ? 'completed' : ''}`}>
                                        <div className="rm-step-circle">{stepIdx > 1 ? '✓' : '2'}</div>
                                        <div className="rm-step-label">Xác nhận</div>
                                    </div>
                                    <div className={`rm-step ${stepIdx === 2 ? 'active' : ''} ${stepIdx > 2 ? 'completed' : ''}`}>
                                        <div className="rm-step-circle">{stepIdx > 2 ? '✓' : '3'}</div>
                                        <div className="rm-step-label">Đang làm</div>
                                    </div>
                                    <div className={`rm-step ${stepIdx === 3 ? 'active' : ''} ${stepIdx > 3 ? 'completed' : ''}`}>
                                        <div className="rm-step-circle">{stepIdx > 3 ? '✓' : '4'}</div>
                                        <div className="rm-step-label">Đang giao</div>
                                    </div>
                                    <div className={`rm-step ${stepIdx === 4 ? 'active' : ''} ${stepIdx > 4 ? 'completed' : ''}`}>
                                        <div className="rm-step-circle">{stepIdx > 4 ? '✓' : '5'}</div>
                                        <div className="rm-step-label">Hoàn thành</div>
                                    </div>
                                </div>

                                {/* Shipper Info Card when delivering */}
                                {(stepIdx === 3) && (
                                    <div className="rm-shipper-card">
                                        <div className="rm-shipper-info">
                                            <div className="rm-shipper-avatar">🛵</div>
                                            <div>
                                                <div className="rm-shipper-name">Tài xế: Nguyễn Hữu Tài</div>
                                                <div className="rm-shipper-status">• Đang trên đường giao đến bạn</div>
                                            </div>
                                        </div>
                                        <a href="tel:0912345678" className="rm-shipper-call">
                                            <PhoneCall size={14} /> Gọi Tài Xế
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Rating Banner (F-09) */}
                {order && (stepIdx === 4 || currentStatus === 'completed' || currentStatus === 'delivered') && (
                    <div
                        onClick={() => setShowReviewModal(true)}
                        style={{
                            background: 'linear-gradient(135deg, #ffedd5 0%, #ffedd5 100%)', border: '2px solid #ff7a18',
                            borderRadius: '16px', padding: '16px', marginBottom: '16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(255,122,24,0.15)'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '15px', color: '#ff5200' }}>⭐ Đánh Giá Món Ăn & Tài Xế</div>
                            <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>Chấm điểm 5 sao để nhận ngay +100 điểm thưởng hội viên!</div>
                        </div>
                        <button style={{ background: '#ff7a18', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}>
                            Đánh Giá Ngay
                        </button>
                    </div>
                )}

                {/* Order meta */}
                {order && (
                    <div className="rm-order-meta">
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Mã đơn hàng:</span>
                            <strong className="rm-order-meta-value">#{order.id}</strong>
                        </div>
                        {order.paycode && (
                            <div className="rm-order-meta-row">
                                <span className="rm-order-meta-label">Pay code:</span>
                                <strong className="rm-order-meta-value rm-paycode">{order.paycode}</strong>
                            </div>
                        )}
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Người nhận:</span>
                            <span className="rm-order-meta-value">{order?.deliveryInfo?.name || localStorage.getItem('customerName') || 'Khách hàng'} ({order?.deliveryInfo?.phone || localStorage.getItem('customerPhone') || '---'})</span>
                        </div>
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Địa chỉ giao:</span>
                            <span className="rm-order-meta-value">{order?.deliveryInfo?.address || '120 Hoàng Minh Thảo, Đà Nẵng'}</span>
                        </div>
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Trạng thái:</span>
                            <span className={`rm-status-badge1 ${STATUS_COLOR[currentStatus] || 'rm-status-pending'}`}>
                                <span className="rm-dot" />{STATUS_DISPLAY_VI[currentStatus] || order.status_display || 'Đang xử lý'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Items list */}
                <section className="rm-history-card rm-list-card">
                    {loading && <div className="rm-empty">Đang tải chi tiết đơn hàng...</div>}
                    {!loading && error && <div className="rm-empty">{error}</div>}
                    {!loading && !error && items.length === 0 && (
                        <div className="rm-empty">Chưa có món ăn nào trong đơn.</div>
                    )}
                    {!loading && items.map((item, idx) => (
                        <div key={idx} className="rm-history-list-item">
                            <div className="rm-item-thumb">
                                <img
                                    alt={item.product_name}
                                    src={imageMap[item.variant_details?.product] || item.image || ''}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <div className="rm-item-body" style={{ flex: 1 }}>
                                <div className="rm-item-row">
                                    <div style={{ flex: 1 }}>
                                        <h3 className="rm-item-title">{item.product_name}</h3>
                                        <p className="rm-item-meta">
                                            Size: {item.size || 'Mặc định'} &nbsp;•&nbsp; SL: {item.quantity}
                                        </p>
                                        {item.toppings && item.toppings.length > 0 && (
                                            <p className="rm-item-meta">
                                                Topping: {item.toppings.map(tp => tp.name).join(', ')}
                                            </p>
                                        )}
                                        {(item.notes || item.note) && (
                                            <p className="rm-item-meta">Ghi chú: {item.notes || item.note}</p>
                                        )}
                                    </div>
                                    <div className="rm-item-right">
                                        <p className="rm-price-orange">{formatPrice(item.total_price)}</p>
                                        <p className="rm-item-meta" style={{ textAlign: 'right' }}>
                                            {formatPrice(item.price)} / món
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Summary */}
                <section className="rm-history-card rm-summary-card">
                    {(() => {
                        const hasBreakdown = order?.shippingFee !== undefined;
                        let subtotal = order?.subtotal;
                        let shippingFee = order?.shippingFee;
                        let voucherDiscount = order?.voucherDiscount;

                        if (!hasBreakdown && items.length > 0) {
                            subtotal = items.reduce((acc, it) => acc + (it.total_price || (it.price * it.quantity)), 0);
                            shippingFee = Math.max(0, (totalAmount || order?.total || 0) - subtotal);
                        }

                        if (subtotal !== undefined) {
                            return (
                                <>
                                    <div className="rm-summary-row" style={{ fontSize: '14px', marginBottom: '8px' }}>
                                        <span className="rm-summary-label" style={{ fontWeight: 'normal', color: '#6b7280' }}>Tạm tính:</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="rm-summary-row" style={{ fontSize: '14px', marginBottom: '8px' }}>
                                        <span className="rm-summary-label" style={{ fontWeight: 'normal', color: '#6b7280' }}>Phí giao hàng:</span>
                                        <span>{shippingFee === 0 ? <strong style={{ color: '#10b981' }}>MIỄN PHÍ</strong> : formatPrice(shippingFee)}</span>
                                    </div>
                                    {voucherDiscount > 0 && (
                                        <div className="rm-summary-row" style={{ fontSize: '14px', marginBottom: '8px', color: '#10b981' }}>
                                            <span className="rm-summary-label" style={{ fontWeight: 'normal' }}>Giảm giá Voucher:</span>
                                            <span style={{ fontWeight: 'bold' }}>-{formatPrice(voucherDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="rm-divider" style={{ margin: '8px 0' }} />
                                </>
                            );
                        }
                        return null;
                    })()}

                    <div className="rm-summary-row">
                        <span className="rm-summary-label">Tổng thanh toán:</span>
                        <div className="rm-summary-right p-2">
                            <span className="rm-summary-total pl-5" style={{ color: '#ff5200' }}>{formatPrice(totalAmount || order?.total || 0)}</span>
                            <p className="rm-summary-note">Đã bao gồm phí giao hàng & VAT</p>
                        </div>
                    </div>

                    <div className="rm-summary-row" style={{ marginTop: '8px', borderTop: '1px dashed #e5e7eb', paddingTop: '12px' }}>
                        <span className="rm-summary-label">Thanh toán:</span>
                        <div className="rm-summary-right p-2">
                            {(() => {
                                const pMethod = order?.payment_method || order?.paymentMethod || 'cash';
                                if (pMethod === 'cash') {
                                    return <span style={{ color: '#ff5200', fontWeight: 'bold' }}>Thanh toán khi nhận hàng</span>;
                                }
                                if (paymentInfo && paymentInfo.payment_status === 'completed') {
                                    return <span style={{ color: '#10b981', fontWeight: 'bold' }}>Đã thanh toán (QR)</span>;
                                }
                                return (
                                    <>
                                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Chưa thanh toán (Chờ QR)</span>
                                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
                                            Cần thanh toán: {formatPrice(totalAmount || order?.total || 0)}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="rm-divider" />

                    {(currentStatus === 'pending' || currentStatus === 'awaiting_payment') && (
                        <div className="rm-actions11" style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {((order?.payment_method === 'transfer' || order?.paymentMethod === 'transfer') && (!paymentInfo || paymentInfo.payment_status !== 'completed')) && (
                                <button className="rm-btn-outline rm-btn-outline-orange rm-btnnnn" style={{ background: '#ff7a18', color: 'white', borderColor: '#ff7a18', flex: 1 }} onClick={() => setShowPaymentModal(true)}>
                                    Thanh Toán Ngay
                                </button>
                            )}
                            <button className="rm-btn-outline rm-btn-outline-orange rm-btnnnn" style={{ color: '#ef4444', borderColor: '#ef4444', flex: 1 }} onClick={handleCancelOrder}>
                                Hủy Đơn Hàng
                            </button>
                        </div>
                    )}

                    <div className="rm-info-note"><Info size={14} /> Vui lòng theo dõi trạng thái đơn hàng hoặc liên hệ quán nếu cần.</div>
                </section>
            </main>

            {showPaymentModal && (
                <Payment
                    open={showPaymentModal}
                    autoStartQR={true}
                    onClose={() => {
                        setShowPaymentModal(false);
                        fetchOrder();
                    }}
                    onSubmit={() => {
                        setShowPaymentModal(false);
                        fetchOrder();
                    }}
                />
            )}

            {/* Modal Review (F-09) */}
            {showReviewModal && (
                <div className="rm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowReviewModal(false); }}>
                    <div className="rm-modal-card">
                        <button className="rm-modal-close-btn" onClick={() => setShowReviewModal(false)}>&times;</button>
                        <div className="rm-modal-header">
                            <h2 className="rm-modal-title">Đánh Giá Đơn Hàng ⭐</h2>
                            <p className="rm-modal-subtitle">Chia sẻ trải nghiệm ẩm thực & dịch vụ giao hàng</p>
                        </div>
                        <form onSubmit={handleSendReview}>
                            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>CHẤM ĐIỂM CHẤT LƯỢNG</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '32px', cursor: 'pointer' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{ color: star <= rating ? '#ff7a18' : '#d1d5db', transition: 'all 0.2s' }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <div style={{ fontWeight: 700, color: '#ff7a18', marginTop: '4px', fontSize: '15px' }}>
                                    {rating === 5 ? 'Tuyệt vời / Xuất sắc 😍' : rating === 4 ? 'Rất ngon / Hài lòng 😊' : 'Bình thường 😐'}
                                </div>
                            </div>

                            <div className="rm-auth-input-group">
                                <label className="rm-auth-label">Nhận xét chi tiết món ăn / tài xế</label>
                                <textarea
                                    className="rm-auth-input"
                                    rows="3"
                                    placeholder="Món ăn nóng hổi, giao hàng siêu nhanh..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="rm-auth-btn-primary">
                                Gửi Đánh Giá (+100 Điểm)
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}