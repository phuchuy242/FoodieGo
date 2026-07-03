import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import "../styles/giohang.css";
import backIcon from '../public/images/back.png';


function formatPrice(n) {
    const num = Number(n || 0);
    return num.toLocaleString("vi-VN") + "đ";
}

export default function Giohang() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);


    useEffect(() => {
        try {
            const raw = localStorage.getItem("cart") || "[]";
            const parsed = JSON.parse(raw);
            setCart(Array.isArray(parsed) ? parsed : []);
        } catch (err) {
            setCart([]);
        }
    }, []);

    const subtotal = cart.reduce((s, it) => s + Number(it.subtotal || it.price || 0), 0);
    const fee = subtotal > 0 ? 20000 : 0;
    const total = subtotal + fee;

    const removeItem = (i) => {
        const next = [...cart];
        next.splice(i, 1);
        setCart(next);
        try {
            localStorage.setItem("cart", JSON.stringify(next));
        } catch (e) { }
    };

    return (
        <div className="giohang-root">
            <div className="giohang-container">
                <div className="giohang-header">
                    <div>
                        <div className="giohang-title">Giỏ hàng của bạn</div>
                        <div className="giohang-sub">Kiểm tra lại các món ăn trước khi thanh toán</div>
                    </div>

                </div>


                <div className="space-y-6">
                    <div className="cart-card">
                        {cart.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Giỏ hàng trống</div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="cart-item">
                                    <img className="cart-thumb" src={item.image || ''} alt={item.name} onError={(e) => (e.currentTarget.src = '')} />
                                    <div className="cart-main">
                                        <div className="cart-top">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="cart-qty">{item.quantity}x</div>
                                                <div className="cart-name">{item.name}</div>
                                            </div>
                                            <button className="remove-btn" onClick={() => removeItem(idx)} aria-label="Remove">×</button>
                                        </div>
                                        <div className="cart-bottom">
                                            <div className="price">{formatPrice(item.subtotal || item.price)}</div>
                                            <button className="edit-btn">Chỉnh sửa</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="summary">
                        <h2>Tóm tắt đơn hàng</h2>
                        <div className="row">
                            <div>Tạm tính</div>
                            <div>{formatPrice(subtotal)}</div>
                        </div>
                        <div className="row">
                            <div>Phí dịch vụ</div>
                            <div>{formatPrice(fee)}</div>
                        </div>
                        <div className="total-row">
                            <div>Tổng tiền</div>
                            <div>{formatPrice(total)}</div>
                        </div>

                        <div className="space-y-4">
                            <button
                                className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98] flex justify-center items-center gap-2 group"
                                onClick={() => {
                                    try {
                                        const order = {
                                            id: 'ORD' + Math.floor(Date.now() / 1000),
                                            cart,
                                            total,
                                            createdAt: Date.now(),
                                        };
                                        localStorage.setItem('lastOrder', JSON.stringify(order));
                                    } catch (e) {
                                        console.error('save order failed', e);
                                    }
                                    navigate('/odersuccessfull');
                                }}
                            >
                                <span>Xác nhận</span>
                                <span className="bg-emerald-400/30 px-3 py-1 rounded-lg group-hover:bg-emerald-400/40 transition-colors text-sm font-semibold">{formatPrice(total)}</span>
                            </button>

                            <button onClick={() => navigate('/menu')} className="w-full border border-slate-300 dark:border-slate-700 font-medium py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                                <img src={backIcon} alt="Back" className="back-icon" />
                                <span>Quay lại trang chủ</span>
                            </button>
                            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                                Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
