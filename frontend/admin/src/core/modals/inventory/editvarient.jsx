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

const EditVarient = () => {
    const [variantId, setVariantId] = useState(null);
    const [productsList, setProductsList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
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
                return options;
            } catch (err) {
                console.error('Error loading products for EditVarient:', err);
                return [];
            }
        };

        const handleSelectForEdit = async (e) => {
            const variant = e.detail;
            if (!variant) return;

            setVariantId(variant.id);
            setPrice(variant.price || '');
            setIsActive(variant.is_active !== undefined ? variant.is_active : true);

            const sizeOpt = sizeOptions.find(opt => opt.value === variant.size) || { value: variant.size, label: variant.size_display || variant.size };
            setSelectedSize(sizeOpt);

            const options = productsList.length > 0 ? productsList : await fetchProducts();
            const prodOpt = options.find(opt => opt.value === variant.product) || { value: variant.product, label: variant.product_name || `Món #${variant.product}` };
            setSelectedProduct(prodOpt);
        };

        window.addEventListener('selectVariantForEdit', handleSelectForEdit);
        return () => {
            window.removeEventListener('selectVariantForEdit', handleSelectForEdit);
        };
    }, [productsList]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!variantId) return;
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

            await axios.put(`${API_BASE}/api/v1/admin/menu/variants/${variantId}/`, payload, { headers });

            MySwal.fire({
                title: 'Cập nhật thành công!',
                text: 'Thông tin biến thể và giá đã được cập nhật.',
                icon: 'success',
                customClass: { confirmButton: 'btn btn-success' }
            });

            window.dispatchEvent(new CustomEvent('refreshVariantList'));

            // Close modal
            const closeBtn = document.querySelector('#edit-units .close');
            if (closeBtn) closeBtn.click();
        } catch (err) {
            console.error('Update variant error:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Không thể cập nhật biến thể này.';
            MySwal.fire({ title: 'Lỗi', text: errorMsg, icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade" id="edit-units">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header border-0 custom-modal-header">
                                <div className="page-title">
                                    <h4>Chỉnh sửa Biến Thể & Giá (Edit Variant)</h4>
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
                                                id="variant_status_edit"
                                                className="check"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                            />
                                            <label htmlFor="variant_status_edit" className="checktoggle" />
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
                                            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
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

export default EditVarient;
