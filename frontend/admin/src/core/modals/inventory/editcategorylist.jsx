import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../environment';

const EditCategoryList = ({ category: propCategory, onSuccess }) => {
    const [categoryId, setCategoryId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleSelect = (e) => {
            const cat = e.detail;
            if (cat) {
                setCategoryId(cat.id || cat.key);
                setName(cat.category || cat.name || '');
                setDescription(cat.description || cat.categoryslug || cat.slug || '');
                setIsActive(cat.is_active !== undefined ? cat.is_active : (cat.is_available !== undefined ? cat.is_available : true));
            }
        };
        window.addEventListener('selectCategoryForEdit', handleSelect);
        return () => window.removeEventListener('selectCategoryForEdit', handleSelect);
    }, []);

    useEffect(() => {
        if (propCategory) {
            setCategoryId(propCategory.id);
            setName(propCategory.name || propCategory.category || '');
            setDescription(propCategory.description || propCategory.slug || '');
            setIsActive(propCategory.is_active !== undefined ? propCategory.is_active : true);
        }
    }, [propCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId) {
            Swal.fire({ title: 'Lỗi', text: 'Không tìm thấy ID danh mục cần sửa', icon: 'error' });
            return;
        }
        if (!name.trim()) {
            Swal.fire({ title: 'Cảnh báo', text: 'Vui lòng nhập tên danh mục', icon: 'warning' });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.put(`${API_BASE}/api/v1/admin/menu/categories/${categoryId}/`, {
                name: name.trim(),
                description: description.trim() || name.trim(),
                is_active: isActive
            }, { headers });

            if (res.data?.status === 'success' || res.status === 200) {
                Swal.fire({ title: 'Thành công', text: 'Đã cập nhật danh mục!', icon: 'success' });
                const closeBtn = document.querySelector('#edit-category .close');
                if (closeBtn) closeBtn.click();

                if (onSuccess) onSuccess();
                window.dispatchEvent(new Event('refreshCategoryList'));
            }
        } catch (err) {
            console.error('Error updating category:', err);
            Swal.fire({
                title: 'Lỗi',
                text: err.response?.data?.msg || 'Không thể cập nhật danh mục. Vui lòng thử lại!',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Edit Category */}
            <div className="modal fade" id="edit-category">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Category</h4>
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
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description / Slug</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status (Hiển thị)</span>
                                                <input
                                                    type="checkbox"
                                                    id="edit_cat_status"
                                                    className="check"
                                                    checked={isActive}
                                                    onChange={(e) => setIsActive(e.target.checked)}
                                                />
                                                <label htmlFor="edit_cat_status" className="checktoggle" />
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
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit Category */}
        </div>
    );
};

export default EditCategoryList;

