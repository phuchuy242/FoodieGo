import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import "../styles/cart-tablet.scss";
import { API_BASE, apiFetch } from '../config';
import OrderSuccessful from './OrderSuccessful';
import AddressModal from './AddressModal';
import VoucherModal from './VoucherModal';

function formatPrice(n) {
    const num = Number(n || 0);
    return num.toLocaleString("vi-VN") + "đ";
}

export default function CartTablet({ setCartCount, setCartTotal }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Delivery & Voucher State
    const [deliveryInfo, setDeliveryInfo] = useState({ name: '', phone: '', address: '', note: '' });
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    useEffect(() => {
        const loadCartFromStorage = () => {
            try {
                const raw = localStorage.getItem("cart") || "[]";
                const parsed = JSON.parse(raw);
                const arr = Array.isArray(parsed) ? parsed : [];
                setCart(arr);
                if (typeof setCartCount === 'function') {
                    const count = arr.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                    setCartCount(count);
                }
                if (typeof setCartTotal === 'function') {
                    const tot = arr.reduce((s, it) => s + (Number(it.subtotal || it.price) || 0), 0);
                    setCartTotal(tot);
                }
            } catch (err) {
                setCart([]);
            }
        };

        const loadDeliveryInfo = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
                if (saved) {
                    setDeliveryInfo(saved);
                } else {
                    setDeliveryInfo({
                        name: localStorage.getItem('customerName') || '',
                        phone: localStorage.getItem('customerPhone') || '',
                        address: '',
                        note: ''
                    });
                }
            } catch (e) { }
        };

        const loadVoucher = () => {
            try {
                const v = JSON.parse(localStorage.getItem('selectedVoucher') || 'null');
                setSelectedVoucher(v);
            } catch (e) { }
        };

        // initial load
        loadCartFromStorage();
        loadDeliveryInfo();
        loadVoucher();

        // when other parts of the app (or other tabs) update cart
        const handleCartUpdated = () => loadCartFromStorage();
        const handleDeliveryUpdated = () => loadDeliveryInfo();
        const handleStorageEvent = (e) => {
            if (!e) return;
            if (e.key === 'cart') loadCartFromStorage();
            if (e.key === 'deliveryInfo' || e.key === 'customerPhone') loadDeliveryInfo();
            if (e.key === 'selectedVoucher') loadVoucher();
        };

        window.addEventListener('cart-updated', handleCartUpdated);
        window.addEventListener('delivery-updated', handleDeliveryUpdated);
        window.addEventListener('storage', handleStorageEvent);

        return () => {
            window.removeEventListener('cart-updated', handleCartUpdated);
            window.removeEventListener('delivery-updated', handleDeliveryUpdated);
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, [setCartCount, setCartTotal]);

    // Price calculations
    const subtotal = cart.reduce((s, it) => s + Number(it.subtotal || it.price || 0), 0);
    const shippingFee = subtotal >= 150000 ? 0 : (subtotal > 0 ? 15000 : 0);
    let voucherDiscount = 0;
    if (selectedVoucher && subtotal >= (selectedVoucher.minSpend || 0)) {
        if (selectedVoucher.type === 'freeship') {
            voucherDiscount = Math.min(shippingFee, selectedVoucher.value || 15000);
        } else if (selectedVoucher.type === 'percent') {
            voucherDiscount = Math.min(Math.round(subtotal * (selectedVoucher.value / 100)), selectedVoucher.maxDiscount || 50000);
        } else {
            voucherDiscount = selectedVoucher.value || 0;
        }
    }
    const total = Math.max(0, subtotal + shippingFee - voucherDiscount);

    const removeItem = (i) => {
        const next = [...cart];
        const [removed] = next.splice(i, 1);
        setCart(next);
        try {
            localStorage.setItem("cart", JSON.stringify(next));
            try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
        } catch (e) { }

        if (removed) {
            const removedQty = Number(removed.quantity) || 0;
            const removedSub = Number(removed.subtotal || removed.price) || 0;
            if (typeof setCartCount === 'function') setCartCount((p) => Math.max(0, (Number(p) || 0) - removedQty));
            if (typeof setCartTotal === 'function') setCartTotal((p) => Math.max(0, (Number(p) || 0) - removedSub));
        }
    };

    const [qtyEditing, setQtyEditing] = React.useState(null);

    const changeQty = (i, delta) => {
        const next = [...cart];
        const item = next[i];
        if (!item) return;
        const prevQty = Number(item.quantity) || 0;
        const newQty = Math.max(1, prevQty + delta);
        const prevSub = Number(item.subtotal || item.price) || 0;
        const newSub = newQty * (Number(item.price || 0) + (item.extras ? item.extras.reduce((s, ex) => s + Number(ex.price || 0), 0) : 0));

        next[i] = { ...item, quantity: newQty, subtotal: newSub };
        setCart(next);
        try {
            localStorage.setItem('cart', JSON.stringify(next));
        } catch (e) { }

        // update global counters if provided
        const qtyDiff = newQty - prevQty;
        const subDiff = newSub - prevSub;
        if (typeof setCartCount === 'function') setCartCount((p) => Math.max(0, (Number(p) || 0) + qtyDiff));
        if (typeof setCartTotal === 'function') setCartTotal((p) => Math.max(0, (Number(p) || 0) + subDiff));
        try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
    };

    if (showOrderSuccess) return <OrderSuccessful />;

    return (
        <div className="rm-ct-giohang-root pb-2">
            <div className="rm-ct-giohang-container">
                <div className="pb-2 m-2">
                    <div className="rm-ct-giohang-title">{t('cartTablet.title') || 'Giỏ Hàng Đặt Món'}</div>
                    <div className="rm-ct-giohang-sub">{t('cartTablet.subtitle') || 'Kiểm tra món ăn và chọn ưu đãi'}</div>
                </div>

                {/* 📍 Khối Thông Tin Giao Hàng */}
                <div style={{ background: '#fffaf5', border: '1px solid #ff7a18', borderRadius: '12px', padding: '12px', margin: '0 8px 16px', fontSize: '13px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, color: '#ff5200' }}>📍 Giao hàng tận nơi</span>
                        <button
                            type="button"
                            onClick={() => setShowAddressModal(true)}
                            style={{ background: '#ff7a18', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                        >
                            {deliveryInfo.phone ? 'Đổi địa chỉ' : '+ Thêm SĐT / Địa chỉ'}
                        </button>
                    </div>
                    {deliveryInfo.phone ? (
                        <div style={{ color: '#374151', lineHeight: '1.5' }}>
                            <div><strong>{deliveryInfo.name || 'Khách hàng'}</strong> - <span style={{ color: '#ff5200', fontWeight: 700 }}>{deliveryInfo.phone}</span></div>
                            <div style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>{deliveryInfo.address || 'Chưa có địa chỉ chi tiết'}</div>
                        </div>
                    ) : (
                        <div style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
                            ⚠️ Chưa có Số điện thoại & Địa chỉ nhận hàng!
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rm-ct-cart-card">
                        {cart.length === 0 ? (
                            <div className="rm-ct-empty-cart">{t('cart.empty') || 'Giỏ hàng của bạn đang trống'}</div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="rm-ct-cart-item123">
                                    <img className="rm-ct-cart-thumb" src={item.image || ''} alt={item.name} onError={(e) => (e.currentTarget.src = '')} />
                                    <div className="rm-ct-cart-main p-2">

                                        <div className="rm-ct-cart-top">
                                            <div className="rm-ct-cart-top-left rm-ct-cart-top-left1">
                                                <div className="rm-ct-cart-name left-item">{item.name}</div>
                                                <div className="rm-ct-remove-btn ml-auto block deleeteee right-item">
                                                    <button aria-label={t('cart.remove')} onClick={() => removeItem(idx)} >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rm-ct-cart-item-footer">
                                            <div className="rm-ct-cart-info-left">
                                                {item.extras && item.extras.length > 0 && (
                                                    <div className="rm-ct-cart-extras">
                                                        {item.extras.map((ex, i) => (
                                                            <div key={i} className="rm-ct-cart-extras__item">
                                                                + {ex.name} {ex.price ? `(${formatPrice(ex.price)})` : ''}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {item.note && (
                                                    <div className="rm-ct-cart-note__text">{t('cart.note')}: {item.note}</div>
                                                )}
                                            </div>

                                            <div className="rm-ct-cart-action-right">
                                                {qtyEditing === idx ? (
                                                    <div className="qty-inline rm-ct-qty-inline1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            className="rm-ct-qty-btn rm-ct-qty-btn1 qty-btn--minus"
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); changeQty(idx, -1); }}
                                                        >-</button>

                                                        <div className="rm-ct-cart-qty-edit rm-ct-cart-qty-edit1">{item.quantity}x</div>

                                                        <button
                                                            className="rm-ct-qty-btn rm-ct-qty-btn1 qty-btn--plus"
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); changeQty(idx, 1); }}
                                                        >+</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="rm-ct-cart-qty rm-ct-buttonedit"
                                                        onClick={(e) => { e.stopPropagation(); setQtyEditing(idx); }}
                                                    >
                                                        {item.quantity}x
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="rm-cart-bottom">
                                            <div className="rm-ct-price">{formatPrice(item.subtotal || item.price)}</div>
                                            <button className="rm-ct-edit-btn" onClick={() => navigate(`/menu/${item.id}`, { state: { cartIndex: idx, cartItem: item } })}>{t('cart.edit') || 'Sửa'}</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="rm-ct-summary">
                        <h2>{t('cart.summary') || 'Tổng đơn hàng'}</h2>

                        {/* 🎟️ Khối Mã Giảm Giá */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef3c7', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px', border: '1px dashed #f59e0b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#92400e', fontWeight: 700 }}>
                                <span>🎟️</span>
                                <span>{selectedVoucher ? selectedVoucher.code : 'Mã giảm giá / Freeship'}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowVoucherModal(true)}
                                style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}
                            >
                                {selectedVoucher ? 'Đổi mã' : 'Chọn Voucher'}
                            </button>
                        </div>

                        <div className="rm-ct-row123">
                            <div>{t('cart.subtotal') || 'Tạm tính'}</div>
                            <div>{formatPrice(subtotal)}</div>
                        </div>
                        <div className="rm-ct-row123" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px', color: '#4b5563' }}>
                            <div>Phí giao hàng (Freeship &gt; 150k)</div>
                            <div>{shippingFee === 0 ? <strong style={{ color: '#10b981' }}>MIỄN PHÍ</strong> : formatPrice(shippingFee)}</div>
                        </div>
                        {voucherDiscount > 0 && (
                            <div className="rm-ct-row123" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '14px', color: '#10b981', fontWeight: 700 }}>
                                <div>Giảm giá Voucher</div>
                                <div>-{formatPrice(voucherDiscount)}</div>
                            </div>
                        )}
                        <div className="rm-ct-total-row">
                            <div>{t('cart.total') || 'Tổng cộng'}</div>
                            <div style={{ color: '#ff5200' }}>{formatPrice(total)}</div>
                        </div>

                        <div className="space-y-4 pt-3">
                            <button
                                className="rm-add-btn justify-content-center"
                                disabled={submitting || cart.length === 0}
                                onClick={async () => {
                                    if (submitting || cart.length === 0) return;

                                    // Bắt buộc kiểm tra Số điện thoại và Địa chỉ giao hàng
                                    if (!deliveryInfo.phone || !deliveryInfo.phone.trim()) {
                                        alert('Bạn phải nhập Số điện thoại để tài xế và quán liên hệ khi giao món!');
                                        setShowAddressModal(true);
                                        return;
                                    }
                                    if (!deliveryInfo.address || !deliveryInfo.address.trim()) {
                                        alert('Vui lòng cung cấp Địa chỉ nhận hàng!');
                                        setShowAddressModal(true);
                                        return;
                                    }

                                    const items = cart.map((item) => ({
                                        variant: item.variant_id ?? item.id,
                                        quantity: Number(item.quantity) || 1,
                                        notes: item.note || '',
                                    }));

                                    const payload = {
                                        order_type: 'delivery',
                                        table: null,
                                        customer_name: deliveryInfo.name || localStorage.getItem('customerName') || 'Khách hàng',
                                        customer_phone: deliveryInfo.phone,
                                        delivery_address: deliveryInfo.address,
                                        delivery_note: deliveryInfo.note || '',
                                        voucher_code: selectedVoucher ? selectedVoucher.code : '',
                                        shipping_fee: shippingFee,
                                        discount_amount: voucherDiscount,
                                        total_amount: total,
                                        items,
                                    };

                                    try {
                                        setSubmitting(true);
                                        const res = await apiFetch(`${API_BASE}/api/v1/orders/`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(payload),
                                        });
                                        const json = await res.json();
                                        if (!res.ok) throw new Error(json?.msg || json?.message || 'Không thể tạo đơn hàng.');

                                        const orderId = json?.data?.id || json?.id || ('ORD' + Math.floor(Date.now() / 1000));
                                        const paycode = json?.data?.pay_code || json?.pay_code || '';
                                        const order = {
                                            id: orderId,
                                            paycode,
                                            cart,
                                            subtotal,
                                            shippingFee,
                                            voucherDiscount,
                                            total,
                                            deliveryInfo,
                                            selectedVoucher,
                                            createdAt: Date.now(),
                                        };
                                        localStorage.setItem('lastOrder', JSON.stringify(order));
                                        if (paycode) localStorage.setItem('paycode', String(paycode));
                                        localStorage.removeItem('cart');
                                        localStorage.removeItem('selectedVoucher');
                                        try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
                                        setCart([]);
                                        if (typeof setCartCount === 'function') setCartCount(0);
                                        if (typeof setCartTotal === 'function') setCartTotal(0);
                                        navigate('/odersuccessfull');
                                    } catch (e) {
                                        console.error('order failed', e);
                                        alert(e.message || 'Không thể đặt hàng. Vui lòng thử lại.');
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                <span>{submitting ? 'Đang đặt hàng…' : (t('cart.confirm') || 'Xác nhận đặt hàng Online 🚀')}</span>
                            </button>
                            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                                {t('cart.termsAgreement') || 'Bằng việc đặt hàng, bạn đồng ý với các điều khoản dịch vụ của quán.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
            <VoucherModal isOpen={showVoucherModal} onClose={() => setShowVoucherModal(false)} onSelect={(v) => { setSelectedVoucher(v); localStorage.setItem('selectedVoucher', JSON.stringify(v)); }} subtotal={subtotal} />
        </div>
    );
}