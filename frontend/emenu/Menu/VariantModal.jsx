import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * VariantModal – shows cart lines for a single product so the user can
 * adjust quantity, edit note, or delete individual variants.
 *
 * Props:
 *   open          {boolean}
 *   onClose       {() => void}
 *   productName   {string}
 *   variants      {Array}   – cart lines matching this product
 *   onUpdateQty   {(item, delta) => void}
 *   onUpdateNote  {(item, newNote) => void}
 *   onAddStandard {() => void}
 *   onRemoveVariant {(item) => void}
 */
export default function VariantModal({
    open = false,
    onClose = () => { },
    productName = '',
    variants = [],
    onUpdateQty = () => { },
    onUpdateNote = () => { },
    onAddStandard = () => { },
    onRemoveVariant = () => { },
}) {
    const { t } = useTranslation();

    if (!open) return null;

    return (
        <div
            className="rm-variant-overlay"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="rm-variant-modal">
                <div className="rm-variant-grip" />

                <div className="rm-variant-header">
                    <h3>{t('variantModal.title')}</h3>
                    <button className="rm-variant-close" onClick={onClose}>×</button>
                </div>

                <div className="rm-variant-product-name">{productName}</div>

                {variants.length === 0 ? (
                    <p className="rm-variant-empty">{t('variantModal.noItems')}</p>
                ) : (
                    <ul className="rm-variant-list">
                        {variants.map((item, idx) => (
                            <li key={idx} className="rm-variant-item">
                                <div className="rm-variant-item-top">
                                    <div className="rm-variant-item-info">
                                        {item.size_display && (
                                            <span className="rm-variant-size">{item.size_display}</span>
                                        )}
                                        {item.extras && item.extras.length > 0 && (
                                            <span className="rm-variant-extras">
                                                + {item.extras.map((e) => e.name).join(', ')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="rm-variant-qty-row">
                                        <button
                                            className="rm-vqty-btn"
                                            onClick={() => onUpdateQty(item, -1)}
                                        >−</button>
                                        <span className="rm-vqty-val">{item.quantity}</span>
                                        <button
                                            className="rm-vqty-btn"
                                            onClick={() => onUpdateQty(item, 1)}
                                        >+</button>
                                        <button
                                            className="rm-vqty-delete"
                                            onClick={() => onRemoveVariant(item)}
                                            title={t('variantModal.delete')}
                                        >🗑</button>
                                    </div>
                                </div>

                                <div className="rm-variant-note-row">
                                    <label className="rm-variant-note-label">{t('variantModal.note')}:</label>
                                    <input
                                        className="rm-variant-note-input"
                                        placeholder={t('variantModal.addNote')}
                                        value={item.note || ''}
                                        onChange={(e) => onUpdateNote(item, e.target.value)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="rm-variant-actions">
                    <button className="rm-variant-add-btn" onClick={onAddStandard}>
                        + {t('variantModal.add')}
                    </button>
                    <button className="rm-variant-ok-btn" onClick={onClose}>
                        {t('variantModal.ok')}
                    </button>
                </div>
            </div>
        </div>
    );
}
