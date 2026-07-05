import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoWaterOutline, IoRestaurantOutline, IoBookOutline } from 'react-icons/io5';
import { GiBroom } from 'react-icons/gi';
import { FiMoreHorizontal, FiCheck } from 'react-icons/fi';
import '../styles/call-staff.scss';
import { API_BASE, apiFetch } from '../config';

// Map option id → call_type của API
const CALL_TYPE_MAP = {
    water: 'water',
    cutlery: 'utensils',
    clean: 'clean_table',
    menu: 'consultation',
    others: 'other',
};

export default function CallStaff({ open = true, onClose = () => { }, onSubmit = (data) => { } }) {
    const { t } = useTranslation();
    const [selectedOption, setSelectedOption] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const quickOptions = [
        { id: 'water', icon: <IoWaterOutline />, label: t('callstaff.addWater') },
        { id: 'cutlery', icon: <IoRestaurantOutline />, label: t('callstaff.addCutlery') },
        { id: 'clean', icon: <GiBroom />, label: t('callstaff.cleanTable') },
        { id: 'menu', icon: <IoBookOutline />, label: t('callstaff.menuAdvice') },
        { id: 'others', icon: <FiMoreHorizontal />, label: t('callstaff.others') },
    ];

    if (!open) return null;

    const handleSubmit = async () => {
        if (!selectedOption) return;
        const tableId = Number(localStorage.getItem('table_code') || localStorage.getItem('tableId') || '1');
        const call_type = CALL_TYPE_MAP[selectedOption] || 'other';

        const payload = {
            table: tableId,
            call_type,
            notes: note.trim(),
        };

        try {
            setLoading(true);
            setError('');
            const res = await apiFetch(`${API_BASE}/api/v1/staff-calls/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || json?.msg || 'Gọi nhân viên thất bại');

            setSuccess(true);
            onSubmit(json?.data || payload);
            setTimeout(() => {
                setSuccess(false);
                setSelectedOption('');
                setNote('');
                onClose();
            }, 1500);
        } catch (e) {
            setError(e.message || 'Không thể gọi nhân viên. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rm-cs-overlay" role="dialog" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="rm-cs-modal">
                <div className="rm-cs-grip-line" />

                <div className="rm-cs-header">
                    <h2 className="rm-cs-title">{t('callstaff.title')}</h2>
                    <p className="rm-cs-subtitle">{t('callstaff.selectOption')}</p>
                </div>

                <div className="rm-cs-grid">
                    {quickOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`rm-cs-option ${selectedOption === option.id ? 'active' : ''}`}
                            onClick={() => setSelectedOption(option.id)}
                        >
                            <span className="rm-cs-icon">{option.icon}</span>
                            <span className="rm-cs-label">{option.label}</span>
                        </div>
                    ))}
                </div>

                <div className="rm-cs-input-group">
                    <label className="rm-cs-label-text">{t('callstaff.note')}:</label>
                    <textarea
                        className="rm-cs-textarea"
                        placeholder={t('callstaff.notePlaceholder')}
                        rows="3"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {error && <p style={{ color: '#e53e3e', fontSize: 13, margin: '0 0 8px', textAlign: 'center' }}>{error}</p>}

                <div className="rm-cs-actions">
                    <button className="rm-cs-btn rm-cs-btn-close" onClick={onClose} disabled={loading}>
                        {t('callstaff.cancel')}
                    </button>
                    <button
                        className="rm-cs-btn rm-cs-btn-call"
                        onClick={handleSubmit}
                        disabled={loading || !selectedOption || success}
                    >
                        {success
                            ? <><FiCheck style={{ marginRight: 4 }} />{t('callstaff.sent') || 'Đã gửi!'}</>
                            : loading
                                ? (t('callstaff.sending') || 'Đang gửi…')
                                : t('callstaff.title')}
                    </button>
                </div>
            </div>
        </div>
    );
}