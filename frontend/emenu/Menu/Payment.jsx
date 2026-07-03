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
}) {
    const { t } = useTranslation();
    const [method, setMethod] = useState('cash');
    const [submitting, setSubmitting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrError, setQrError] = useState('');
    const [paidSuccess, setPaidSuccess] = useState(false);
    const pollRef = useRef(null);

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
                const status = json?.payment_status || json?.data?.payment_status || '';
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
                if (!res.ok) {
                    const alreadyExists = json?.errors?.pay_code?.some?.((m) =>
                        String(m).toLowerCase().includes('already exists')
                    );
                    if (alreadyExists) {
                        const getRes = await apiFetch(`${API_BASE}/api/v1/payments/by_pay_code/?pay_code=${encodeURIComponent(pay_code)}`);
                        const getData = await getRes.json();
                        if (!getRes.ok) throw new Error(getData?.msg || 'Không thể lấy thông tin thanh toán.');
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
                    <h2>{t(title)}{tableCode ? ` - ${t('paymentModal.table')} ${tableCode}` : ''}</h2>
                    <p>{t(subtitle)}</p>
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
                ) : (
                    <>
                        <div className="rm-payment-list">
                            <label className={`rm-payment-option ${method === 'cash' ? 'selected' : ''}`}>
                                <div className="rm-left">
                                    <div className="rm-icon rm-icon--green"><FaMoneyBillWave /></div>
                                    <div className="rm-label">{t('paymentModal.cash')}</div>
                                </div>
                                <input name="payment-method" type="radio" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} />
                            </label>

                            <label className={`rm-payment-option ${method === 'transfer' ? 'selected' : ''}`}>
                                <div className="rm-left">
                                    <div className="rm-icon rm-icon--blue"><FaUniversity /></div>
                                    <div className="rm-label">{t('paymentModal.bankTransfer')}</div>
                                </div>
                                <input name="payment-method" type="radio" value="transfer" checked={method === 'transfer'} onChange={() => setMethod('transfer')} />
                            </label>
                        </div>

                        {qrError && <p className="rm-qr-error">{qrError}</p>}

                        <div className="rm-payment-actions">
                            <button className="rm-payment-submit" disabled={submitting} onClick={handleSubmit}>
                                {submitting ? 'Đang tạo QR...' : t('paymentModal.submit')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}