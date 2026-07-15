import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_BASE } from '../../../environment';

const MySwal = withReactContent(Swal);

const sizeOptions = [
    { value: 'S', label: 'S - Small (Nhỏ)' },
    { value: 'M', label: 'M - Medium (Vừa)' },
    { value: 'L', label: 'L - Large (Lớn)' },
    { value: 'XL', label: 'XL - Extra Large (Đặc biệt)' }
];

const AddVariant = () => {
    const [productsList, setProductsList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(sizeOptions[1]); // Default M
    const [price, setPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                const headers = { 'ngrok-skip-browser-warning': 'true' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await axios.get(`${API_BASE}/api/v1/admin/menu/products/`, { headers });
                // Backend paginates: { data: { results: [...] } }
                const list = res.data?.data?.results || res.data?.data || res.data || [];
                const options = (Array.isArray(list) ? list : []).map(p => ({
                    value: p.id,
                    label: `${p.name} (ID: #${p.id})`
                }));
                setProductsList(options);
                if (options.length > 0 && !selectedProduct) {
                    setSelectedProduct(options[0]);
                }
            } catch (err) {
                console.error('Error loading products for AddVariant:', err);
            }
        };

        const modalEl = document.getElementById('add-units');
        if (modalEl) {
            modalEl.addEventListener('show.bs.modal', fetchProducts);
        }
        fetchProducts();
        return () => {
            if (modalEl) {
                modalEl.removeEventListener('show.bs.modal', fetchProducts);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) {
            MySwal.fire({ title: 'Lỗi', text: 'Vui lòng chọn món ăn/sản phẩm!', icon: 'warning' });
            return;
        }
        if (!selectedSize) {
            MySwal.fire({ title: 'Lỗi', text: 'Vui lòng chọn kích cỡ (Size)!', icon: 'warning' });
            return;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
            MySwal.fire({ title: 'Lỗi', text: 'Vui lòng nhập giá bán hợp lệ (> 0)!', icon: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const payload = {
                product: selectedProduct.value,
                size: selectedSize.value,
                price: Number(price),
                is_active: isActive
            };

            await axios.post(`${API_BASE}/api/v1/admin/menu/variants/`, payload, { headers });

            MySwal.fire({
                title: 'Thành công!',
                text: 'Đã thêm biến thể mới và giá thành công.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' }
            });

            // Reset form
            setPrice('');
            window.dispatchEvent(new CustomEvent('refreshVariantList'));

            // Close modal
            const closeBtn = document.querySelector('#add-units .close');
            if (closeBtn) closeBtn.click();
        } catch (err) {
            console.error('Add variant error:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Không thể tạo biến thể này (có thể đã tồn tại Size này cho món ăn đã chọn).';
            MySwal.fire({ title: 'Lỗi', text: errorMsg, icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade" id="add-units">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header border-0 custom-modal-header">
                                <div className="page-title">
                                    <h4>Thêm Biến Thể & Giá (Create Variant)</h4>
                                </div>
                                <button
                                    type="button"
                                    className="close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body custom-modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label font-weight-bold">
                                            Sản phẩm / Món ăn <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={productsList}
                                            value={selectedProduct}
                                            onChange={setSelectedProduct}
                                            placeholder="Chọn món ăn..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label font-weight-bold">
                                            Kích cỡ (Size) <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={sizeOptions}
                                            value={selectedSize}
                                            onChange={setSelectedSize}
                                            placeholder="Chọn kích cỡ..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label font-weight-bold">
                                            Giá bán (VNĐ) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Ví dụ: 35000"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                            <span className="status-label font-weight-bold">Trạng thái (Active)</span>
                                            <input
                                                type="checkbox"
                                                id="variant_status_add"
                                                className="check"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                            />
                                            <label htmlFor="variant_status_add" className="checktoggle" />
                                        </div>
                                    </div>
                                    <div className="modal-footer-btn">
                                        <button
                                            type="button"
                                            className="btn btn-cancel me-2"
                                            data-bs-dismiss="modal"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Đang lưu...' : 'Thêm Biến Thể'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVariant;
