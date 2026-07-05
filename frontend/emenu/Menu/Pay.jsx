import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Payment from './Payment';

/**
 * Pay – standalone payment page reachable via /pay.
 * Wraps the Payment modal within a full-screen layout.
 */
export default function Pay() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [done, setDone] = useState(false);

    if (done) {
        return (
            <div className="rm-pay-page">
                <div className="rm-pay-done">
                    <div className="rm-pay-done-icon">✓</div>
                    <p>{t('payment.processing')}</p>
                    <button className="rm-pay-home-btn" onClick={() => navigate('/')}>
                        {t('cart.backHome')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Payment
            open
            onClose={() => navigate(-1)}
            onSubmit={() => setDone(true)}
        />
    );
}
