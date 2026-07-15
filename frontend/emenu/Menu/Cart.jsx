import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ChevronDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import "../styles/cart.scss";
import { API_BASE, apiFetch } from '../config';
import backIcon from '../public/images/back.png';
import AddressModal from './AddressModal';
import VoucherModal from './VoucherModal';
import LoginOtp from './LoginPhone';
import Payment from './Payment';

function formatPrice(n) {
    const num = Number(n || 0);
    return num.toLocaleString("vi-VN") + "đ";
}

export default function Cart({ setCartCount, setCartTotal }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [qtyEditing, setQtyEditing] = useState(null);

    // Modals & Online Delivery State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const [deliveryInfo, setDeliveryInfo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('deliveryInfo') || 'null') || {
                name: localStorage.getItem('customerName') || '',
                phone: localStorage.getItem('customerPhone') || '',
                address: '120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng',
                note: ''
            };
        } catch (e) {
            return { address: '120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng' };
        }
    });

    const [selectedVoucher, setSelectedVoucher] = useState(() => {
        try { return JSON.parse(localStorage.getItem('selectedVoucher') || 'null'); } catch (e) { return null; }
    });

    useEffect(() => {
        try {
            const raw = localStorage.getItem("cart") || "[]";
            const parsed = JSON.parse(raw);
            setCart(Array.isArray(parsed) ? parsed : []);
        } catch (err) {
            setCart([]);
        }

        const syncDelivery = () => {
            try {
                const info = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
                if (info) setDeliveryInfo(info);
            } catch (e) { }
        };
        window.addEventListener('delivery-updated', syncDelivery);
        window.addEventListener('storage', syncDelivery);
        return () => {
            window.removeEventListener('delivery-updated', syncDelivery);
            window.removeEventListener('storage', syncDelivery);
        };
    }, []);

    const subtotal = cart.reduce((s, it) => s + Number(it.subtotal || it.price || 0), 0);
    const getDistance = (address) => {
        if (!address) return 3;
        const lower = address.toLowerCase();
        if (lower.includes('hòa vang')) return 18;
        if (lower.includes('ngũ hành sơn')) return 12;
        if (lower.includes('sơn trà')) return 10;
        if (lower.includes('cẩm lệ')) return 8;
        if (lower.includes('hải châu')) return 6;
        if (lower.includes('thanh khê')) return 4;
        if (lower.includes('liên chiểu')) return 2;
        return Math.max(3, Math.round(address.length / 10)); // pseudo-random fallback
    };
    const distance_km = getDistance(deliveryInfo?.address);
    const shippingFee = subtotal >= 150000 ? 0 : (subtotal > 0 ? distance_km * 5000 : 0);
    let voucherDiscount = 0;
    if (selectedVoucher && subtotal >= (selectedVoucher.minSpend || 0)) {
        voucherDiscount = Number(selectedVoucher.discount || 0);
        if (selectedVoucher.code && selectedVoucher.code.toUpperCase().includes('FREESHIP')) {
            voucherDiscount = Math.min(shippingFee, voucherDiscount);
        }
    }
    const total = Math.max(0, subtotal + shippingFee - voucherDiscount);

    const removeItem = (i) => {
        const next = [...cart];
        const [removed] = next.splice(i, 1);
        setCart(next);
        try { localStorage.setItem("cart", JSON.stringify(next)); } catch (e) { }

        if (removed) {
            const removedQty = Number(removed.quantity) || 0;
            const removedSub = Number(removed.subtotal || removed.price) || 0;
            if (typeof setCartCount === 'function') setCartCount((p) => Math.max(0, (Number(p) || 0) - removedQty));
            if (typeof setCartTotal === 'function') setCartTotal((p) => Math.max(0, (Number(p) || 0) - removedSub));
        }
    };

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
        try { localStorage.setItem('cart', JSON.stringify(next)); } catch (e) { }

        const qtyDiff = newQty - prevQty;
        const subDiff = newSub - prevSub;
        if (typeof setCartCount === 'function') setCartCount((p) => Math.max(0, (Number(p) || 0) + qtyDiff));
        if (typeof setCartTotal === 'function') setCartTotal((p) => Math.max(0, (Number(p) || 0) + subDiff));
        try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
    };

    const handleSelectVoucher = (v) => {
        setSelectedVoucher(v);
        localStorage.setItem('selectedVoucher', JSON.stringify(v));
    };

    const handleCheckout = async () => {
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
            distance_km: distance_km,
            discount_amount: voucherDiscount,
            total_amount: total,
            payment_method: paymentMethod,
            items,
        };

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await apiFetch(`${API_BASE}/api/v1/orders/`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok || json.status === 'error') throw new Error(json?.msg || json?.message || 'Không thể tạo đơn hàng.');

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
                paymentMethod,
                deliveryInfo,
                selectedVoucher,
                createdAt: Date.now(),
            };
            localStorage.setItem('lastOrder', JSON.stringify(order));
            if (paycode) localStorage.setItem('paycode', String(paycode));
            try {
                let hist = [];
                const h = localStorage.getItem('orderHistoryList');
                if (h) hist = JSON.parse(h);
                hist = [order, ...hist.filter(o => (o.paycode || o.pay_code || o.id) !== (order.paycode || order.pay_code || order.id))];
                localStorage.setItem('orderHistoryList', JSON.stringify(hist));
            } catch (e) { }
            localStorage.removeItem('cart');
            localStorage.removeItem('selectedVoucher');
            setCart([]);
            if (typeof setCartCount === 'function') setCartCount(0);
            if (typeof setCartTotal === 'function') setCartTotal(0);
            if (paymentMethod === 'transfer') {
                setShowPaymentModal(true);
            } else {
                navigate('/history');
            }
        } catch (e) {
            console.error('order failed', e);
            alert(e.message || 'Không thể đặt hàng. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rm-giohang-root pb-2">
            <header className="rm-giohang-header">
                <div className="rm-header-inner">
                    <button className="rm-icon-btn" onClick={() => window.history.back()} aria-label="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="rm-address-block">
                        <span className="rm-muted-label">Giao đến </span>
                        <button className="rm-address-btn" onClick={() => setShowAddressModal(true)}>
                            {deliveryInfo.address ? `${deliveryInfo.address.substring(0, 22)}...` : 'Chọn địa chỉ'} <ChevronDown size={14} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="rm-giohang-container">
                <div>
                    <div className="rm-giohang-title">{t('cart.title') || 'Giỏ hàng của bạn'}</div>
                    <div className="rm-giohang-sub">Kiểm tra món ăn và thông tin nhận hàng trước khi thanh toán</div>
                </div>

                {/* Khối Địa Chỉ Giao Hàng (Online Delivery Block) */}
                <div style={{
                    background: '#fffaf5', border: '2px solid #ff7a18', borderRadius: '16px',
                    padding: '16px', margin: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#ff5200', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Thông tin giao hàng tận nơi
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                            {deliveryInfo.name || 'Chưa có tên'} • {deliveryInfo.phone || 'Chưa có SĐT'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '2px' }}>
                            {deliveryInfo.address || 'Chưa chọn địa chỉ giao hàng'}
                        </div>
                        {deliveryInfo.note && (
                            <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', marginTop: '2px' }}>
                                📝 Ghi chú: {deliveryInfo.note}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddressModal(true)}
                        style={{
                            background: '#ff7a18', color: 'white', border: 'none', padding: '8px 14px',
                            borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                    >
                        Đổi Địa Chỉ
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="rm-cart-card">
                        {cart.length === 0 ? (
                            <div className="rm-empty-cart">{t('cart.empty') || 'Giỏ hàng đang trống! Hãy chọn món nhé.'}</div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="rm-cart-item123">
                                    <img className="rm-cart-thumb" src={item.image || ''} alt={item.name} onError={(e) => (e.currentTarget.src = '')} />
                                    <div className="rm-cart-main p-2">
                                        <div className="rm-cart-top">
                                            <div className="rm-cart-top-left rm-cart-top-left1">
                                                <div className="rm-cart-name left-item">{item.name}</div>
                                                <div className="rm-remove-btn ml-auto block deleeteee right-item">
                                                    <button aria-label={t('cart.remove')} onClick={() => removeItem(idx)}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rm-cart-item-footer">
                                            <div className="rm-cart-info-left">
                                                {item.extras && item.extras.length > 0 && (
                                                    <div className="rm-cart-extras">
                                                        {item.extras.map((ex, i) => (
                                                            <div key={i} className="rm-cart-extras__item">
                                                                + {ex.name} {ex.price ? `(${formatPrice(ex.price)})` : ''}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {item.note && (
                                                    <div className="rm-cart-note__text">{t('cart.note')}: {item.note}</div>
                                                )}
                                            </div>

                                            <div className="rm-cart-action-right">
                                                {qtyEditing === idx ? (
                                                    <div className="rm-qty-inline rm-qty-inline1" onClick={(e) => e.stopPropagation()}>
                                                        <button className="rm-qty-btn rm-qty-btn1 rm-qty-btn--minus" type="button" onClick={(e) => { e.stopPropagation(); changeQty(idx, -1); }}>-</button>
                                                        <div className="rm-cart-qty-edit rm-cart-qty-edit1">{item.quantity}x</div>
                                                        <button className="rm-qty-btn rm-qty-btn1 rm-qty-btn--plus" type="button" onClick={(e) => { e.stopPropagation(); changeQty(idx, 1); }}>+</button>
                                                    </div>
                                                ) : (
                                                    <div className="rm-cart-qty rm-buttonedit" onClick={(e) => { e.stopPropagation(); setQtyEditing(idx); }}>
                                                        {item.quantity}x
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="rm-cart-bottom">
                                            <div className="rm-price">{formatPrice(item.subtotal || item.price)}</div>
                                            <button className="rm-edit-btn" onClick={() => navigate(`/menu/${item.id}`, { state: { cartIndex: idx, cartItem: item } })}>Chỉnh sửa</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="rm-summary">
                        <h2>{t('cart.summary') || 'Tổng thanh toán'}</h2>

                        {/* Chọn Voucher Row */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: '#f9fafb', padding: '12px', borderRadius: '12px', margin: '12px 0', border: '1px dashed #d1d5db'
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                                    Mã giảm giá: {selectedVoucher ? <span style={{ color: '#ff5200' }}>{selectedVoucher.code}</span> : 'Chưa áp dụng'}
                                </div>
                                {selectedVoucher && <div style={{ fontSize: '12px', color: '#10b981' }}>{selectedVoucher.title}</div>}
                            </div>
                            <button
                                onClick={() => setShowVoucherModal(true)}
                                style={{ background: '#ff7a18', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                            >
                                {selectedVoucher ? 'Đổi Mã' : 'Chọn Voucher'}
                            </button>
                        </div>

                        <div className="rm-row123">
                            <div>{t('cart.subtotal') || 'Tạm tính'}</div>
                            <div>{formatPrice(subtotal)}</div>
                        </div>

                        <div className="rm-row123" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
                            <div>Phí giao hàng {subtotal >= 150000 && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>(Freeship)</span>}</div>
                            <div>{shippingFee === 0 ? <strong style={{ color: '#10b981' }}>MIỄN PHÍ</strong> : formatPrice(shippingFee)}</div>
                        </div>

                        {voucherDiscount > 0 && (
                            <div className="rm-row123" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#10b981', fontWeight: 700 }}>
                                <div>Giảm giá Voucher</div>
                                <div>-{formatPrice(voucherDiscount)}</div>
                            </div>
                        )}

                        <div className="rm-total-row" style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '6px' }}>
                            <div>{t('cart.total') || 'Tổng cộng'}</div>
                            <div style={{ color: '#ff5200', fontSize: '20px' }}>{formatPrice(total)}</div>
                        </div>

                        {/* Payment Method Selection */}
                        <div style={{ marginTop: '16px', background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Phương thức thanh toán</div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                                <input type="radio" name="cart_payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                <span>Tiền mặt / Thanh toán khi nhận hàng</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="radio" name="cart_payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} />
                                <span>Chuyển khoản mã QR</span>
                            </label>
                        </div>

                        <div className="space-y-4 pt-3">
                            <button
                                className="w-full bg-[#12b886] dark:bg-[#12b886] border border-[#12b886] text-white font-medium py-3 px-5 rounded-2xl shadow-sm hover:bg-[#0fa678] dark:hover:bg-[#0fa678] transition-all active:scale-[0.98] flex justify-center items-center gap-2" disabled={submitting || cart.length === 0}
                                onClick={handleCheckout}
                            >
                                <span>{submitting ? 'Đang gửi đơn hàng…' : 'Xác Nhận Đặt Hàng Online '}</span>
                            </button>

                            <button onClick={() => navigate(-1)} className="w-full border border-slate-300 dark:border-slate-700 font-medium py-3 px-5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                                <img src={backIcon} alt="Back" className="rm-back-icon" />
                                <span>{t('cart.backHome') || 'Quay lại Trang chủ'}</span>
                            </button>
                            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                                Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ & Giao hàng của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
            <VoucherModal isOpen={showVoucherModal} onClose={() => setShowVoucherModal(false)} onSelect={handleSelectVoucher} subtotal={subtotal} />
            <LoginOtp isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            {showPaymentModal && (
                <Payment
                    open={showPaymentModal}
                    autoStartQR={true}
                    onClose={() => {
                        setShowPaymentModal(false);
                        navigate('/history');
                    }}
                    onSubmit={(method) => {
                        setShowPaymentModal(false);
                        navigate('/history');
                    }}
                />
            )}
        </div>
    );
}