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
    const [cart, setCart] = useState([]);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('lastOrder') || localStorage.getItem('cart') || '[]';
            const parsed = JSON.parse(raw);
            if (parsed && parsed.cart) {
                setCart(Array.isArray(parsed.cart) ? parsed.cart : []);
                setOrderId(parsed.id || ('ORD' + Math.floor(Date.now() / 1000)));
            } else {
                setCart(Array.isArray(parsed) ? parsed : []);
                setOrderId('ORD' + Math.floor(Date.now() / 1000));
            }
        } catch (e) { setCart([]); setOrderId('ORD' + Math.floor(Date.now() / 1000)) }
    }, []);

    const total = cart.reduce((s, it) => s + Number(it.subtotal || it.price || 0), 0);
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
                    <h1 className="rm-order-title">{t('orderSuccess.title')}</h1>
                    <div className="rm-order-sub">{t('orderSuccess.orderNumber')}: <strong>{orderId}</strong></div>
                    <div className="rm-order-time">{t('orderSuccess.preparingTime')}: <strong>15-20 {t('orderSuccess.minute')}</strong></div>
                </div>

                <div className="rm-summary-card">
                    <div className="rm-summary-head"><h2>{t('cart.summary')}</h2><div className="text-muted">{itemCount} {t('cartSummary.items')}</div></div>
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
                        <div className="rm-more-items">{t('orderSuccess.moreItems', { count: remainingCount })}</div>
                    )}
                    <div className="rm-summary-foot">
                        <div className="text-muted">{t('cart.total')}</div>
                        <div className="rm-total-amount">{formatPrice(total)}</div>
                    </div>
                </div>

                <div className="rm-order-actions">
                    <button className="rm-btn-primary" onClick={() => { localStorage.removeItem('cart'); navigate('/'); }}>
                        {t('orderSuccess.backHome')}
                    </button>
                    <button className="rm-btn-ghost" onClick={() => navigate('/history')}>{t('history.title')}</button>
                </div>
            </div>
        </div>
    )
}