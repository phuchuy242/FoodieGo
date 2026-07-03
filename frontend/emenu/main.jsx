import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './i18n';
import './styles/styles.scss';
import './styles/toast.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './Menu/Home.jsx';
import Menu from './Menu/Menu.jsx';
import DetailProducts from './Menu/DetailProducts.jsx';
import Cart from './Menu/Cart.jsx';
import OrderSuccessful from './Menu/OrderSuccessful.jsx';
import HistoryOrder from './Menu/HistoryOrder.jsx';
import Pay from './Menu/Pay.jsx';

const readCartSummary = () => {
    try {
        const raw = localStorage.getItem('cart') || '[]';
        const cart = JSON.parse(raw);

        if (!Array.isArray(cart)) {
            return { count: 0, total: 0 };
        }

        const count = cart.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
        const total = cart.reduce((sum, item) => sum + (Number(item?.subtotal || item?.price) || 0), 0);
        return { count, total };
    } catch {
        return { count: 0, total: 0 };
    }
};

function MenuOnlyApp() {
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);

    useEffect(() => {
        const syncCart = () => {
            const summary = readCartSummary();
            setCartCount(summary.count);
            setCartTotal(summary.total);
        };

        syncCart();
        window.addEventListener('cart-updated', syncCart);
        window.addEventListener('storage', syncCart);

        return () => {
            window.removeEventListener('cart-updated', syncCart);
            window.removeEventListener('storage', syncCart);
        };
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
                path="/menu"
                element={
                    <Menu
                        cartCount={cartCount}
                        setCartCount={setCartCount}
                        cartTotal={cartTotal}
                        setCartTotal={setCartTotal}
                    />
                }
            />
            <Route
                path="/menu/:id"
                element={
                    <DetailProducts
                        setCartCount={setCartCount}
                        setCartTotal={setCartTotal}
                    />
                }
            />
            <Route
                path="/cart"
                element={
                    <Cart
                        setCartCount={setCartCount}
                        setCartTotal={setCartTotal}
                    />
                }
            />
            <Route path="/odersuccessfull" element={<OrderSuccessful />} />
            <Route path="/history" element={<HistoryOrder />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <MenuOnlyApp />
        </Router>
    </React.StrictMode>
);
