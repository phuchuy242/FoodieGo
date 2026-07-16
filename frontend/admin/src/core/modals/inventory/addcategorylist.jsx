import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../environment';

const AddCategoryList = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            Swal.fire({ title: 'Cảnh báo', text: 'Vui lòng nhập tên danh mục', icon: 'warning' });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.post(`${API_BASE}/api/v1/admin/menu/categories/`, {
                name: name.trim(),
                description: description.trim() || name.trim(),
                is_active: isActive
            }, { headers });

            if (res.data?.status === 'success' || res.status === 201 || res.status === 200) {
                Swal.fire({ title: 'Thành công', text: 'Đã tạo danh mục mới!', icon: 'success' });
                setName('');
                setDescription('');
                setIsActive(true);
                // Close modal
                const closeBtn = document.querySelector('#add-category .close');
                if (closeBtn) closeBtn.click();
                
                // Notify parent
                if (onSuccess) onSuccess();
                window.dispatchEvent(new Event('refreshCategoryList'));
            }
        } catch (err) {
            console.error('Error creating category:', err);
            Swal.fire({
                title: 'Lỗi',
                text: err.response?.data?.msg || 'Không thể tạo danh mục. Vui lòng thử lại!',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Add Category */}
            <div className="modal fade" id="add-category">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Create Category</h4>
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
                                            <label className="form-label">Category Name <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="VD: Mì Trộn Đặc Biệt"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description / Slug</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Mô tả danh mục"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status (Hiển thị)</span>
                                                <input
                                                    type="checkbox"
                                                    id="add_cat_status"
                                                    className="check"
                                                    checked={isActive}
                                                    onChange={(e) => setIsActive(e.target.checked)}
                                                />
                                                <label htmlFor="add_cat_status" className="checktoggle" />
                                            </div>
                                        </div>
                                        <div className="modal-footer-btn mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-submit" disabled={loading}>
                                                {loading ? 'Saving...' : 'Create Category'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Add Category */}
        </div>
    );
};

export default AddCategoryList;
