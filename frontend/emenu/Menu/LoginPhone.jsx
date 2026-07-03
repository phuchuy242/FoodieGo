import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/login-phone.scss'; // File CSS riêng biệt

export default function LoginOtp({ isOpen = true, onClose = () => { } }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Logic đếm ngược cho nút Gửi lại
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    if (!isOpen) return null;

    // Xử lý khi bấm "Lấy mã OTP"
    const handleSendPhone = () => {
        if (!phone.trim()) return;

        setIsLoading(true);
        // Giả lập gọi API mất 1 giây
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
            setCountdown(30); // Đếm ngược 30s
        }, 1000);
    };

    // Xử lý khi bấm "Gửi lại mã"
    const handleResend = () => {
        if (countdown > 0) return;
        setCountdown(30);
    };

    // Xử lý xác thực OTP
    const handleVerify = () => {
        alert(`Đang đăng nhập với SĐT: ${phone} và OTP: ${otp}`);
        // Logic verify API ở đây
    };

    return (
        <div className="rm-auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="rm-auth-card">
                <button className="rm-auth-close-btn" onClick={onClose}>&times;</button>

                {/* STEP 1: NHẬP SỐ ĐIỆN THOẠI */}
                {step === 1 && (
                    <div className="rm-auth-step-content">
                        <div className="rm-auth-header">
                            <h2 className="rm-auth-title">{t('login.title')}</h2>
                            <p className="rm-auth-subtitle">{t('login.enterPhone')}</p>
                        </div>

                        <div className="rm-auth-input-group">
                            <label className="rm-auth-label">{t('login.phone')}</label>
                            <input
                                type="tel"
                                className="rm-auth-input"
                                placeholder="0912 xxx xxx"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <button
                            className="rm-auth-btn-primary"
                            onClick={handleSendPhone}
                            disabled={isLoading || !phone}
                        >
                            {isLoading ? t('login.sending') : t('login.getOtp')}
                        </button>
                    </div>
                )}

                {/* STEP 2: NHẬP OTP */}
                {step === 2 && (
                    <div className="rm-auth-step-content">
                        <div className="rm-auth-header">
                            <h2 className="rm-auth-title">{t('login.otp')}</h2>
                            <p className="rm-auth-subtitle">
                                {t('login.enterPhone')} <b>{phone}</b> <br />
                                <span className="rm-auth-link" onClick={() => setStep(1)}>{t('login.rephone')}</span>
                            </p>
                        </div>

                        <div className="rm-auth-input-group">
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="rm-auth-input rm-auth-input-otp"
                                placeholder="• • • • • •"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtp(value);
                                }}
                                autoFocus
                            />
                        </div>

                        <button
                            className="rm-auth-btn-primary"
                            onClick={handleVerify}
                            disabled={otp.length < 6}
                        >
                            {t('login.verify')}
                        </button>

                        <div className="rm-auth-resend-wrapper">
                            <p className="rm-auth-text-sm">{t('login.sendAgain')}</p>
                            <button
                                className={`rm-auth-btn-resend ${countdown > 0 ? 'disabled' : ''}`}
                                onClick={handleResend}
                                disabled={countdown > 0}
                            >
                                {countdown > 0 ? `${t('login.resend')} ${countdown}s` : t('login.resend')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}