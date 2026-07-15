import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoLocationSharp, IoPartlySunnyOutline, IoPencilOutline } from 'react-icons/io5';
import { FaGift as GiftIcon, FaCreditCard as CardIcon, FaShoppingCart as CartIcon, FaStar as StarIcon, FaArrowRight as ArrowIcon, FaTag as TagIcon } from 'react-icons/fa';
import '../styles/home-full.scss';
import HERO from '../public/images/home.png';
import LanguageSwitcher from './LanguageSwitcher';
import LoginOtp from './LoginPhone';
import Payment from './Payment';
import AddressModal from './AddressModal';
import VoucherModal from './VoucherModal';

export default function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showPayment, setShowPayment] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    const [name, setName] = useState(() => localStorage.getItem('customerName') || t('home.guestName') || 'Khách hàng');
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('accessToken'));
    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(name);
    const inputRef = useRef(null);

    const [deliveryAddress, setDeliveryAddress] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
            return saved?.address || '120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng';
        } catch (e) {
            return '120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng';
        }
    });

    useEffect(() => {
        const syncAuth = () => {
            const token = localStorage.getItem('accessToken');
            setIsLoggedIn(!!token);
            setName(localStorage.getItem('customerName') || t('home.guestName') || 'Khách hàng');
        };

        const syncAddress = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
                if (saved?.address) setDeliveryAddress(saved.address);
            } catch (e) { }
        };

        window.addEventListener('auth-updated', syncAuth);
        window.addEventListener('delivery-updated', syncAddress);
        window.addEventListener('storage', (e) => {
            syncAuth();
            syncAddress();
        });

        return () => {
            window.removeEventListener('auth-updated', syncAuth);
            window.removeEventListener('delivery-updated', syncAddress);
        };
    }, [t]);

    useEffect(() => {
        if (editing) {
            setTempName(name);
            setTimeout(() => inputRef.current?.focus?.(), 0);
        }
    }, [editing, name]);

    const saveName = () => {
        const v = (tempName || '').trim() || 'Khách hàng';
        setName(v);
        try { localStorage.setItem('customerName', v); } catch (e) { }
        setEditing(false);
    };

    const handleSelectVoucher = (voucher) => {
        localStorage.setItem('selectedVoucher', JSON.stringify(voucher));
        alert(`🎉 Đã chọn mã giảm giá [${voucher.code}] - ${voucher.title}! Sẽ tự động áp dụng tại giỏ hàng.`);
    };

    return (
        <div className="rm-home-full-root">
            <header className="rm-hf-header">
                <div className="rm-hf-header-inner">
                    <div className="rm-hf-left">
                        <h1 className="rm-hf-title">Mì KEY KÉP ĐỘ CR7 • FOOD DELIVERY</h1>
                        <div className="rm-hf-location" onClick={() => setShowAddressModal(true)} style={{ cursor: 'pointer' }}>
                            <span className="rm-hf-icon"><IoLocationSharp /></span>
                            <p className="rm-hf-location-text">Giao đến: {deliveryAddress}</p>
                        </div>
                    </div>
                    <div className="rm-hf-flag">
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            <div className="rm-hf-hero-wrap">
                <div className="rm-hf-hero">
                    <img src={HERO} alt="hero" className="rm-hf-hero-img" />
                    <div style={{
                        position: 'absolute', bottom: 16, left: 16,
                        background: 'rgba(255,122,24,0.9)', color: 'white',
                        padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '13px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        ⚡ Giao nhanh tận nơi trong 20 - 30 phút!
                    </div>
                </div>
            </div>

            <div className="rm-hf-card-top">
                <div className="rm-hf-greet">
                    <div className="rm-hf-greet-inner">
                        <span className="rm-hf-sun"><IoPartlySunnyOutline /></span>
                        {editing ? (
                            <input
                                ref={inputRef}
                                className="rm-hf-greet-input"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveName();
                                    if (e.key === 'Escape') setEditing(false);
                                }}
                                onBlur={saveName}
                            />
                        ) : (
                            <p className="rm-hf-greet-text" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
                                Xin chào, <span className="rm-hf-blue">{name}</span>
                            </p>
                        )}
                        <button className="rm-hf-edit" onClick={() => setEditing(true)}><IoPencilOutline /></button>
                    </div>

                    {/* Thay thế chọn Bàn bằng chọn Địa chỉ Giao Hàng */}
                    <div className="rm-hf-table" style={{ position: 'relative' }}>
                        <p className="rm-hf-table-text">Địa chỉ nhận hàng (Bấm để đổi):</p>
                        <span
                            className="rm-hf-table-pill"
                            onClick={() => setShowAddressModal(true)}
                            title="Bấm để đổi địa chỉ giao hàng"
                            style={{ background: '#fff7ed', color: '#ff7a18', borderColor: '#ff7a18' }}
                        >
                            {deliveryAddress.length > 25 ? `${deliveryAddress.substring(0, 25)}...` : deliveryAddress}
                            <IoPencilOutline style={{ marginLeft: 6, fontSize: 13 }} />
                        </span>
                    </div>
                </div>

                <div className="rm-hf-phone-btn">
                    <button className="rm-hf-phone" tabIndex={0} onClick={() => setShowLogin(true)}>
                        <div className="rm-hf-phone-left"><GiftIcon /></div>
                        <div className="rm-hf-phone-label">
                            {isLoggedIn ? `Tài khoản: ${name} • Quản lý & Đăng xuất` : 'Đăng nhập / Đăng ký để tích điểm & nhận ưu đãi'}
                        </div>
                        <div className="rm-hf-phone-chevron">›</div>
                    </button>
                </div>

                <div className="rm-hf-features">
                    <div className="rm-hf-feature" role="button" tabIndex={0} onClick={() => setShowVoucherModal(true)}>
                        Mã Giảm Giá
                        <div className="rm-hf-feature-ico"><TagIcon /></div>
                    </div>

                    <div className="rm-hf-feature" role="button" tabIndex={0} onClick={() => navigate('/history')}>
                        {t('history.title') || 'Đơn hàng'}
                        <div className="rm-hf-stars"><CartIcon /></div>
                    </div>

                </div>

                <div className="rm-hf-cta">
                    <button className="rm-hf-cta-btn" onClick={() => {
                        const phone = localStorage.getItem('customerPhone');
                        if (!phone || !phone.trim()) {
                            alert('Vui lòng nhập Số điện thoại và Địa chỉ nhận hàng để bắt đầu đặt món!');
                            setShowAddressModal(true);
                        } else {
                            navigate('/menu');
                        }
                    }}>
                        <span className="rm-hf-cta-text">{t('home.viewMenu') || 'XEM THỰC ĐƠN & ĐẶT MÓN'}</span>
                        <span className="rm-hf-cta-icon"><ArrowIcon /></span>
                    </button>
                </div>
            </div>

            <LoginOtp isOpen={showLogin} onClose={() => setShowLogin(false)} />
            <Payment open={showPayment} onClose={() => setShowPayment(false)} onSubmit={() => setShowPayment(false)} />
            <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
            <VoucherModal isOpen={showVoucherModal} onClose={() => setShowVoucherModal(false)} onSelect={handleSelectVoucher} subtotal={200000} />
        </div>
    );
}