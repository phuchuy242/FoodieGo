import React from 'react';
import { useTranslation } from 'react-i18next';

function formatPrice(n) {
    return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}

/**
 * CartSummary – sticky bottom bar on the Menu page (mobile).
 * Props:
 *   count   {number}
 *   total   {number}
 *   onClick {() => void}
 */
export default function CartSummary({ count = 0, total = 0, onClick = () => { } }) {
    const { t } = useTranslation();

    if (count <= 0) return null;

    return (
        <button className="rm-cart-summary" onClick={onClick} aria-label="View cart">
            <span className="rm-cart-left">
                {count} {t('cartSummary.items')}
            </span>
            <span className="rm-cart-center">{t('cartSummary.viewCart')}</span>
            <span className="rm-cart-right">{formatPrice(total)}</span>
        </button>
    );
}
