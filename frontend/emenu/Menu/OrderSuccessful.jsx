import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/oder-success.scss';

function formatPrice(n) {
    return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}

export default function OrderSuccessful() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('lastOrder') || 'null';
            const parsed = JSON.parse(raw);
            if (parsed && parsed.cart) {
                setOrder(parsed);
            } else {
                // Fallback
                const cartRaw = JSON.parse(localStorage.getItem('cart') || '[]');
                setOrder({
                    id: 'ORD' + Math.floor(Date.now() / 1000),
                    cart: Array.isArray(cartRaw) ? cartRaw : [],
                    subtotal: 0,
                    shippingFee: 15000,
                    voucherDiscount: 0,
                    total: 0,
                    deliveryInfo: {
                        name: localStorage.getItem('customerName') || 'Khách hàng',
                        phone: localStorage.getItem('customerPhone') || '',
                        address: '120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng'
                    }
                });
            }
        } catch (e) {
            setOrder({
                id: 'ORD' + Math.floor(Date.now() / 1000),
                cart: [],
                subtotal: 0, total: 0
            });
        }
    }, []);

    const cart = order?.cart || [];
    const subtotal = order?.subtotal || cart.reduce((s, it) => s + Number(it.subtotal || it.price || 0), 0);
    const shippingFee = order?.shippingFee ?? (subtotal >= 150000 ? 0 : 15000);
    const voucherDiscount = order?.voucherDiscount || 0;
    const total = order?.total || Math.max(0, subtotal + shippingFee - voucherDiscount);
    const itemCount = cart.reduce((s, it) => s + Number(it.quantity || 1), 0);
    const displayedCount = cart.slice(0, 4).reduce((s, it) => s + Number(it.quantity || 1), 0);
    const remainingCount = Math.max(0, itemCount - displayedCount);

    return (
        <div className="rm-order-root">
            <div className="rm-order-wrap">
                <div className="rm-order-hero">
                    <div className="rm-order-badge" aria-hidden>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#bbf7d0" />
                            <path d="M7 13l3 3 7-7" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="rm-order-title">Đặt Hàng Online Thành Công! 🎉</h1>
                    <div className="rm-order-sub">Mã đơn hàng: <strong>#{order?.id}</strong> {order?.paycode && `• PayCode: ${order.paycode}`}</div>
                    <div className="rm-order-time" style={{ background: '#fffaf5', color: '#ff5200', border: '1px solid #ff7a18' }}>
                        ⚡ Thời gian giao hàng dự kiến: <strong>20 - 30 phút</strong>
                    </div>
                </div>

                {/* Khối Thông Tin Giao Hàng */}
                <div className="rm-summary-card" style={{ marginBottom: '16px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div className="rm-summary-head" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                        <h2 style={{ fontSize: '16px', color: '#111827' }}>📍 Thông tin nhận hàng</h2>
                    </div>
                    <div style={{ padding: '14px 16px', fontSize: '14px', lineHeight: '1.7', color: '#374151' }}>
                        <div>👤 <strong>Người nhận:</strong> {order?.deliveryInfo?.name || localStorage.getItem('customerName')} • <strong>SĐT:</strong> {order?.deliveryInfo?.phone || localStorage.getItem('customerPhone') || 'Chưa có SĐT'}</div>
                        <div>🏠 <strong>Địa chỉ:</strong> {order?.deliveryInfo?.address || '120 Hoàng Minh Thảo, Đà Nẵng'}</div>
                        {order?.deliveryInfo?.note && <div>📝 <strong>Ghi chú:</strong> {order.deliveryInfo.note}</div>}
                    </div>
                </div>

                <div className="rm-summary-card">
                    <div className="rm-summary-head"><h2>Chi tiết món ăn</h2><div className="text-muted">{itemCount} món</div></div>
                    <div className="rm-summary-list">
                        {cart.slice(0, 4).map((it, idx) => (
                            <div key={idx} className="rm-item-row">
                                <img className="rm-item-thumb" src={it.image || ''} alt={it.name} onError={(e) => e.currentTarget.src = ''} />
                                <div className="rm-item-row__content">
                                    <div className="rm-item-name"><span className="rm-item-qty">{it.quantity}x</span> {it.name}</div>
                                </div>
                                <div className="rm-item-price">{formatPrice(it.subtotal || it.price)}</div>
                            </div>
                        ))}
                    </div>
                    {remainingCount > 0 && (
                        <div className="rm-more-items">…và {remainingCount} món khác</div>
                    )}
                    <div className="rm-summary-foot" style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                            <span>Tạm tính:</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                            <span>Phí vận chuyển:</span>
                            <span>{shippingFee === 0 ? <strong style={{ color: '#10b981' }}>MIỄN PHÍ</strong> : formatPrice(shippingFee)}</span>
                        </div>
                        {voucherDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981', fontWeight: 700 }}>
                                <span>Voucher giảm giá:</span>
                                <span>-{formatPrice(voucherDiscount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e5e7eb' }}>
                            <span>Tổng thanh toán:</span>
                            <span className="rm-total-amount" style={{ color: '#ff5200' }}>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="rm-order-actions">
                    <button className="rm-btn-primary" onClick={() => navigate('/history')}>
                        Theo dõi trạng thái đơn hàng 🚀
                    </button>
                    <button className="rm-btn-ghost" onClick={() => { localStorage.removeItem('cart'); navigate('/'); }}>
                        Quay về Trang Chủ
                    </button>
                </div>
            </div>
        </div>
    );
}