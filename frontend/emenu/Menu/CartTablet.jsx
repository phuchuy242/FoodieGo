import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import "../styles/cart-tablet.scss";
import { API_BASE, apiFetch } from '../config';
import OrderSuccessful from './OrderSuccessful';

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

        // initial load
        loadCartFromStorage();

        // when other parts of the app (or other tabs) update cart
        const handleCartUpdated = () => loadCartFromStorage();
        const handleStorageEvent = (e) => {
            if (!e) return;
            if (e.key === 'cart') {
                loadCartFromStorage();
            }
        };

        window.addEventListener('cart-updated', handleCartUpdated);
        window.addEventListener('storage', handleStorageEvent);

        return () => {
            window.removeEventListener('cart-updated', handleCartUpdated);
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, [setCartCount, setCartTotal]);



    const subtotal = cart.reduce((s, it) => s + Number(it.subtotal || it.price || 0), 0);
    const total = subtotal;

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
                    <div className="rm-ct-giohang-title">{t('cartTablet.title')}</div>
                    <div className="rm-ct-giohang-sub">{t('cartTablet.subtitle')}</div>
                </div>



                <div className="space-y-6">
                    <div className="rm-ct-cart-card">
                        {cart.length === 0 ? (
                            <div className="rm-ct-empty-cart">{t('cart.empty')}</div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="rm-ct-cart-item123">
                                    <img className="rm-ct-cart-thumb" src={item.image || ''} alt={item.name} onError={(e) => (e.currentTarget.src = '')} />
                                    <div className="rm-ct-cart-main p-2">

                                        <div className="rm-ct-cart-top">

                                            <div className="rm-ct-cart-top-left rm-ct-cart-top-left1">

                                                <div className="rm-ct-cart-name left-item">{item.name}</div>
                                                <div className="rm-ct-remove-btn ml-auto  block deleeteee right-item">
                                                    <button aria-label={t('cart.remove')} onClick={() => removeItem(idx)} >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* --- Thẻ cha bao quanh --- */}
                                        <div className="rm-ct-cart-item-footer">

                                            {/* 1. Bên trái: Extras và Note */}
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

                                            {/* 2. Bên phải: Nút chỉnh số lượng */}
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

                                            <button className="rm-ct-edit-btn" onClick={() => navigate(`/menu/${item.id}`, { state: { cartIndex: idx, cartItem: item } })}>{t('cart.edit')}</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="rm-ct-summary">
                        <h2>{t('cart.summary')}</h2>
                        <div className="rm-ct-row123">
                            <div>{t('cart.subtotal')}</div>
                            <div>{formatPrice(subtotal)}</div>
                        </div>
                        <div className="rm-ct-total-row">
                            <div>{t('cart.total')}</div>
                            <div>{formatPrice(total)}</div>
                        </div>

                        <div className="space-y-4 pt-3">
                            <button
                                className="rm-add-btn justify-content-center"
                                disabled={submitting || cart.length === 0}
                                onClick={async () => {
                                    if (submitting || cart.length === 0) return;
                                    const rawTable = localStorage.getItem('table_code') || localStorage.getItem('tableId') || '';
                                    const tableId = parseInt(rawTable, 10) || parseInt(rawTable.replace(/\D/g, ''), 10) || 1;

                                    const items = cart.map((item) => ({
                                        variant: item.variant_id ?? item.id,
                                        quantity: Number(item.quantity) || 1,
                                        notes: item.note || '',
                                    }));

                                    const payload = {
                                        table: tableId,
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
                                        if (!res.ok) throw new Error(json?.msg || 'Order failed');

                                        const orderId = json?.data?.id || json?.id || ('ORD' + Math.floor(Date.now() / 1000));
                                        const paycode = json?.data?.pay_code || json?.pay_code || '';
                                        const order = {
                                            id: orderId,
                                            paycode,
                                            cart,
                                            total,
                                            createdAt: Date.now(),
                                        };
                                        localStorage.setItem('lastOrder', JSON.stringify(order));
                                        if (paycode) localStorage.setItem('paycode', String(paycode));
                                        localStorage.setItem('lastPaycode', JSON.stringify({
                                            orderId,
                                            paycode,
                                            table: payload.table,
                                            createdAt: Date.now(),
                                        }));
                                        localStorage.removeItem('cart');
                                        try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
                                        setCart([]);
                                        if (typeof setCartCount === 'function') setCartCount(0);
                                        if (typeof setCartTotal === 'function') setCartTotal(0);
                                        setShowOrderSuccess(true);
                                    } catch (e) {
                                        console.error('order failed', e);
                                        alert(e.message || 'Không thể đặt hàng. Vui lòng thử lại.');
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                <span>{submitting ? 'Đang đặt hàng…' : t('cart.confirm')}</span>
                            </button>
                            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                                {t('cart.termsAgreement')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}