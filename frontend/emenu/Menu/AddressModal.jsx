import React, { useState, useEffect } from 'react';
import '../styles/modals-extra.scss';

export default function AddressModal({ isOpen = true, onClose = () => {} }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        try {
            const saved = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
            if (saved) {
                setName(saved.name || localStorage.getItem('customerName') || '');
                setPhone(saved.phone || localStorage.getItem('customerPhone') || '');
                setAddress(saved.address || '');
                setNote(saved.note || '');
            } else {
                setName(localStorage.getItem('customerName') || '');
                setPhone(localStorage.getItem('customerPhone') || '');
                setAddress('120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng'); // Default preset
            }
        } catch (e) {
            setName(localStorage.getItem('customerName') || '');
            setPhone(localStorage.getItem('customerPhone') || '');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = (e) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !address.trim()) {
            setError('Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ nhận hàng.');
            return;
        }

        const info = {
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            note: note.trim()
        };

        localStorage.setItem('deliveryInfo', JSON.stringify(info));
        localStorage.setItem('customerName', info.name);
        localStorage.setItem('customerPhone', info.phone);

        window.dispatchEvent(new Event('delivery-updated'));
        window.dispatchEvent(new Event('storage'));
        onClose();
    };

    const applyPreset = (addr) => {
        setAddress(addr);
    };

    return (
        <div className="rm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="rm-modal-card">
                <button className="rm-modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>

                <div className="rm-modal-header">
                    <h2 className="rm-modal-title">Địa Chỉ Giao Hàng</h2>
                    <p className="rm-modal-subtitle">Nhập thông tin người nhận để Shipper giao tận nơi</p>
                </div>

                {error && <div className="rm-auth-error">{error}</div>}

                <div className="rm-preset-tags">
                    <span className="rm-preset-tag" onClick={() => applyPreset('120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng')}>📍 Quán Mì KEY KÉP</span>
                    <span className="rm-preset-tag" onClick={() => applyPreset('KTX Đại học Bách Khoa Đà Nẵng')}>🏫 KTX Bách Khoa</span>
                    <span className="rm-preset-tag" onClick={() => applyPreset('54 Nguyễn Lương Bằng, Hòa Khánh Bắc, Đà Nẵng')}>🏢 54 Nguyễn Lương Bằng</span>
                </div>

                <form onSubmit={handleSave}>
                    <div className="rm-auth-input-group">
                        <label className="rm-auth-label" style={{ fontWeight: 800, color: '#ff5200', fontSize: '15px' }}>
                            📞 Số điện thoại đặt món (Bắt buộc) <span style={{color: 'red'}}>*</span>
                        </label>
                        <input
                            type="tel"
                            className="rm-auth-input"
                            placeholder="Nhập SĐT của bạn (vd: 0912 345 678)..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="rm-auth-input-group">
                        <label className="rm-auth-label">Họ và tên người nhận <span style={{color: 'red'}}>*</span></label>
                        <input
                            type="text"
                            className="rm-auth-input"
                            placeholder="Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="rm-auth-input-group">
                        <label className="rm-auth-label">Địa chỉ giao hàng chi tiết <span style={{color: 'red'}}>*</span></label>
                        <input
                            type="text"
                            className="rm-auth-input"
                            placeholder="Số nhà, Tên đường, Phường/Xã..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div className="rm-auth-input-group">
                        <label className="rm-auth-label">Ghi chú cho tài xế/quán (Tùy chọn)</label>
                        <input
                            type="text"
                            className="rm-auth-input"
                            placeholder="Vd: Gọi trước khi đến 5 phút, để trước cổng..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="rm-auth-btn-primary">
                        Xác Nhận & Lưu Địa Chỉ
                    </button>
                </form>
            </div>
        </div>
    );
}
