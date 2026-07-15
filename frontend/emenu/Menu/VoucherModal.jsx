import React, { useState } from 'react';
import '../styles/modals-extra.scss';
import { API_BASE, apiFetch } from '../config';

export default function VoucherModal({ isOpen = true, onClose = () => {}, onSelect = (voucher) => {}, subtotal = 0 }) {
    const [customCode, setCustomCode] = useState('');
    const [error, setError] = useState('');

    const availableVouchers = [
        {
            code: 'FREESHIP15',
            title: 'Miễn phí vận chuyển 15.000đ',
            minSpend: 100000,
            discount: 15000,
            desc: 'Áp dụng cho đơn từ 100.000đ'
        },
        {
            code: 'GIAM20K',
            title: 'Giảm ngay 20.000đ cho đơn',
            minSpend: 150000,
            discount: 20000,
            desc: 'Áp dụng cho đơn từ 150.000đ'
        },
        {
            code: 'CR7SUPER',
            title: 'Khuyến mãi đặc biệt giảm 50.000đ',
            minSpend: 300000,
            discount: 50000,
            desc: 'Áp dụng cho đơn từ 300.000đ'
        }
    ];

    if (!isOpen) return null;

    const handleApply = (v) => {
        if (subtotal < v.minSpend) {
            setError(`Đơn hàng hiện tại (${subtotal.toLocaleString('vi-VN')}đ) chưa đạt giá trị tối thiểu ${v.minSpend.toLocaleString('vi-VN')}đ.`);
            return;
        }
        setError('');
        onSelect(v);
        onClose();
    };

    const handleCustomSubmit = async (e) => {
        e.preventDefault();
        if (!customCode.trim()) return;
        const code = customCode.trim().toUpperCase();
        const found = availableVouchers.find(v => v.code === code);
        if (found) {
            handleApply(found);
        } else {
            try {
                const res = await apiFetch(`${API_BASE}/api/v1/vouchers/validate/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const json = await res.json();
                if (!res.ok || json.status === 'error') {
                    throw new Error(json.msg || 'Mã giảm giá không tồn tại hoặc đã hết hạn.');
                }
                
                const data = json.data || json;
                const minSpend = Number(data.min_order_amount || 0);
                if (subtotal < minSpend) {
                    setError(`Đơn hàng hiện tại (${subtotal.toLocaleString('vi-VN')}đ) chưa đạt tối thiểu ${minSpend.toLocaleString('vi-VN')}đ.`);
                    return;
                }
                
                let discountAmt = 0;
                if (data.discount_type === 'percent') {
                    discountAmt = (subtotal * Number(data.discount_value)) / 100;
                } else {
                    discountAmt = Number(data.discount_value);
                }
                
                onSelect({
                    code: data.code,
                    title: data.description || `Mã ưu đãi ${data.code}`,
                    minSpend: minSpend,
                    discount: discountAmt,
                    desc: data.description || `Giảm ${discountAmt.toLocaleString('vi-VN')}đ`
                });
                setError('');
                onClose();
            } catch (err) {
                setError(err.message || 'Lỗi kiểm tra mã.');
            }
        }
    };

    return (
        <div className="rm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="rm-modal-card">
                <button className="rm-modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>

                <div className="rm-modal-header">
                    <h2 className="rm-modal-title">Chọn Mã Giảm Giá</h2>
                    <p className="rm-modal-subtitle">Áp dụng ưu đãi để tích kiệm chi phí giao hàng</p>
                </div>

                {error && <div className="rm-auth-error">{error}</div>}

                <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        className="rm-auth-input"
                        placeholder="Nhập mã voucher (vd: FREESHIP15)"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        style={{ textTransform: 'uppercase' }}
                    />
                    <button type="submit" className="rm-voucher-apply-btn" style={{ whiteSpace: 'nowrap' }}>
                        Áp Dụng
                    </button>
                </form>

                <div className="rm-voucher-list">
                    {availableVouchers.map((v) => {
                        const eligible = subtotal >= v.minSpend;
                        return (
                            <div key={v.code} className={`rm-voucher-item ${!eligible ? 'disabled' : ''}`}>
                                <div className="rm-voucher-left">
                                    <span className="rm-voucher-code">{v.code}</span>
                                    <span className="rm-voucher-desc">{v.title}</span>
                                    <span className="rm-voucher-min">{v.desc}</span>
                                </div>
                                <button
                                    type="button"
                                    className="rm-voucher-apply-btn"
                                    onClick={() => handleApply(v)}
                                    disabled={!eligible}
                                >
                                    {eligible ? 'Dùng Ngay' : 'Chưa Đạt'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
