import React, { useState, useEffect } from 'react';
import '../styles/modals-extra.scss';
import { API_BASE, apiFetch } from '../config';

export default function VoucherModal({ isOpen = true, onClose = () => {}, onSelect = (voucher) => {}, subtotal = 0 }) {
    const [customCode, setCustomCode] = useState('');
    const [error, setError] = useState('');
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchVouchers();
        }
    }, [isOpen]);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await apiFetch(`${API_BASE}/api/v1/vouchers/`);
            const json = await res.json();
            const results = json.data?.results || json.results || json.data || [];
            
            if (Array.isArray(results)) {
                // Filter only valid ones and map to UI format
                const active = results.filter(v => v.is_active && v.is_valid !== false).map(v => {
                    const minSpend = Number(v.min_order_amount || 0);
                    let discountAmt = 0;
                    // Our mock logic uses 'discount' field for the max discount text/amount
                    if (v.discount_type === 'percentage') {
                        // store percentage info
                        discountAmt = `${parseFloat(v.discount_value)}%`;
                    } else {
                        discountAmt = Number(v.discount_value);
                    }
                    
                    return {
                        original: v,
                        code: v.code,
                        title: v.description || `Mã ưu đãi ${v.code}`,
                        minSpend: minSpend,
                        discount: discountAmt,
                        desc: v.description || (v.discount_type === 'percentage' 
                                ? `Giảm ${parseFloat(v.discount_value)}% cho đơn từ ${minSpend.toLocaleString('vi-VN')}đ`
                                : `Giảm ${Number(v.discount_value).toLocaleString('vi-VN')}đ cho đơn từ ${minSpend.toLocaleString('vi-VN')}đ`),
                        discount_type: v.discount_type,
                        discount_value: Number(v.discount_value)
                    };
                });
                setAvailableVouchers(active);
            }
        } catch (err) {
            console.error('Failed to fetch vouchers', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const calculateDiscountValue = (voucherData, currentSubtotal) => {
        if (voucherData.discount_type === 'percentage') {
            return (currentSubtotal * voucherData.discount_value) / 100;
        }
        return voucherData.discount_value;
    };

    const handleApply = (v) => {
        if (subtotal < v.minSpend) {
            setError(`Đơn hàng hiện tại (${subtotal.toLocaleString('vi-VN')}đ) chưa đạt giá trị tối thiểu ${v.minSpend.toLocaleString('vi-VN')}đ.`);
            return;
        }
        setError('');
        
        // Compute the actual numeric discount based on subtotal for percentages
        const actualDiscount = calculateDiscountValue(v, subtotal);
        
        onSelect({
            code: v.code,
            title: v.title,
            minSpend: v.minSpend,
            discount: actualDiscount, // pass actual calculated amount
            desc: v.desc,
            original: v.original
        });
        onClose();
    };

    const handleCustomSubmit = async (e) => {
        e.preventDefault();
        if (!customCode.trim()) return;
        const code = customCode.trim().toUpperCase();
        
        // Check if already in the list
        const found = availableVouchers.find(v => v.code === code);
        if (found) {
            handleApply(found);
            return;
        }
        
        // Otherwise try to validate via API
        try {
            const res = await apiFetch(`${API_BASE}/api/v1/vouchers/validate/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const json = await res.json();
            if (!res.ok || json.status === 'error' || json.status === false) {
                throw new Error(json.msg || 'Mã giảm giá không tồn tại hoặc đã hết hạn.');
            }
            
            const data = json.data || json;
            const minSpend = Number(data.min_order_amount || 0);
            if (subtotal < minSpend) {
                setError(`Đơn hàng hiện tại (${subtotal.toLocaleString('vi-VN')}đ) chưa đạt tối thiểu ${minSpend.toLocaleString('vi-VN')}đ.`);
                return;
            }
            
            let actualDiscount = 0;
            if (data.discount_type === 'percentage') {
                actualDiscount = (subtotal * Number(data.discount_value)) / 100;
            } else {
                actualDiscount = Number(data.discount_value);
            }
            
            onSelect({
                code: data.code,
                title: data.description || `Mã ưu đãi ${data.code}`,
                minSpend: minSpend,
                discount: actualDiscount,
                desc: data.description || `Giảm ${actualDiscount.toLocaleString('vi-VN')}đ`,
                original: data
            });
            setError('');
            onClose();
        } catch (err) {
            setError(err.message || 'Lỗi kiểm tra mã.');
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
                        placeholder="Nhập mã voucher (vd: TET2024)"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        style={{ textTransform: 'uppercase' }}
                    />
                    <button type="submit" className="rm-voucher-apply-btn" style={{ whiteSpace: 'nowrap' }}>
                        Áp Dụng
                    </button>
                </form>

                <div className="rm-voucher-list">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Đang tải mã giảm giá...</div>
                    ) : availableVouchers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Chưa có mã giảm giá nào.</div>
                    ) : (
                        availableVouchers.map((v) => {
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
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
