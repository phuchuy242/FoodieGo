import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const current = i18n.language?.startsWith('vi') ? 'vi' : 'en';

    const toggle = () => {
        const next = current === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(next);
        try { localStorage.setItem('lang', next); } catch { /* ignore */ }
    };

    return (
        <button
            className="rm-lang-btn"
            onClick={toggle}
            aria-label="Switch language"
            title={current === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
            {current === 'vi' ? '🇻🇳' : '🇬🇧'}
        </button>
    );
}
