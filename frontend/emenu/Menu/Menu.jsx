import { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import React from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import Header from './Header';
import MenuCard from './Menucard';
import CartSummary from './CartSummary';
import { API_BASE, apiFetch } from '../config';
import Cart from '../lib/cart';
import '../styles/menu.scss';
import CartTablet from './CartTablet';

function formatPrice(n) {
    if (typeof n !== 'number') return n;
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

export default function Menu({
    cartCount: propCartCount,
    setCartCount: propSetCartCount,
    cartTotal: propCartTotal,
    setCartTotal: propSetCartTotal,
    onBack,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const navType = useNavigationType(); // "POP" (back/forward) | "PUSH" | "REPLACE"

    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [variantsByProductId, setVariantsByProductId] = useState({});
    const [loading, setLoading] = useState(true);

    const [localCart, setLocalCart] = useState(0);
    const [localTotal, setLocalTotal] = useState(0);

    const [ready, setReady] = useState(false);

    const cartCount = propCartCount !== undefined ? propCartCount : localCart;
    const setCartCount = propSetCartCount !== undefined ? propSetCartCount : setLocalCart;
    const cartTotal = propCartTotal !== undefined ? propCartTotal : localTotal;
    const setCartTotal = propSetCartTotal !== undefined ? propSetCartTotal : setLocalTotal;

    const groupRefs = useRef({});

    // Fetch categories & products from API
    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                setLoading(true);
                const [catRes, prodRes, varRes] = await Promise.all([
                    apiFetch(`${API_BASE}/api/v1/menu/categories/?page=1&per_page=100`),
                    apiFetch(`${API_BASE}/api/v1/menu/products/?page=1&per_page=100`),
                    apiFetch(`${API_BASE}/api/v1/menu/variants/?page=1&per_page=1000`),
                ]);
                const catJson = await catRes.json();
                const prodJson = await prodRes.json();
                const varJson = await varRes.json();
                if (cancelled) return;
                if (catJson.status && Array.isArray(catJson.data)) {
                    const names = catJson.data.map((c) => c.name);
                    setCategories(names);
                    if (names.length > 0) setActiveCategory(names[0]);
                }
                if (prodJson.status && Array.isArray(prodJson.data)) {
                    setMenuItems(prodJson.data.filter((p) => p.is_active));
                }
                if (varJson.status && Array.isArray(varJson.data)) {
                    const map = {};
                    varJson.data.filter((v) => v.is_active).forEach((v) => {
                        if (!map[v.product]) map[v.product] = [];
                        map[v.product].push(v);
                    });
                    setVariantsByProductId(map);
                }
            } catch (e) {
                console.error('Menu fetch error', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchData();
        return () => { cancelled = true; };
    }, []);

    const SCROLL_KEY = `scroll:${location.pathname}`; // /menu
    const lastScrollRef = useRef(0);
    const restoringRef = useRef(false);

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useEffect(() => {
        lastScrollRef.current = window.scrollY || 0;

        let ticking = false;
        const onScroll = () => {
            lastScrollRef.current = window.scrollY || 0;

            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                try {
                    sessionStorage.setItem(SCROLL_KEY, String(lastScrollRef.current));
                } catch (e) { }
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            try {
                sessionStorage.setItem(SCROLL_KEY, String(lastScrollRef.current));
            } catch (e) { }
        };
    }, [SCROLL_KEY]);

    useLayoutEffect(() => {
        setReady(false);

        const html = document.documentElement;
        const body = document.body;

        const prevHtml = html.style.scrollBehavior;
        const prevBody = body.style.scrollBehavior;

        html.style.scrollBehavior = 'auto';
        body.style.scrollBehavior = 'auto';

        if (navType !== 'POP') {
            restoringRef.current = true;
            window.scrollTo(0, 0);

            const raf = requestAnimationFrame(() => {
                window.scrollTo(0, 0);
                html.style.scrollBehavior = prevHtml;
                body.style.scrollBehavior = prevBody;
                restoringRef.current = false;
                setReady(true);
            });

            return () => {
                cancelAnimationFrame(raf);
                html.style.scrollBehavior = prevHtml;
                body.style.scrollBehavior = prevBody;
                restoringRef.current = false;
                setReady(true);
            };
        }

        const raw = sessionStorage.getItem(SCROLL_KEY);
        const y = raw ? Number(raw) : 0;

        restoringRef.current = true;
        window.scrollTo(0, y);

        const raf = requestAnimationFrame(() => {
            window.scrollTo(0, y);

            html.style.scrollBehavior = prevHtml;
            body.style.scrollBehavior = prevBody;

            restoringRef.current = false;
            setReady(true);
        });

        return () => {
            cancelAnimationFrame(raf);
            html.style.scrollBehavior = prevHtml;
            body.style.scrollBehavior = prevBody;
            restoringRef.current = false;
            setReady(true);
        };
    }, [SCROLL_KEY, navType]);
    const items = useMemo(() => {
        if (!query) return menuItems;
        const q = query.toLowerCase();
        return menuItems.filter((m) => {
            return (m.name + ' ' + (m.description || '')).toLowerCase().includes(q);
        });
    }, [query, menuItems]);

    const grouped = useMemo(() => {
        const catOrder = categories;
        const map = {};
        items.forEach((m) => {
            const cat = m.category_name || 'Other';
            if (!map[cat]) map[cat] = [];
            map[cat].push(m);
        });
        // preserve order from categories API, then append any extras
        const ordered = catOrder.filter((c) => map[c]);
        Object.keys(map).forEach((c) => { if (!ordered.includes(c)) ordered.push(c); });
        return ordered.map((cat) => ({ category: cat, items: map[cat] }));
    }, [items, categories]);

    useEffect(() => {
        const handleScroll = () => {
            if (restoringRef.current) return;

            const menuCtrl = document.querySelector('.menu-controls');
            const offset = menuCtrl ? menuCtrl.getBoundingClientRect().height + 10 : 80;

            let closest = null;
            let minDist = Infinity;

            Object.entries(groupRefs.current).forEach(([cat, el]) => {
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const dist = Math.abs(rect.top - offset);

                if (rect.top - offset < window.innerHeight * 0.6 && dist < minDist) {
                    minDist = dist;
                    closest = cat;
                }
            });

            if (closest && closest !== activeCategory) {
                setActiveCategory(closest);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeCategory, grouped]);

    function goToCategory(cat) {
        setActiveCategory(cat);

        if (cat === 'All') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const el = groupRefs.current[cat];
        if (el) {
            const menuCtrl = document.querySelector('.menu-controls');
            const offset = menuCtrl ? menuCtrl.getBoundingClientRect().height + 8 : 80;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }

    function handleAdd(product, qty) {
        try {
            const unitPrice = Number(product.price || 0);
            const wantedQty = typeof qty !== 'undefined' ? Number(qty) : undefined;
            const productName = product.name || '';
            const productImage = product.image_url || product.image || '';

            if (typeof wantedQty === 'undefined' && Cart && typeof Cart.addItem === 'function') {
                const item = { id: product.id, name: productName, price: unitPrice, quantity: 1, subtotal: unitPrice, image: productImage, note: '', extras: [] };
                const totals = Cart.addItem(item);
                setCartCount && setCartCount(totals.count);
                setCartTotal && setCartTotal(totals.total);
                try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
            } else {
                const raw = localStorage.getItem('cart') || '[]';
                const arr = JSON.parse(raw);
                const idx = arr.findIndex((it) => it.id === product.id && JSON.stringify(it.extras || []) === JSON.stringify([]) && (it.note || '') === '');
                if (idx >= 0) {
                    if (typeof wantedQty !== 'undefined') {
                        const qn = Number(wantedQty) || 0;
                        if (qn <= 0) arr.splice(idx, 1);
                        else { arr[idx].quantity = qn; arr[idx].subtotal = qn * unitPrice; }
                    } else {
                        arr[idx].quantity = Number(arr[idx].quantity || 0) + 1;
                        arr[idx].subtotal = Number(arr[idx].subtotal || 0) + unitPrice;
                    }
                } else {
                    if (typeof wantedQty !== 'undefined') {
                        const matchesById = arr.map((it, i) => ({ it, i })).filter((m) => String(m.it.id) === String(product.id));
                        if (matchesById.length === 1) {
                            const m = matchesById[0];
                            const qn = Number(wantedQty) || 0;
                            if (qn <= 0) arr.splice(m.i, 1);
                            else { arr[m.i].quantity = qn; arr[m.i].subtotal = qn * unitPrice; }
                        } else {
                            const newQty = Math.max(0, Number(wantedQty));
                            if (newQty > 0) arr.push({ id: product.id, name: productName, price: unitPrice, quantity: newQty, subtotal: newQty * unitPrice, image: productImage, note: '', extras: [] });
                        }
                    } else {
                        arr.push({ id: product.id, name: productName, price: unitPrice, quantity: 1, subtotal: unitPrice, image: productImage, note: '', extras: [] });
                    }
                }
                localStorage.setItem('cart', JSON.stringify(arr));
                try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
                const count = arr.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
                const total = arr.reduce((s, it) => s + (Number(it.subtotal || it.price) || 0), 0);
                setCartCount && setCartCount(count);
                setCartTotal && setCartTotal(total);
            }
        } catch (e) { console.error('add failed', e); }
    }

    function handleAdjust(product, delta) {
        try {
            const raw = localStorage.getItem('cart') || '[]';
            const arr = JSON.parse(raw);
            const matches = arr.map((it, i) => ({ it, i })).filter((m) => String(m.it.id) === String(product.id));
            if (matches.length === 0) return;
            const m = matches[0];
            const idx = m.i;
            const existing = arr[idx];
            const prevQty = Number(existing.quantity) || 0;
            const unit = (Number(existing.subtotal || 0) / Math.max(1, prevQty)) || Number(existing.price || 0);
            const newQty = Math.max(0, prevQty + Number(delta));
            if (newQty <= 0) arr.splice(idx, 1);
            else arr[idx] = { ...existing, quantity: newQty, subtotal: newQty * unit };
            try { localStorage.setItem('cart', JSON.stringify(arr)); } catch (e) { }
            try { window.dispatchEvent(new Event('cart-updated')); } catch (e) { }
            const count = arr.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
            const total = arr.reduce((s, it) => s + (Number(it.subtotal || it.price) || 0), 0);
            setCartCount && setCartCount(count);
            setCartTotal && setCartTotal(total);
        } catch (e) { console.error('adjust failed', e); }
    }

    return (
        <div className="rm-page-menu" style={{ visibility: ready ? 'visible' : 'hidden' }}>
            {loading && (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Đang tải thực đơn…</div>
            )}
            <div className="rm-menu-layout">
                {/* LEFT CONTENT */}
                <main className="rm-menu-container">
                    <div className="rm-menu-controls">
                        <Header
                            onBack={onBack || (() => navigate('/'))}
                            query={query}
                            onQueryChange={setQuery}
                        />

                        <section className="rm-controls">
                            <div className="rm-categories">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        className={`rm-cat-btn ${c === activeCategory ? 'active' : ''}`}
                                        onClick={() => goToCategory(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="rm-ground-wrapper">
                        {/* CONTENT */}
                        <div className="mb-20">
                            {grouped.map((g) => (
                                <div
                                    key={g.category}
                                    className="rm-group-block"
                                    ref={(el) => (groupRefs.current[g.category] = el)}
                                >
                                    <h3 className="rm-group-title">{g.category}</h3>
                                    <section className="rm-grid">
                                        {g.items.map((it) => (
                                            <MenuCard
                                                key={it.id}
                                                id={it.id}
                                                image={it.image_url || it.image || ''}
                                                badge={it.isHot ? 'BEST SELLER' : null}
                                                title={it.name}
                                                desc={it.description}
                                                extras={it.extras || []}
                                                price={formatPrice(it.price || 0)}
                                                productVariants={variantsByProductId[it.id] || []}
                                                onAdd={(qty) => handleAdd(it, qty)}
                                                onAdjust={(delta) => handleAdjust(it, delta)}
                                            />
                                        ))}
                                    </section>
                                </div>
                            ))}
                        </div>

                        {/* CART – RIGHT */}
                        <div className="rm-cart-sidebar p-0">
                            <CartTablet />
                        </div>
                    </div>
                </main>
            </div>

            {/* MOBILE CART BAR */}
            <CartSummary count={cartCount} total={cartTotal} onClick={() => navigate('/cart')} />
        </div>
    );
}