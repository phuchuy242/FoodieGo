import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.scss';

import AddressModal from './AddressModal';

export default function Header({ address, onBack, query, onQueryChange }) {
    const navigate = useNavigate();
    const [showAddressModal, setShowAddressModal] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
            if (saved && saved.address) return saved.address;
            return address || '120 Hoàng Minh Thảo, Đà Nẵng';
        } catch (e) {
            return address || '120 Hoàng Minh Thảo, Đà Nẵng';
        }
    });

    const [localCartCount, setLocalCartCount] = useState(() => {
        try {
            const raw = localStorage.getItem('cart') || '[]';
            const items = JSON.parse(raw);
            if (!Array.isArray(items)) return 0;
            return items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
        } catch (e) {
            return 0;
        }
    });

    useEffect(() => {
        const updateCart = () => {
            try {
                const raw = localStorage.getItem('cart') || '[]';
                const items = JSON.parse(raw);
                if (!Array.isArray(items)) return setLocalCartCount(0);
                const c = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                setLocalCartCount(c);
            } catch (e) {
                setLocalCartCount(0);
            }
        };

        const updateAddress = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('deliveryInfo') || 'null');
                if (saved && saved.address) setDeliveryAddress(saved.address);
            } catch (e) { }
        };

        updateCart();
        updateAddress();

        window.addEventListener('cart-updated', updateCart);
        window.addEventListener('delivery-updated', updateAddress);
        const onStorage = (e) => {
            if (e && e.key === 'cart') updateCart();
            if (e && (e.key === 'deliveryInfo' || !e.key)) updateAddress();
        };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('cart-updated', updateCart);
            window.removeEventListener('delivery-updated', updateAddress);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    return (
        <>
            <header className="rm-app-header">
                <div className="rm-left-group">
                    <button
                        className="rm-left-btn"
                        aria-label="Back"
                        onClick={() => (onBack ? onBack() : navigate(-1))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="rm-address" onClick={() => setShowAddressModal(true)} style={{ cursor: 'pointer' }}>
                        <div className="rm-subtitle">Giao đến </div>
                        <div className="rm-address-line">
                            <span className="rm-address-text">{deliveryAddress}</span>
                            <svg className="rm-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="#ff7a18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rm-actions">
                    <button className="rm-icon-btn" aria-label="History" onClick={() => navigate('/history')} title="Lịch sử đơn hàng">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="rm-search-wrap display expanded">
                        <input
                            className="rm-search-input"
                            placeholder="Tìm món ăn, đồ uống..."
                            value={query || ''}
                            onChange={(e) => onQueryChange && onQueryChange(e.target.value)}
                        />
                    </div>

                    <button className="rm-icon-btn rm-cart" aria-label="Cart" onClick={() => navigate('/cart')}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6h15l-1.5 9h-12L6 6z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="10" cy="20" r="1" fill="#333" />
                            <circle cx="18" cy="20" r="1" fill="#333" />
                        </svg>
                        {localCartCount > 0 && <span className="rm-badge">{localCartCount}</span>}
                    </button>
                </div>
            </header>

            <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
        </>
    );
}