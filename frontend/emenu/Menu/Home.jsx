import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoLocationSharp, IoPartlySunnyOutline, IoPencilOutline } from 'react-icons/io5';
import { FaGift, FaCreditCard, FaUser, FaShoppingCart, FaStar, FaArrowRight } from 'react-icons/fa';
import '../styles/home-full.scss';
import Payment from './Payment';
import CallStaff from './CallStaff';
import LoginOtp from './LoginPhone';
import FeedbackCard from './Feedbackcard';
import LanguageSwitcher from './LanguageSwitcher';
import HERO from '../public/images/home.png';
export default function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showPayment, setShowPayment] = useState(false);
    const [showCallStaff, setShowCallStaff] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [name, setName] = useState(() => localStorage.getItem('customerName') || t('home.guestName'));
    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState(name);
    const inputRef = useRef(null);

    const [tableCode, setTableCode] = useState(() => localStorage.getItem('table_code') || localStorage.getItem('tableId') || '');
    const [tables, setTables] = useState([]);
    const [showTableSelect, setShowTableSelect] = useState(false);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        if (!showTableSelect) return;
        const handler = (e) => {
            if (!e.target.closest('.rm-hf-table')) setShowTableSelect(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showTableSelect]);

    // Load danh sách bàn từ API khi mở trang
    useEffect(() => {
        import('../config').then(({ API_BASE, apiFetch }) => {
            apiFetch(`${API_BASE}/api/v1/tables/?per_page=100`)
                .then((r) => r.json())
                .then((json) => {
                    const list = json?.data?.results || json?.data || json?.results || [];
                    if (Array.isArray(list) && list.length > 0)
                        setTables(list.filter((t) => t.status === 'available'));
                })
                .catch(() => { });
        });
    }, []);

    const selectTable = (tbl) => {
        const id = String(tbl.id);
        const display = tbl.table_number || tbl.name || id;
        setTableCode(display);
        try {
            localStorage.setItem('table_code', id);
            localStorage.setItem('tableId', id);
            localStorage.setItem('table_display', display);
        } catch (e) { }
        setShowTableSelect(false);
    };

    useEffect(() => {
        if (editing) {
            setTempName(name);
            setTimeout(() => inputRef.current?.focus?.(), 0);
        }
    }, [editing, name]);

    const saveName = () => {
        const v = (tempName || '').trim() || t('home.guestName');
        setName(v);
        try { localStorage.setItem('customerName', v); } catch (e) { }
        setEditing(false);
    };
    return (
        <div className="rm-home-full-root">
            <header className="rm-hf-header">
                <div className="rm-hf-header-inner">
                    <div className="rm-hf-left">
                        <h1 className="rm-hf-title">Mì KEY KÉP ĐỘ CR7</h1>
                        <div className="rm-hf-location">
                            <span className="rm-hf-icon"><IoLocationSharp /></span>
                            <p className="rm-hf-location-text">120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng</p>
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
                                {t('home.title')} <span className="rm-hf-blue">{name}</span>
                            </p>
                        )}
                        <button className="rm-hf-edit" onClick={() => setEditing(true)}><IoPencilOutline /></button>
                    </div>
                    <div className="rm-hf-table" style={{ position: 'relative' }}>
                        <p className="rm-hf-table-text">{t('home.subtitle')}</p>
                        <span
                            className="rm-hf-table-pill"
                            onClick={() => setShowTableSelect((v) => !v)}
                            title="Bấm để đổi bàn"
                        >
                            {tableCode || '---'}
                            <IoPencilOutline style={{ marginLeft: 4, fontSize: 12, opacity: 0.7 }} />
                        </span>
                        {showTableSelect && (
                            <div className="rm-hf-table-dropdown">
                                {tables.length === 0 ? (
                                    <div className="rm-hf-table-dropdown-empty">Đang tải...</div>
                                ) : (
                                    tables.map((tbl) => (
                                        <div
                                            key={tbl.id}
                                            className={`rm-hf-table-dropdown-item ${String(tbl.id) === localStorage.getItem('table_code') ? 'active' : ''}`}
                                            onClick={() => selectTable(tbl)}
                                        >
                                            {tbl.table_number || tbl.name || `Bàn ${tbl.id}`}
                                            {tbl.status && <span className="rm-hf-table-status">{tbl.status}</span>}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rm-hf-phone-btn">
                    <button className="rm-hf-phone" tabIndex={0} onClick={() => setShowLogin(true)}>
                        <div className="rm-hf-phone-left"><FaGift /></div>
                        <div className="rm-hf-phone-label">{t('home.enterPhone')}</div>
                        <div className="rm-hf-phone-chevron">›</div>
                    </button>
                </div>

                <div className="rm-hf-features">
                    <div className="rm-hf-feature" role="button" tabIndex={0} onClick={() => setShowPayment(true)}>{t('payment.title')}
                        <div className="rm-hf-feature-ico"><FaCreditCard /></div>
                    </div>
                    <div className="rm-hf-feature" role="button" tabIndex={0} onClick={() => setShowCallStaff(true)}>{t('callstaff.title')}
                        <div className="rm-hf-feature-ico"><FaUser /></div>
                    </div>
                    <div className="rm-hf-feature" role="button" tabIndex={0} onClick={() => navigate('/history')}>{t('history.title')}
                        <div className="rm-hf-stars"><FaShoppingCart /></div>
                    </div>
                    <div className="rm-hf-feature" role="button" tabIndex={0} onClick={() => { setShowFeedback(true); }}>{t('home.feedback')}
                        <div className="rm-hf-stars flex"><FaStar /><FaStar /><FaStar /></div>
                    </div>
                </div>

                <div className="rm-hf-cta">
                    <button className="rm-hf-cta-btn" onClick={() => navigate('/menu')}>
                        <span className="rm-hf-cta-text">{t('home.viewMenu')}</span>
                        <span className="rm-hf-cta-icon"><FaArrowRight /></span>
                    </button>
                </div>
            </div>
            <CallStaff open={showCallStaff} onClose={() => setShowCallStaff(false)} onSubmit={() => { setShowCallStaff(false); }} />
            <LoginOtp
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
            />
            <Payment open={showPayment} onClose={() => setShowPayment(false)} onSubmit={() => { setShowPayment(false); }} />
            {showFeedback && (
                <FeedbackCard
                    orderId={(() => {
                        try {
                            const last = JSON.parse(localStorage.getItem('lastOrder') || 'null');
                            return last && last.id ? last.id : 'N/A';
                        } catch (e) { return 'N/A'; }
                    })()}
                    onClose={() => setShowFeedback(false)}
                    onSubmit={() => { setShowFeedback(false); }}
                />
            )}
        </div>
    );
}