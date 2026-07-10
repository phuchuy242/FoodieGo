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
                const res = await apiFetch(`${API_BASE}/api/v1/payments/create_with_qr/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pay_code, payment_method: 'bank_transfer' }),
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
                            <p className="rm-qr-amount">Số tiền: <strong>{Number(qrData.amount).toLocaleString('vi-VN')}đ</strong></p>
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