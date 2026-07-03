import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import '../styles/feedbackcard.scss';

const TAGS_DATA = [
    { id: 1, label: 'pleasant_staff' },
    { id: 2, label: 'fast_delivery' },
    { id: 3, label: 'delicious_food' },
    { id: 4, label: 'nice_presentation' },
];

export default function FeedbackCard({ orderId = '8829-21', onSubmit, onClose }) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [comment, setComment] = useState('');

    const handleRatingMove = (e, starIndex) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - left;

        const isHalf = clickX < width / 2;
        const value = isHalf ? starIndex - 0.5 : starIndex;

        setHoverRating(value);
    };

    const handleRatingClick = (e, starIndex) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? (left + width);
        const isHalf = (clientX - left) < width / 2;
        const value = isHalf ? starIndex - 0.5 : starIndex;
        setRating(value);
        setHoverRating(0);
    };

    const toggleTag = (tagId) => {
        setSelectedTags((prev) => {
            if (prev.includes(tagId)) return prev.filter((id) => id !== tagId);
            return [...prev, tagId];
        });
    };

    const handleSubmit = () => {
        const customerName = (() => {
            try { return localStorage.getItem('customerName') || t('feedback.anonymousCustomer'); } catch (e) { return t('feedback.guestCustomer'); }
        })();

        const feedbackData = {
            orderId,
            customerName,
            rating, // Giá trị này giờ có thể là 4.5
            tags: selectedTags,
            comment,
        };

        if (onSubmit) {
            onSubmit(feedbackData);
        } else {
            alert(t('feedback.thankYou', { rating }));
        }
    };

    // Hàm tính toán phần trăm tô màu cho từng ngôi sao
    const getFillPercent = (starIndex, currentRating) => {
        if (currentRating >= starIndex) return 100;
        if (currentRating >= starIndex - 0.5) return 50;
        return 0;
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="rm-feedback-container" role="dialog" aria-modal="true" onClick={() => onClose && onClose()}>
            <div className="rm-feedback-card" onClick={(e) => e.stopPropagation()}>
                {onClose && (
                    <button className="rm-feedback-close" onClick={onClose} aria-label="Close">×</button>
                )}

                <div className="rm-card-header1 row2">
                    <div><h2>{t('feedback.title')}</h2></div>
                    <div><p>{t('feedback.orderInfo', { orderId })}</p></div>
                </div>

                {/* Rating Stars */}
                <div className="rm-rating-section">
                    <label className="rm-section-label">
                        {t('feedback.mealQuestion')}
                        {/* Hiển thị số điểm bên cạnh để user dễ nhìn */}
                        {displayRating > 0 && <span style={{ marginLeft: 8, color: '#faaf00', fontWeight: 'bold' }}>({displayRating})</span>}
                    </label>
                    <div className="rm-stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="rm-star-btn"
                                onClick={(e) => handleRatingClick(e, star)}
                                onMouseMove={(e) => handleRatingMove(e, star)}
                                onMouseLeave={() => setHoverRating(0)}
                                type="button"
                                style={{ padding: '0 2px' }}
                            >
                                <StarIcon
                                    percent={getFillPercent(star, displayRating)}
                                    id={`star-${star}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rm-tags-section">
                    <label className="rm-section-label">{t('feedback.bestPart')}</label>
                    <div className="rm-tags-wrapper">
                        {TAGS_DATA.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                                <div
                                    key={tag.id}
                                    className={`rm-tag-chip ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {isSelected && <span><FaCheck /></span>}
                                    {t(`feedback.${tag.label}`)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rm-comment-section">
                    <label className="rm-section-label" style={{ textAlign: 'left' }}>{t('feedback.additionalComment')}</label>
                    <textarea
                        className="rm-comment-input"
                        placeholder={t('feedback.comment')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="rm-card-footer ms-3 m-0">
                    <button className="rm-btn-skip" type="button" onClick={() => { if (onClose) onClose(); }}>
                        {t('feedback.cancel')}
                    </button>
                    <button
                        className="rm-btn-submit"
                        onClick={handleSubmit}
                        disabled={rating === 0}
                    >
                        {t('feedback.submit')}
                        <ArrowIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- ICON MỚI: Dùng SVG LinearGradient để tô màu ---
const StarIcon = ({ percent, id }) => {
    return (
        <svg
            className="rm-star-icon"
            viewBox="0 0 24 24"
            width="42"
            height="42"
        >
            <defs>
                <linearGradient id={`grad-${id}`}>
                    {/* Phần tô màu vàng */}
                    <stop offset={`${percent}%`} stopColor="#FFC107" />
                    {/* Phần màu xám (phần còn lại) */}
                    <stop offset={`${percent}%`} stopColor="#dee2e6" />
                </linearGradient>
            </defs>
            <path
                fill={`url(#grad-${id})`} // Tham chiếu đến gradient ở trên
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
        </svg>
    );
};

const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);