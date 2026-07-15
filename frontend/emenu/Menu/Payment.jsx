import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMoneyBillWave, FaUniversity } from 'react-icons/fa';
import { API_BASE, apiFetch } from '../config';
import '../styles/payment.scss';

export default function Payment({
    open = true,
    title = 'payment.title',
    subtitle = 'payment.subtitle',
    tableCode = '',
    onClose = () => { },
    onSubmit = (method) => { },
    autoStartQR = false,
}) {
    const { t } = useTranslation();
    const [method, setMethod] = useState(autoStartQR ? 'transfer' : 'cash');
    const [submitting, setSubmitting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrError, setQrError] = useState('');
    const [paidSuccess, setPaidSuccess] = useState(false);
    const pollRef = useRef(null);
    const hasAutoStarted = useRef(false);

    useEffect(() => {
        if (open && autoStartQR && !hasAutoStarted.current) {
            hasAutoStarted.current = true;
            handleSubmit();
        }
        if (!open) hasAutoStarted.current = false;
    }, [open, autoStartQR]);

    // Poll payment status every 10s when QR is shown
    useEffect(() => {
        if (!qrData) {
            clearInterval(pollRef.current);
            return;
        }
        const pay_code = localStorage.getItem('paycode') || '';
        if (!pay_code) return;

        pollRef.current = setInterval(async () => {
            try {
                const res = await apiFetch(`${API_BASE}/api/v1/payments/by_pay_code/?pay_code=${encodeURIComponent(pay_code)}`);
                if (!res.ok) return;
                const json = await res.json();
                if (json.status === 'error') return;
                const status = json?.data?.payment_status || json?.payment_status || '';
                if (status === 'completed' || status === 'paid') {
                    clearInterval(pollRef.current);
                    setPaidSuccess(true);
                    setTimeout(() => {
                        setPaidSuccess(false);
                        setQrData(null);
                        onSubmit('transfer');
                    }, 2500);
                }
            } catch { /* ignore */ }
        }, 10000);

        return () => clearInterval(pollRef.current);
    }, [qrData]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (method === 'transfer') {
            const pay_code = localStorage.getItem('paycode') || '';
            if (!pay_code) {
                setQrError('Không tìm thấy mã đơn hàng.');
                return;
            }
            setSubmitting(true);
            setQrError('');
            try {
                let shipping_fee = 0;
                let discount_amount = 0;
                let voucher_code = '';
                try {
                    const lastOrderStr = localStorage.getItem('lastOrder');
                    if (lastOrderStr) {
                        const lastOrder = JSON.parse(lastOrderStr);
                        if (lastOrder && (String(lastOrder.paycode) === String(pay_code) || String(lastOrder.id) === String(pay_code) || !lastOrder.paycode)) {
                            shipping_fee = Number(lastOrder.shippingFee || lastOrder.shipping_fee || 0);
                            discount_amount = Number(lastOrder.voucherDiscount || lastOrder.discount_amount || 0);
                            voucher_code = lastOrder.selectedVoucher?.code || lastOrder.voucher_code || '';
                        }
                    }
                } catch (e) { /* ignore */ }

                const res = await apiFetch(`${API_BASE}/api/v1/payments/create_with_qr/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pay_code,
                        payment_method: 'bank_transfer',
                        shipping_fee,
                        discount_amount,
                        voucher_code
                    }),
                });
                const json = await res.json();

                // Nếu payment đã tồn tại, GET lại thông tin QR cũ
                if (!res.ok || json.status === 'error') {
                    const alreadyExists = json?.data?.pay_code?.some?.((m) =>
                        String(m).toLowerCase().includes('already exists')
                    ) || json?.errors?.pay_code?.some?.((m) =>
                        String(m).toLowerCase().includes('already exists')
                    ) || (json.msg && json.msg.toLowerCase().includes('already exists'));
                    
                    if (alreadyExists) {
                        const getRes = await apiFetch(`${API_BASE}/api/v1/payments/by_pay_code/?pay_code=${encodeURIComponent(pay_code)}`);
                        const getData = await getRes.json();
                        if (!getRes.ok || getData.status === 'error') throw new Error(getData?.msg || 'Không thể lấy thông tin thanh toán.');
                        const data = getData.data ?? getData;
                        setQrData(data);
                        return;
                    }
                    throw new Error(json?.msg || json?.detail || 'Tạo QR thất bại');
                }

                const data = json.data ?? json;
                setQrData(data);
            } catch (e) {
                setQrError(e.message || 'Không thể tạo mã QR.');
            } finally {
                setSubmitting(false);
            }
        } else {
            onSubmit(method);
        }
    };

    const handleCancelQr = async () => {
        const pay_code = localStorage.getItem('paycode') || '';
        if (!pay_code) { setQrData(null); return; }
        setCancelling(true);
        try {
            await apiFetch(`${API_BASE}/api/v1/payments/cancel-by-paycode/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pay_code }),
            });
        } catch { /* ignore */ } finally {
            setCancelling(false);
            setQrData(null);
            setQrError('');
        }
    };

    return (
        <div className="rm-payment-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) { onClose(); setQrData(null); setQrError(''); } }}>
            <div className="rm-payment-card">
                <div className="rm-payment-grip" aria-hidden />
                <div className="rm-payment-header">
                    <h2>{t(title) || 'Phương Thức Thanh Toán'}</h2>
                    <p>{t(subtitle) || 'Chọn hình thức thanh toán thuận tiện nhất'}</p>
                </div>

                {/* Paid success screen */}
                {paidSuccess ? (
                    <div className="rm-payment-qr">
                        <div className="rm-qr-success-icon">✓</div>
                        <p className="rm-qr-amount"><strong>Thanh toán thành công!</strong></p>
                        <p className="rm-qr-bank">Đơn hàng của bạn đã được xác nhận.</p>
                    </div>
                ) : qrData ? (
                    <div className="rm-payment-qr">
                        {(qrData.qr_code_url || qrData.qr_data) && (
                            <img src={qrData.qr_code_url || qrData.qr_data} alt="QR chuyển khoản" className="rm-qr-img" />
                        )}
                        {qrData.amount && (
                            <div className="rm-qr-amount-box" style={{ margin: '12px 0', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}>
                                {(() => {
                                    let sub = 0;
                                    let ship = 0;
                                    let disc = 0;
                                    try {
                                        const lastOrderStr = localStorage.getItem('lastOrder');
                                        if (lastOrderStr) {
                                            const lastOrder = JSON.parse(lastOrderStr);
                                            sub = Number(lastOrder.subtotal || 0);
                                            ship = Number(lastOrder.shippingFee || lastOrder.shipping_fee || 0);
                                            disc = Number(lastOrder.voucherDiscount || lastOrder.discount_amount || 0);
                                        }
                                    } catch (e) { }
                                    return (
                                        <>
                                            {(ship > 0 || disc > 0) && (
                                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {sub > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tạm tính món:</span><span>{Number(sub).toLocaleString('vi-VN')}đ</span></div>}
                                                    {ship > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Phí giao hàng:</span><span>+{Number(ship).toLocaleString('vi-VN')}đ</span></div>}
                                                    {disc > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}><span>Voucher giảm giá:</span><span>-{Number(disc).toLocaleString('vi-VN')}đ</span></div>}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '18px', color: '#ff5200', borderTop: (ship > 0 || disc > 0) ? '1px dashed #cbd5e1' : 'none', paddingTop: (ship > 0 || disc > 0) ? '8px' : '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Số tiền thanh toán:</span>
                                                <strong>{Number(qrData.amount).toLocaleString('vi-VN')}đ</strong>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                        {qrData.bank_name && (
                            <p className="rm-qr-bank"><strong>{qrData.bank_name}</strong> — {qrData.bank_account_number}</p>
                        )}
                        {qrData.bank_account_name && (
                            <p className="rm-qr-bank">{qrData.bank_account_name}</p>
                        )}
                        {qrData.transfer_content && (
                            <div className="rm-qr-content">
                                Nội dung CK: <strong>{qrData.transfer_content}</strong>
                            </div>
                        )}
                        <button className="rm-payment-cancel" disabled={cancelling} onClick={handleCancelQr}>
                            {cancelling ? 'Đang hủy...' : 'Hủy thanh toán'}
                        </button>
                    </div>
                ) : !autoStartQR ? (
                    <div className="rm-payment-body">
                        <p className="rm-payment-subtitle">{t(subtitle)}</p>

                        <div className="rm-payment-methods">
                            <label className={`rm-method-label ${method === 'cash' ? 'active' : ''}`}>
                                <input type="radio" name="payment_method" value="cash" checked={method === 'cash'} onChange={(e) => setMethod(e.target.value)} />
                                <FaMoneyBillWave className="rm-method-icon" />
                                <span>Tiền mặt / Tại quầy</span>
                            </label>
                            <label className={`rm-method-label ${method === 'transfer' ? 'active' : ''}`}>
                                <input type="radio" name="payment_method" value="transfer" checked={method === 'transfer'} onChange={(e) => setMethod(e.target.value)} />
                                <FaUniversity className="rm-method-icon" />
                                <span>Chuyển khoản QR</span>
                            </label>
                        </div>

                        {qrError && <div className="rm-payment-error">{qrError}</div>}

                        <button
                            className="rm-payment-submit"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang xử lý...' : (method === 'transfer' ? 'Lấy mã QR' : 'Xác nhận thanh toán')}
                        </button>
                    </div>
                ) : (
                    <div className="rm-payment-body" style={{ textAlign: 'center', padding: '2rem' }}>
                        {qrError ? <div className="rm-payment-error">{qrError}</div> : <div className="spinner">Đang tạo mã QR...</div>}
                    </div>
                )}
            </div>
        </div>
    );
}