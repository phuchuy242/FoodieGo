import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/menu-card.scss';
import VariantModal from './VariantModal';

export default function MenuCard({
    id = '',
    image = '/public/images/sample.jpg',
    badge = 'BEST SELLER',
    title = 'Kimchi Seafood Noodles',
    desc = 'Spicy broth with fresh seafood, mushrooms, and veggies.',
    price = '55.000đ',
    extras = [],
    productVariants = [],
    // Các props này giữ lại để tương thích nhưng logic chính sẽ do component tự xử lý
    onAdd = () => { },
    onAdjust = () => { },
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- Tính variant nhỏ nhất theo size ---
    const SIZE_ORDER = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
    const minVariant = React.useMemo(() => {
        if (!productVariants || productVariants.length === 0) return null;
        return productVariants.reduce((min, v) => {
            const vRank = SIZE_ORDER[v.size] ?? 99;
            const minRank = SIZE_ORDER[min.size] ?? 99;
            return vRank < minRank ? v : min;
        });
    }, [productVariants]);

    function formatVariantPrice(p) {
        const n = parseFloat(p);
        if (isNaN(n)) return p;
        return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
    }

    const displayPrice = minVariant ? formatVariantPrice(minVariant.price) : price;
    const displaySize = minVariant ? minVariant.size_display : null;
    // State hiển thị tổng số lượng
    const [quantity, setQuantity] = useState(0);
    const [editValue, setEditValue] = useState(0);

    // State điều khiển Popup
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [variants, setVariants] = useState([]);

    // --- 1. LOAD DATA & ĐỒNG BỘ TỪ LOCALSTORAGE ---
    useEffect(() => {
        const refresh = () => {
            try {
                const raw = localStorage.getItem('cart') || '[]';
                const items = JSON.parse(raw);

                // Lấy tất cả các dòng có ID trùng với món này
                const matched = items.filter((it) => String(it.id) === String(id));

                if (matched.length > 0) {
                    // Cộng tổng số lượng của tất cả các biến thể
                    const totalQty = matched.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                    setQuantity(totalQty);
                    setEditValue(String(totalQty));
                } else {
                    setQuantity(0);
                    setEditValue('0');
                }
            } catch (e) {
                setQuantity(0);
                setEditValue('0');
            }
        };

        refresh();

        // Lắng nghe sự kiện để cập nhật UI khi giỏ hàng thay đổi từ nơi khác
        const onCartUpdated = () => refresh();
        window.addEventListener('cart-updated', onCartUpdated);
        const onStorage = (ev) => { if (ev.key === 'cart') refresh(); };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('cart-updated', onCartUpdated);
            window.removeEventListener('storage', onStorage);
        };
    }, [id]);

    // Cập nhật giá trị ô input khi quantity đổi
    useEffect(() => {
        setEditValue(String(Number(quantity) || 0));
    }, [quantity]);

    function goDetail(e) {
        if (e.defaultPrevented) return;
        navigate(`/menu/${id}`);
    }

    // --- 2. XỬ LÝ NÚT CỘNG (Luôn cộng vào bản Tiêu Chuẩn) ---
    const handlePlusClick = (e) => {
        e.stopPropagation();
        if (productVariants && productVariants.length > 1) {
            navigate(`/menu/${id}`);
            return;
        }
        try {
            const raw = localStorage.getItem('cart') || '[]';
            let items = JSON.parse(raw);

            // Giá thực: ưu tiên minVariant, fallback về prop price
            const numericPrice = minVariant
                ? Math.round(parseFloat(minVariant.price))
                : Number(String(price).replace(/[^0-9]/g, ''));

            // Tìm món "tiêu chuẩn": Cùng ID + Không Note + Không Extras + Cùng variant_id (nếu có)
            const standardIdx = items.findIndex(it =>
                String(it.id) === String(id) &&
                (!it.note || it.note.trim() === '') &&
                (!it.extras || it.extras.length === 0) &&
                (minVariant ? String(it.variant_id) === String(minVariant.id) : !it.variant_id)
            );

            if (standardIdx > -1) {
                // Đã có món tiêu chuẩn -> Cộng dồn
                items[standardIdx].quantity += 1;
                items[standardIdx].subtotal = items[standardIdx].quantity * (items[standardIdx].price || 0);
            } else {
                // Chưa có -> Thêm mới món tiêu chuẩn
                const cartItem = {
                    id,
                    name: title,
                    price: numericPrice,
                    quantity: 1,
                    subtotal: numericPrice,
                    image,
                    note: '',
                    extras: [],
                };
                if (minVariant) {
                    cartItem.variant_id = minVariant.id;
                    cartItem.size = minVariant.size;
                    cartItem.size_display = minVariant.size_display;
                }
                items.push(cartItem);
            }

            // Lưu & Dispatch event
            localStorage.setItem('cart', JSON.stringify(items));
            window.dispatchEvent(new Event('cart-updated'));

            // LƯU Ý: Không gọi onAdd() ở đây nữa để tránh cộng 2 lần

        } catch (err) {
            console.error(err);
        }
    };

    // --- 3. XỬ LÝ NÚT TRỪ (Kiểm tra biến thể) ---
    const handleMinusClick = (e) => {
        e.stopPropagation();

        try {
            const raw = localStorage.getItem('cart') || '[]';
            const items = JSON.parse(raw);
            const matches = items.filter(it => String(it.id) === String(id));

            if (matches.length === 0) return;

            // TRƯỜNG HỢP A: Có nhiều biến thể (vd: 1 cái có note, 1 cái ko) -> BẬT POPUP
            if (matches.length > 1) {
                setVariants(matches);
                setShowVariantModal(true);
            }
            // TRƯỜNG HỢP B: Chỉ có 1 dòng duy nhất -> TRỪ THẲNG DÒNG ĐÓ
            else {
                const targetItem = matches[0];
                const idx = items.indexOf(targetItem); // Hoặc dùng findIndex với JSON.stringify nếu cần

                if (idx > -1) {
                    items[idx].quantity -= 1;

                    if (items[idx].quantity <= 0) {
                        items.splice(idx, 1); // Xóa nếu về 0
                    } else {
                        items[idx].subtotal = items[idx].quantity * (items[idx].price || 0);
                    }

                    localStorage.setItem('cart', JSON.stringify(items));
                    window.dispatchEvent(new Event('cart-updated'));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- 3c. MỞ POPUP KHI BẤM VÀO SỐ LƯỢNG ---
    const handleQtyClick = (e) => {
        e.stopPropagation();

        try {
            const raw = localStorage.getItem('cart') || '[]';
            const items = JSON.parse(raw);
            const matches = items.filter(it => String(it.id) === String(id));

            if (matches.length === 0) return;

            setVariants(matches);
            setShowVariantModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    // Add standard from modal and refresh variants list
    const handleAddStandardFromModal = () => {
        // call existing plus handler (pass a dummy event with stopPropagation)
        try {
            handlePlusClick({ stopPropagation: () => { } });
        } catch (e) {
            // fallback: duplicate plus logic if needed
            try {
                const raw = localStorage.getItem('cart') || '[]';
                let items = JSON.parse(raw);
                const numericPrice = Number(String(price).replace(/[^0-9]/g, ''));
                const standardIdx = items.findIndex(it => String(it.id) === String(id) && (!it.note || it.note.trim() === '') && (!it.extras || it.extras.length === 0));
                if (standardIdx > -1) {
                    items[standardIdx].quantity += 1;
                    items[standardIdx].subtotal = items[standardIdx].quantity * (items[standardIdx].price || 0);
                } else {
                    items.push({ id, name: title, price: numericPrice, quantity: 1, subtotal: numericPrice, image, note: '', extras: [] });
                }
                localStorage.setItem('cart', JSON.stringify(items));
                window.dispatchEvent(new Event('cart-updated'));
            } catch (err) { console.error(err); }
        }

        // Refresh modal variants to reflect the new standard item
        try {
            const raw2 = localStorage.getItem('cart') || '[]';
            const items2 = JSON.parse(raw2);
            const matches = items2.filter(it => String(it.id) === String(id));
            setVariants(matches);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 4. XỬ LÝ TRONG POPUP: CẬP NHẬT SỐ LƯỢNG ---
    const handleVariantQtyUpdate = (targetItem, delta) => {
        try {
            const raw = localStorage.getItem('cart') || '[]';
            const items = JSON.parse(raw);

            // Tìm chính xác item (khớp cả note và extras)
            const idx = items.findIndex(it => JSON.stringify(it) === JSON.stringify(targetItem));

            if (idx > -1) {
                const newQty = items[idx].quantity + delta;

                if (newQty <= 0) {
                    items.splice(idx, 1); // Xóa
                } else {
                    items[idx].quantity = newQty;
                    items[idx].subtotal = newQty * (items[idx].price || 0);
                }

                localStorage.setItem('cart', JSON.stringify(items));
                window.dispatchEvent(new Event('cart-updated'));

                // Refresh lại list trong popup
                const remainingVariants = items.filter(it => String(it.id) === String(id));
                setVariants(remainingVariants);

                // Nếu xoá hết thì đóng popup
                if (remainingVariants.length === 0) setShowVariantModal(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // --- 6. XỬ LÝ: XÓA 1 BIẾN THỂ TỪ POPUP ---
    const handleRemoveVariant = (targetItem) => {
        try {
            const raw = localStorage.getItem('cart') || '[]';
            const items = JSON.parse(raw);
            const idx = items.findIndex(it => JSON.stringify(it) === JSON.stringify(targetItem));
            if (idx === -1) return;
            const removedQty = Number(items[idx].quantity) || 0;
            const removedSub = Number(items[idx].subtotal || items[idx].price) || 0;
            items.splice(idx, 1);
            localStorage.setItem('cart', JSON.stringify(items));
            try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }

            // refresh modal list
            const remainingVariants = items.filter(it => String(it.id) === String(id));
            setVariants(remainingVariants);

            // update visible quantity/editValue
            const totalAfter = items.filter(it => String(it.id) === String(id)).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
            setQuantity(totalAfter);
            setEditValue(String(totalAfter));

            // update parent counts if provided via globals (Menu.jsx manages setCartCount/setCartTotal there)
            try {
                const count = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                const total = items.reduce((s, it) => s + (Number(it.subtotal || it.price) || 0), 0);
                // attempt to update any parent via window event — Menu.jsx listens for cart-updated and sets state
                // If Menu passed setCartCount/setCartTotal via props those were updated already by Menu's handlers.
            } catch (e) { }

            // Close modal if no variants left
            if (remainingVariants.length === 0) setShowVariantModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 5. XỬ LÝ TRONG POPUP: CẬP NHẬT GHI CHÚ ---
    const handleVariantNoteUpdate = (targetItem, newNote) => {
        try {
            const raw = localStorage.getItem('cart') || '[]';
            const items = JSON.parse(raw);
            const idx = items.findIndex(it => JSON.stringify(it) === JSON.stringify(targetItem));

            if (idx > -1) {
                items[idx].note = newNote;
                localStorage.setItem('cart', JSON.stringify(items));
                window.dispatchEvent(new Event('cart-updated'));

                // Refresh lại list trong popup
                const remainingVariants = items.filter(it => String(it.id) === String(id));
                setVariants(remainingVariants);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <article className="rm-menu-card" onClick={goDetail} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') goDetail(e); }} role="button">
                <div className="rm-media">
                    {badge && <span className="rm-badge">{badge === 'BEST SELLER' ? t('menucard.bestseller') : badge}</span>}
                    <img src={image} alt={title} className="rm-card-image" />
                </div>

                <div className="rm-card-body">
                    <h3 className="rm-card-title">{title}</h3>
                    <p className="rm-card-desc">{desc}</p>

                    <div className="rm-card-footer">
                        <div className="rm-price pr-1">
                            {displayPrice}
                        </div>

                        {Number(quantity) <= 0 ? (
                            // --- NÚT THÊM MỚI ---
                            <button className="rm-add-btn1" aria-label={`Add ${title}`} onClick={handlePlusClick}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        ) : (
                            <div className="rm-detail-qty123" onClick={(e) => e.stopPropagation()}>
                                {/* --- NÚT TRỪ (Có check popup) --- */}
                                <button
                                    onClick={handleMinusClick}
                                    className="rm-qty-btn rm-qty-btn--minus"
                                    type="button"
                                    aria-label="Decrease"
                                >
                                    <span className="material-icons-outlined">remove</span>
                                </button>

                                <input
                                    className="rm-qty-val rm-qty-input p-0"
                                    type="number"
                                    value={editValue}
                                    readOnly // Read-only vì logic phức tạp
                                    onClick={handleQtyClick}
                                    style={{ cursor: 'pointer' }}
                                />

                                {/* --- NÚT CỘNG (Cộng bản tiêu chuẩn) --- */}
                                <button
                                    onClick={handlePlusClick}
                                    className="rm-qty-btn rm-qty-btn--plus"
                                    type="button"
                                    aria-label="Increase"
                                >
                                    <span className="material-icons-outlined">add</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </article>

            {/* --- POPUP BIẾN THỂ --- */}
            <VariantModal
                open={showVariantModal}
                onClose={() => setShowVariantModal(false)}
                productName={title}
                variants={variants}
                onUpdateQty={handleVariantQtyUpdate}
                onUpdateNote={handleVariantNoteUpdate}
                onAddStandard={handleAddStandardFromModal}
                onRemoveVariant={handleRemoveVariant}
            />
        </>
    );
}