import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/history-order.scss';
import { API_BASE, apiFetch } from '../config';
import Payment from './Payment';
import {
    ArrowLeft,
    PlusCircle,
    CreditCard,
    Info,
    RefreshCw,
} from 'react-feather';

function formatPrice(n) {
    return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}

const STATUS_COLOR = {
    pending: 'rm-status-pending',
    awaiting_payment: 'rm-status-awaiting',
    confirmed: 'rm-status-confirmed',
    serving: 'rm-status-served',
    completed: 'rm-status-served',
};

const HistoryOrder = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageMap, setImageMap] = useState({}); // productId → image_url
    const [showPayment, setShowPayment] = useState(false);

    const fetchOrder = async () => {
        const paycode = localStorage.getItem('paycode');
        if (!paycode) {
            setError(t('history.noOrders'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const [orderRes, productsRes] = await Promise.all([
                apiFetch(`${API_BASE}/api/v1/orders/by-paycode/?pay_code=${encodeURIComponent(paycode)}`),
                apiFetch(`${API_BASE}/api/v1/menu/products/?page=1&per_page=200`),
            ]);
            const orderJson = await orderRes.json();
            if (!orderRes.ok || !orderJson.status) throw new Error(orderJson?.msg || 'Fetch failed');
            setOrder(orderJson.data);

            if (productsRes.ok) {
                const productsJson = await productsRes.json();
                const products = productsJson?.data?.results || productsJson?.results || productsJson?.data || [];
                const map = {};
                products.forEach(p => { if (p.id) map[p.id] = p.image_url || p.image || ''; });
                setImageMap(map);
            }
        } catch (e) {
            setError(e.message || 'Không thể tải lịch sử đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrder(); }, []);

    const items = React.useMemo(() => {
        const raw = order?.items || [];
        const map = {};
        raw.forEach(item => {
            const key = `${item.product_name}__${item.size}__${item.variant}__${item.notes || ''}`;
            if (map[key]) {
                map[key].quantity += item.quantity;
                map[key].total_price += item.total_price;
            } else {
                map[key] = { ...item, quantity: item.quantity, total_price: item.total_price };
            }
        });
        return Object.values(map);
    }, [order]);
    const totalAmount = order ? Number(order.total_amount) : 0;

    return (
        <div className="rm-history-page">
            <header className="rm-history-header">
                <div className="rm-container rm-header-inner">
                    <button className="rm-icon-btn" onClick={() => window.history.back()} aria-label="Back">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="rm-address-block">
                        <span className="rm-muted-label">{t('history.title')}</span>
                    </div>
                    <button className="rm-icon-btn" onClick={fetchOrder} aria-label="Refresh" title="Làm mới">
                        <RefreshCw size={17} />
                    </button>
                </div>
            </header>

            <main className="rm-history-main container">
                {/* Order meta */}
                {order && (
                    <div className="rm-order-meta">
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Mã đơn:</span>
                            <strong className="rm-order-meta-value">#{order.id}</strong>
                        </div>
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Pay code:</span>
                            <strong className="rm-order-meta-value rm-paycode">{order.pay_code}</strong>
                        </div>
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Bàn:</span>
                            <span className="rm-order-meta-value">{order.table_number}</span>
                        </div>
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Trạng thái:</span>
                            <span className={`rm-status-badge1 ${STATUS_COLOR[order.status] || 'rm-status-pending'}`}>
                                <span className="rm-dot" />{order.status_display}
                            </span>
                        </div>
                        <div className="rm-order-meta-row">
                            <span className="rm-order-meta-label">Thời gian:</span>
                            <span className="rm-order-meta-value">{order.created_at}</span>
                        </div>
                    </div>
                )}

                {/* Items list */}
                <section className="rm-history-card rm-list-card">
                    {loading && <div className="rm-empty">Đang tải...</div>}
                    {!loading && error && <div className="rm-empty">{error}</div>}
                    {!loading && !error && items.length === 0 && (
                        <div className="rm-empty">{t('history.noOrders')}</div>
                    )}
                    {!loading && items.map((item) => (
                        <div key={item.id} className="rm-history-list-item">
                            <div className="rm-item-thumb">
                                <img
                                    alt={item.product_name}
                                    src={imageMap[item.variant_details?.product] || ''}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <div className="rm-item-body" style={{ flex: 1 }}>
                                <div className="rm-item-row">
                                    <div style={{ flex: 1 }}>
                                        <h3 className="rm-item-title">{item.product_name}</h3>
                                        <p className="rm-item-meta">
                                            Size: {item.size} &nbsp;•&nbsp; SL: {item.quantity}
                                        </p>
                                        {item.toppings && item.toppings.length > 0 && (
                                            <p className="rm-item-meta">
                                                Topping: {item.toppings.map(tp => tp.name).join(', ')}
                                            </p>
                                        )}
                                        {item.notes && (
                                            <p className="rm-item-meta">Ghi chú: {item.notes}</p>
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
                    <div className="rm-summary-row">
                        <span className="rm-summary-label">{t('history.totalAmount')}</span>
                        <div className="rm-summary-right p-2">
                            <span className="rm-summary-total pl-5">{formatPrice(totalAmount)}</span>
                            <p className="rm-summary-note">{t('history.includeTax')}</p>
                        </div>
                    </div>

                    <div className="rm-divider" />

                    <div className="rm-actions11">
                        <button className="rm-btn-outline rm-btn-outline-orange rm-btnnnn" onClick={() => navigate('/menu')}>
                            <PlusCircle size={25} />
                            {t('history.continueOrder')}
                        </button>
                        <button className="rm-btn-primary rm-btn-primary-green rm-btnnnn" onClick={() => setShowPayment(true)}>
                            <CreditCard size={25} /> {t('history.checkout')}
                        </button>
                    </div>
                    <div className="rm-info-note"><Info size={14} /> {t('history.orderNote')}</div>
                </section>
            </main>
            <Payment
                open={showPayment}
                tableCode={order?.table_number || ''}
                title={'paymentModal.title'}
                subtitle={'paymentModal.subtitle'}
                onClose={() => setShowPayment(false)}
                onSubmit={() => setShowPayment(false)}
            />
        </div>
    );
};

export default HistoryOrder;