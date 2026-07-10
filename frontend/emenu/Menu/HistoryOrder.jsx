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
};

export default function HistoryOrder() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageMap, setImageMap] = useState({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [paymentInfo, setPaymentInfo] = useState(null);

    const fetchOrder = async () => {
        const paycode = localStorage.getItem('paycode');
        const lastOrderRaw = localStorage.getItem('lastOrder');
        if (!paycode && !lastOrderRaw) {
            setError('Bạn chưa có đơn hàng nào đang xử lý.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            if (paycode) {
                const [orderRes, productsRes, paymentRes] = await Promise.all([
                    apiFetch(`${API_BASE}/api/v1/orders/by-paycode/?pay_code=${encodeURIComponent(paycode)}`),
                    apiFetch(`${API_BASE}/api/v1/menu/products/?page=1&per_page=200`),
                    apiFetch(`${API_BASE}/api/v1/payments/by_pay_code/?pay_code=${encodeURIComponent(paycode)}`).catch(() => ({ ok: false }))
                ]);
                const orderJson = await orderRes.json();
                if (!orderRes.ok || orderJson.status === 'error') {
                    // Fallback to local storage if API fails
                    if (lastOrderRaw) {
                        setOrder(JSON.parse(lastOrderRaw));
                    } else {
                        throw new Error(orderJson?.msg || 'Không thể tra cứu đơn hàng.');
                    }
                } else {
                    const apiOrder = orderJson.data;
                    const localOrder = lastOrderRaw ? JSON.parse(lastOrderRaw) : {};
                    if (localOrder.paycode === apiOrder.pay_code || localOrder.id === apiOrder.id) {
                        setOrder({ ...localOrder, ...apiOrder });
                    } else {
                        setOrder(apiOrder);
                    }
                }

                if (productsRes.ok) {
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
                    }
                }
            } else if (lastOrderRaw) {
                setOrder(JSON.parse(lastOrderRaw));
            }
        } catch (e) {
            if (lastOrderRaw) {
                setOrder(JSON.parse(lastOrderRaw));
            } else {
                setError(e.message || 'Không thể tải lịch sử đơn hàng.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, []);

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
    const currentStatus = order?.status || 'delivering'; // Mock default delivering for demo

    const getStepIndex = (st) => {
        if (st === 'pending' || st === 'awaiting_payment') return 0;
        if (st === 'confirmed') return 1;
        if (st === 'preparing') return 2;
        if (st === 'delivering' || st === 'serving') return 3;
        if (st === 'completed' || st === 'delivered') return 4;
        return 2; // default preparing
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
                        <span className="rm-muted-label">Theo dõi Đơn hàng Online 🚀</span>
                    </div>
                    <button className="rm-icon-btn" onClick={fetchOrder} aria-label="Refresh" title="Làm mới">
                        <RefreshCw size={17} />
                    </button>
                </div>
            </header>

            <main className="rm-history-main container">
                {/* Order Tracking Stepper (F-08) */}
                <div className="rm-stepper-container">
                    <div style={{ textAlign: 'center', marginBottom: '14px', fontWeight: 800, fontSize: '15px', color: '#111827' }}>
                        🛸 Tiến độ giao hàng trực tuyến
                    </div>
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
                            <div className="rm-step-label">Đã giao</div>
                        </div>
                    </div>

                    {/* Shipper Info Card when delivering */}
                    {(stepIdx >= 3) && (
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
                </div>

                {/* Rating Banner (F-09) */}
                {(stepIdx >= 3) && (
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
                                <span className="rm-dot" />{currentStatus === 'delivering' ? 'Đang giao hàng' : (order.status_display || 'Đang xử lý')}
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
                        <div className="rm-actions11" style={{ marginBottom: '12px' }}>
                            <button className="rm-btn-outline rm-btn-outline-orange rm-btnnnn" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleCancelOrder}>
                                Hủy Đơn Hàng
                            </button>
                        </div>
                    )}
                    
                    <div className="rm-info-note"><Info size={14} /> Vui lòng theo dõi trạng thái đơn hàng hoặc liên hệ quán nếu cần.</div>
                </section>
            </main>

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
                                Gửi Đánh Giá (+100 Điểm) 🚀
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}