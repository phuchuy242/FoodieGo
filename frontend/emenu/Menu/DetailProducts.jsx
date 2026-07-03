import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../styles/detail.scss";
import { API_BASE, apiFetch } from '../config';
import { X } from "feather-icons-react";

function formatVND(amount) {
    const n = Number(amount || 0);
    return Math.round(n).toLocaleString("vi-VN") + "đ";
}

const SIZE_ORDER = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };

export default function DetailProducts({
    productId: propId,
    product: propProduct,
    setCartCount,
    setCartTotal,
}) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const editingItem = location?.state?.cartItem;
    const isEditing = editingItem && String(editingItem.id) === String(propId ?? params?.id);
    const [quantity, setQuantity] = useState(() => {
        return isEditing ? (Number(editingItem.quantity) || 1) : 1;
    });

    const [note, setNote] = useState(() => {
        return isEditing ? (editingItem.note || '') : '';
    });

    const [fetchedProduct, setFetchedProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(false);

    const idToUse = propId ?? params?.id;

    // Fetch product detail from API
    useEffect(() => {
        if (propProduct) { setFetchedProduct(propProduct); return; }
        if (!idToUse) return;
        let cancelled = false;
        setLoading(true);
        apiFetch(`${API_BASE}/api/v1/menu/products/${idToUse}/`)
            .then((r) => r.json())
            .then((json) => {
                if (cancelled) return;
                if (json.status && json.data) setFetchedProduct(json.data);
            })
            .catch((e) => console.error('product fetch error', e))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [propProduct, idToUse]);

    // Fetch variants for this product
    useEffect(() => {
        if (!idToUse) return;
        let cancelled = false;
        apiFetch(`${API_BASE}/api/v1/menu/variants/?page=1&per_page=100`)
            .then((r) => r.json())
            .then((json) => {
                if (cancelled) return;
                if (json.status && Array.isArray(json.data)) {
                    const filtered = json.data
                        .filter((v) => v.is_active && String(v.product) === String(idToUse))
                        .sort((a, b) => (SIZE_ORDER[a.size] ?? 99) - (SIZE_ORDER[b.size] ?? 99));
                    setVariants(filtered);
                    // Pre-select editing variant or smallest
                    if (filtered.length > 0) {
                        const preselect = isEditing && editingItem?.variant_id
                            ? filtered.find((v) => String(v.id) === String(editingItem.variant_id)) || filtered[0]
                            : filtered[0];
                        setSelectedVariant(preselect);
                    }
                }
            })
            .catch((e) => console.error('variants fetch error', e));
        return () => { cancelled = true; };
    }, [idToUse]);

    const product = propProduct || fetchedProduct;

    useEffect(() => {
        if (!product) return;
        if (!isEditing) {
            setQuantity(1);
            setNote('');
        }
    }, [product?.id]);

    const activePrice = selectedVariant
        ? Math.round(parseFloat(selectedVariant.price))
        : Number(product?.price || 0);

    const total = activePrice * Math.max(1, Number(quantity) || 0);

    const handleAddToCart = () => {
        if (!product) return;

        const finalQty = Math.max(1, Number(quantity) || 1);
        const subtotal = activePrice * finalQty;

        try {
            const existing = JSON.parse(localStorage.getItem("cart") || "[]");
            const editIndex = Number.isFinite(Number(location?.state?.cartIndex)) ? Number(location.state.cartIndex) : -1;

            const newItem = {
                id: product.id,
                name: product.name,
                price: activePrice,
                note: note,
                extras: [],
                quantity: finalQty,
                subtotal,
                image: product.image_url || product.image || '',
            };
            if (selectedVariant) {
                newItem.variant_id = selectedVariant.id;
                newItem.size = selectedVariant.size;
                newItem.size_display = selectedVariant.size_display;
            }

            if (editIndex >= 0 && existing[editIndex]) {
                // UPDATE món cũ
                const prev = existing[editIndex];
                const prevQty = Number(prev.quantity) || 0;
                const prevSub = Number(prev.subtotal || prev.price) || 0;

                existing[editIndex] = newItem;

                localStorage.setItem("cart", JSON.stringify(existing));
                try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }

                // Cập nhật state global nếu có
                if (typeof setCartCount === "function") setCartCount((p) => (Number(p) || 0) - prevQty + finalQty);
                if (typeof setCartTotal === "function") setCartTotal((p) => (Number(p) || 0) - prevSub + subtotal);
            } else {
                // THÊM MỚI: nếu đã có mục tương tự (id+extras+note) thì gộp số lượng
                const matchIdx = existing.findIndex((it) =>
                    it.id === newItem.id &&
                    (selectedVariant ? String(it.variant_id) === String(selectedVariant.id) : !it.variant_id) &&
                    JSON.stringify(it.extras || []) === JSON.stringify(newItem.extras || []) &&
                    (it.note || '') === (newItem.note || '')
                );
                if (matchIdx >= 0) {
                    const prevQty = Number(existing[matchIdx].quantity) || 0;
                    existing[matchIdx].quantity = prevQty + finalQty;
                    existing[matchIdx].subtotal = (Number(existing[matchIdx].subtotal || 0) + subtotal);
                    localStorage.setItem("cart", JSON.stringify(existing));
                    if (typeof setCartCount === "function") setCartCount((p) => (Number(p) || 0) + finalQty);
                    if (typeof setCartTotal === "function") setCartTotal((p) => (Number(p) || 0) + subtotal);
                } else {
                    existing.push(newItem);
                    localStorage.setItem("cart", JSON.stringify(existing));
                    if (typeof setCartCount === "function") setCartCount((p) => (Number(p) || 0) + finalQty);
                    if (typeof setCartTotal === "function") setCartTotal((p) => (Number(p) || 0) + subtotal);
                }
                try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
            }
        } catch (err) {
            console.error("Unable to save cart", err);
        }

        navigate(-1);
    };

    if (loading) {
        return <div className="rm-detail-not-found">Đang tải sản phẩm…</div>;
    }

    if (!product) {
        return <div className="rm-detail-not-found">Sản phẩm không tìm thấy.</div>;
    }

    return (
        <div className="rm-detail-page">


            <div className="rm-detail-inner">
                <div className="rm-sah3112">
                    <button onClick={() => navigate(-1)} className="rm-buttonback">
                        <X size={18} />
                    </button>
                </div>
                {/* Hero Image */}
                <div className="rm-detail-hero">
                    <div className="rm-detail-hero__card">
                        <img
                            alt={product.name}
                            className="rm-detail-hero__img"
                            src={product.image_url || product.image || ''}
                            onError={(e) => { e.currentTarget.src = ""; }}
                        />

                    </div>
                </div>

                {/* Info */}
                <div className="rm-detail-head">
                    <div className="rm-detail-head__row">
                        <h1 className="rm-detail-title">{product.name}</h1>
                        <span className="rm-detail-price">{Math.round(activePrice).toLocaleString("vi-VN")}đ</span>
                    </div>
                    <p className="rm-detail-desc">{product.description}</p>
                </div>

                <div className="rm-detail-divider" />

                {/* Size Selector */}
                {variants.length > 0 && (
                    <section className="rm-detail-section">
                        <div className="rm-detail-section__head">
                            <h2 className="rm-detail-section__title">{t('detailProducts.selectVariant')}</h2>
                            <span className="rm-detail-pill rm-detail-pill--required">Bắt buộc</span>
                        </div>
                        <div className="rm-size-list">
                            {variants.map((v) => (
                                <label
                                    key={v.id}
                                    className={`rm-size-item${selectedVariant?.id === v.id ? ' rm-size-item--active' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="size"
                                        checked={selectedVariant?.id === v.id}
                                        onChange={() => setSelectedVariant(v)}
                                        className="rm-size-item__radio"
                                    />
                                    <span className="rm-size-item__label">{v.size_display}</span>
                                    <span className="rm-size-item__price">{Math.round(parseFloat(v.price)).toLocaleString('vi-VN')}đ</span>
                                </label>
                            ))}
                        </div>
                    </section>
                )}

                {/* Note Input */}
                <section className="rm-detail-section rm-detail-section--note">
                    <div className="rm-detail-section__head">
                        <h2 className="rm-detail-section__title">{t('detailProducts.note')}</h2>
                        <span className="rm-detail-pill rm-detail-pill--muted">{t('variantModal.addNote')}</span>
                    </div>
                    <textarea
                        className="rm-detail-textarea"
                        placeholder={t('detailProducts.note')}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </section>

                <div className="rm-detail-bottomSpace" />
            </div>

            {/* Bottom Bar with Input Quantity */}
            <div className="rm-detail-bottom">
                <div className="rm-detail-qty">
                    <button
                        onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                        className="rm-qty-btn rm-qty-btn--minus"
                        type="button"
                        aria-label="Decrease"
                    >
                        <span className="material-icons-outlined">remove</span>
                    </button>

                    <input
                        className="rm-qty-val rm-qty-input w-25"
                        type="number"
                        value={quantity}
                        min="1"
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                                setQuantity('');
                            } else {
                                const parsed = parseInt(val);
                                if (!isNaN(parsed)) {
                                    setQuantity(parsed);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val) || val < 1) {
                                setQuantity(1);
                            }
                        }}
                    />

                    <button
                        onClick={() => setQuantity((q) => Number(q) + 1)}
                        className="rm-qty-btn rm-qty-btn--plus"
                        type="button"
                        aria-label="Increase"
                    >
                        <span className="material-icons-outlined">add</span>
                    </button>
                </div>

                <button onClick={handleAddToCart} className="rm-add-btn" type="button">
                    <span className="rm-add-btn__label">
                        {isEditing ? t('variantModal.add') : t('detailProducts.addToCart')}
                    </span>
                    <span className="rm-add-btn__total">{formatVND(total)}</span>
                </button>
            </div>
        </div>
    );
}