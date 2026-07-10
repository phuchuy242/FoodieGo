import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE, apiFetch } from '../config';
import '../styles/login-phone.scss';

export default function LoginOtp({ isOpen = true, onClose = () => {} }) {
    const { t } = useTranslation();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'profile'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Login fields
    const [identifier, setIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register fields
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

    // Logged in user state
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        setError('');
        setSuccessMsg('');
        const token = localStorage.getItem('accessToken');
        const userRaw = localStorage.getItem('user');
        if (token) {
            setMode('profile');
            try {
                if (userRaw) setCurrentUser(JSON.parse(userRaw));
            } catch (e) {
                setCurrentUser(null);
            }
        } else {
            setMode('login');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const syncUserToStorage = (token, refresh, userObj) => {
        if (token) localStorage.setItem('accessToken', token);
        if (refresh) localStorage.setItem('refreshToken', refresh);
        if (userObj) {
            localStorage.setItem('user', JSON.stringify(userObj));
            const fullName = (userObj.first_name || userObj.last_name)
                ? `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()
                : (userObj.user_name || userObj.email || userObj.phone_number || 'Khách hàng');
            localStorage.setItem('customerName', fullName);
            if (userObj.phone_number) localStorage.setItem('customerPhone', userObj.phone_number);
            if (userObj.email) localStorage.setItem('customerEmail', userObj.email);
            setCurrentUser(userObj);
        }
        window.dispatchEvent(new Event('auth-updated'));
        window.dispatchEvent(new Event('storage'));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!identifier.trim() || !loginPassword) {
            setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await apiFetch(`${API_BASE}/api/v1/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: identifier.trim(),
                    password: loginPassword,
                }),
            });
            const json = await res.json();
            if (!res.ok || json.status === 'error') {
                const msg = json?.msg || json?.message || json?.detail || 'Đăng nhập thất bại. Kiểm tra lại thông tin.';
                throw new Error(msg);
            }

            const token = json.data?.access_token || json.data?.access || json.access_token || json.access;
            const refresh = json.data?.refresh_token || json.data?.refresh || json.refresh_token || json.refresh;
            const usr = json.data?.user || json.data || json.user || {};

            if (!token) throw new Error('Không nhận được token từ máy chủ.');

            syncUserToStorage(token, refresh, usr);
            setSuccessMsg('Đăng nhập thành công!');
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi đăng nhập.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email.trim() || !userName.trim() || !phoneNumber.trim() || !regPassword) {
            setError('Vui lòng điền các trường bắt buộc (Email, Username, SĐT, Mật khẩu).');
            return;
        }
        if (regPassword !== regPasswordConfirm) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await apiFetch(`${API_BASE}/api/v1/users/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    username: userName.trim(),
                    phone_number: phoneNumber.trim(),
                    password: regPassword,
                    password_confirm: regPasswordConfirm,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                }),
            });
            const json = await res.json();
            if (!res.ok || json.status === 'error') {
                let msg = json?.msg || json?.message || 'Đăng ký tài khoản thất bại.';
                if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data) && !json.data.access) {
                    const errKeys = Object.keys(json.data);
                    if (errKeys.length > 0) {
                        const firstErr = json.data[errKeys[0]];
                        msg = Array.isArray(firstErr) ? `${errKeys[0]}: ${firstErr[0]}` : String(firstErr);
                    }
                } else if (json?.errors) {
                    const errKeys = Object.keys(json.errors);
                    if (errKeys.length > 0) {
                        const firstErr = json.errors[errKeys[0]];
                        msg = Array.isArray(firstErr) ? `${errKeys[0]}: ${firstErr[0]}` : String(firstErr);
                    }
                }
                throw new Error(msg);
            }

            const token = json.data?.access_token || json.data?.access || json.access_token || json.access;
            const refresh = json.data?.refresh_token || json.data?.refresh || json.refresh_token || json.refresh;
            const usr = json.data?.user || json.data || json.user || {
                email, username: userName, phone_number: phoneNumber, first_name: firstName, last_name: lastName
            };

            if (token) {
                syncUserToStorage(token, refresh, usr);
                setSuccessMsg('Đăng ký tài khoản và đăng nhập thành công!');
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
                setMode('login');
                setIdentifier(email);
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi đăng ký.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const refresh = localStorage.getItem('refreshToken');
            if (token && refresh) {
                await apiFetch(`${API_BASE}/api/v1/users/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ refresh_token: refresh }),
                }).catch(() => {});
            }
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-updated'));
            window.dispatchEvent(new Event('storage'));
            setCurrentUser(null);
            setMode('login');
            setIsLoading(false);
            onClose();
        }
    };

    const getInitials = () => {
        const name = localStorage.getItem('customerName') || 'User';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="rm-auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="rm-auth-card">
                <button className="rm-auth-close-btn" onClick={onClose} aria-label="Close">&times;</button>

                {mode === 'profile' ? (
                    <div className="rm-auth-step-content">
                        <div className="rm-auth-header">
                            <div className="rm-auth-avatar-circle">{getInitials()}</div>
                            <h2 className="rm-auth-title">Tài khoản của bạn</h2>
                            <p className="rm-auth-subtitle">Quản lý thông tin và đơn hàng Online</p>
                        </div>

                        <div className="rm-auth-profile-box">
                            <div className="rm-auth-profile-row">
                                <span className="rm-auth-profile-label">Họ và tên:</span>
                                <span className="rm-auth-profile-val">
                                    {localStorage.getItem('customerName') || currentUser?.username || currentUser?.user_name || 'Khách hàng'}
                                </span>
                            </div>
                            {(currentUser?.email || localStorage.getItem('customerEmail')) && (
                                <div className="rm-auth-profile-row">
                                    <span className="rm-auth-profile-label">Email:</span>
                                    <span className="rm-auth-profile-val">
                                        {currentUser?.email || localStorage.getItem('customerEmail')}
                                    </span>
                                </div>
                            )}
                            {(currentUser?.phone_number || localStorage.getItem('customerPhone')) && (
                                <div className="rm-auth-profile-row">
                                    <span className="rm-auth-profile-label">Số điện thoại:</span>
                                    <span className="rm-auth-profile-val">
                                        {currentUser?.phone_number || localStorage.getItem('customerPhone')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            className="rm-auth-btn-secondary"
                            onClick={handleLogout}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng xuất tài khoản'}
                        </button>
                    </div>
                ) : (
                    <div className="rm-auth-step-content">
                        <div className="rm-auth-tabs">
                            <button
                                type="button"
                                className={`rm-auth-tab ${mode === 'login' ? 'active' : ''}`}
                                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                            >
                                Đăng Nhập
                            </button>
                            <button
                                type="button"
                                className={`rm-auth-tab ${mode === 'register' ? 'active' : ''}`}
                                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                            >
                                Đăng Ký Mới
                            </button>
                        </div>

                        {error && <div className="rm-auth-error">{error}</div>}
                        {successMsg && <div className="rm-auth-success">{successMsg}</div>}

                        {mode === 'login' ? (
                            <form onSubmit={handleLogin}>
                                <div className="rm-auth-input-group">
                                    <label className="rm-auth-label">Email / Username / SĐT</label>
                                    <input
                                        type="text"
                                        className="rm-auth-input"
                                        placeholder="user@example.com hoặc SĐT"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="rm-auth-input-group">
                                    <label className="rm-auth-label">Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="rm-auth-input"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rm-auth-btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister}>
                                <div className="rm-auth-input-group">
                                    <label className="rm-auth-label">Email <span style={{color: 'red'}}>*</span></label>
                                    <input
                                        type="email"
                                        className="rm-auth-input"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="rm-auth-row">
                                    <div className="rm-auth-input-group">
                                        <label className="rm-auth-label">Username <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="text"
                                            className="rm-auth-input"
                                            placeholder="johndoe"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="rm-auth-input-group">
                                        <label className="rm-auth-label">Số điện thoại <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="tel"
                                            className="rm-auth-input"
                                            placeholder="0912xxx..."
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="rm-auth-row">
                                    <div className="rm-auth-input-group">
                                        <label className="rm-auth-label">Họ (Last Name)</label>
                                        <input
                                            type="text"
                                            className="rm-auth-input"
                                            placeholder="Nguyễn"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                    <div className="rm-auth-input-group">
                                        <label className="rm-auth-label">Tên (First Name)</label>
                                        <input
                                            type="text"
                                            className="rm-auth-input"
                                            placeholder="Văn A"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="rm-auth-row">
                                    <div className="rm-auth-input-group">
                                        <label className="rm-auth-label">Mật khẩu <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="password"
                                            className="rm-auth-input"
                                            placeholder="••••••••"
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="rm-auth-input-group">
                                        <label className="rm-auth-label">Xác nhận <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="password"
                                            className="rm-auth-input"
                                            placeholder="••••••••"
                                            value={regPasswordConfirm}
                                            onChange={(e) => setRegPasswordConfirm(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="rm-auth-btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}