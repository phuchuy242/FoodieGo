import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.scss';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ address = 'Home • 123 Main St', onBack, query, onQueryChange }) {
    const navigate = useNavigate();

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
        const update = () => {
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

        update();
        window.addEventListener('cart-updated', update);
        const onStorage = (e) => { if (e && e.key === 'cart') update(); };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('cart-updated', update);
            window.removeEventListener('storage', onStorage);
        };
    }, []);
    return (
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
                <div className="rm-address">
                    <div className="rm-subtitle">Delivery to</div>
                    <div className="rm-address-line">
                        <span className="rm-address-text">{address}</span>
                        <svg className="rm-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="#ff7a18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rm-actions">

                <button className="rm-icon-btn" aria-label="Favorites" onClick={() => navigate('/history')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.8 7.3c0 5.1-8.8 11.7-8.8 11.7S3.2 12.4 3.2 7.3C3.2 5.1 4.9 3.4 7.1 3.4c1.2 0 2.4.6 3 1.5.6-.9 1.8-1.5 3-1.5 2.2 0 3.9 1.7 3.9 3.9z" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </button>



                <div className="rm-search-wrap display expanded">
                    <input
                        className="rm-search-input"
                        placeholder="Tìm món, mô tả..."
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
                <LanguageSwitcher />

            </div>

        </header>
    );
}