import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../core/pagination/datatable';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PlusCircle, RotateCcw, Sliders } from 'feather-icons-react/build/IconComponents';
import Select from 'react-select';
import axios from 'axios';
import { API_BASE } from '../../environment';
import AddVariant from '../../core/modals/inventory/addvariant';
import EditVarient from '../../core/modals/inventory/editvarient';

const MySwal = withReactContent(Swal);

const VariantAttributes = () => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState({ value: 'id_asc', label: 'Sắp xếp theo ID (Tăng dần)' });

    const fetchVariants = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.get(`${API_BASE}/api/v1/admin/menu/variants/`, { headers });
            // Backend returns: { status: "success", data: { total, page, limit, results: [...] } }
            const list = res.data?.data?.results || res.data?.data || res.data?.results || res.data || [];
            console.log('[VariantList] raw res.data:', res.data);
            console.log('[VariantList] parsed list:', list);
            setVariants(Array.isArray(list) ? list : []);

        } catch (err) {
            console.error('Error fetching variants:', err);
            setVariants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants();
        const handleRefresh = () => fetchVariants();
        window.addEventListener('refreshVariantList', handleRefresh);
        return () => window.removeEventListener('refreshVariantList', handleRefresh);
    }, []);

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Biến thể này và mức giá tương ứng sẽ bị xóa vĩnh viễn!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Có, xóa ngay!',
            cancelButtonText: 'Hủy bỏ',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                    const headers = { 'ngrok-skip-browser-warning': 'true' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    await axios.delete(`${API_BASE}/api/v1/admin/menu/variants/${id}/`, { headers });
                    MySwal.fire({
                        title: 'Đã xóa!',
                        text: 'Biến thể đã được xóa thành công.',
                        icon: 'success',
                        customClass: { confirmButton: 'btn btn-success' }
                    });
                    fetchVariants();
                } catch (err) {
                    console.error('Delete variant error:', err);
                    MySwal.fire({ title: 'Lỗi', text: 'Không thể xóa biến thể này!', icon: 'error' });
                }
            }
        });
    };

    const handleToggleStatus = async (record) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const newStatus = !record.is_active;
            await axios.patch(`${API_BASE}/api/v1/admin/menu/variants/${record.id}/`, { is_active: newStatus }, { headers });
            fetchVariants();
        } catch (err) {
            console.error('Status toggle error:', err);
            MySwal.fire({ title: 'Lỗi', text: 'Không thể đổi trạng thái biến thể!', icon: 'error' });
        }
    };

    const handleOpenEdit = (record) => {
        window.dispatchEvent(new CustomEvent('selectVariantForEdit', { detail: record }));
    };

    const sortOptions = [
        { value: 'id_asc', label: 'Sắp xếp theo ID (Tăng dần)' },
        { value: 'id_desc', label: 'Sắp xếp theo ID (Giảm dần)' },
        { value: 'product_asc', label: 'Tên món (A - Z)' },
        { value: 'product_desc', label: 'Tên món (Z - A)' },
        { value: 'price_asc', label: 'Giá (Thấp đến cao)' },
        { value: 'price_desc', label: 'Giá (Cao đến thấp)' }
    ];

    const filteredVariants = variants.filter(variant => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const idMatch = variant.id?.toString().includes(query);
        const nameMatch = variant.product_name?.toLowerCase().includes(query);
        const sizeMatch = variant.size?.toLowerCase().includes(query) || variant.size_display?.toLowerCase().includes(query);
        return idMatch || nameMatch || sizeMatch;
    });

    const sortedData = [...filteredVariants].sort((a, b) => {
        if (!selectedSort) return 0;
        switch (selectedSort.value) {
            case 'id_asc':
                return (a.id || 0) - (b.id || 0);
            case 'id_desc':
                return (b.id || 0) - (a.id || 0);
            case 'product_asc':
                return (a.product_name || '').localeCompare(b.product_name || '');
            case 'product_desc':
                return (b.product_name || '').localeCompare(a.product_name || '');
            case 'price_asc':
                return (Number(a.price) || 0) - (Number(b.price) || 0);
            case 'price_desc':
                return (Number(b.price) || 0) - (Number(a.price) || 0);
            default:
                return 0;
        }
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <span className="badge bg-secondary font-weight-bold">#{text}</span>,
            sorter: (a, b) => (a.id || 0) - (b.id || 0),
        },
        {
            title: 'Sản phẩm / Món ăn',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (text, record) => (
                <span className="font-weight-bold text-dark">
                    {text || `Món ăn #${record.product}`}
                </span>
            ),
            sorter: (a, b) => (a.product_name || '').localeCompare(b.product_name || ''),
        },
        {
            title: 'Kích cỡ (Size)',
            dataIndex: 'size_display',
            key: 'size',
            render: (text, record) => {
                const badgeColor = record.size === 'XL' ? 'bg-danger' : record.size === 'L' ? 'bg-warning text-dark' : record.size === 'M' ? 'bg-info text-dark' : 'bg-primary';
                return (
                    <span className={`badge ${badgeColor} font-weight-bold p-2`}>
                        {text || record.size}
                    </span>
                );
            },
        },
        {
            title: 'Giá bán (Price)',
            dataIndex: 'price',
            key: 'price',
            render: (text) => (
                <span className="font-weight-bold text-success" style={{ fontSize: '15px' }}>
                    {Number(text || 0).toLocaleString('vi-VN')} đ
                </span>
            ),
            sorter: (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (text, record) => (
                <span
                    className={`badge ${record.is_active ? 'badge-linesuccess' : 'badge-linedanger'} cursor-pointer`}
                    onClick={() => handleToggleStatus(record)}
                    style={{ cursor: 'pointer' }}
                    title="Nhấn để đổi trạng thái"
                >
                    {record.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-table-data">
                    <div className="edit-delete-action d-flex align-items-center">
                        <Link
                            className="me-2 p-2 btn btn-sm btn-outline-primary d-flex align-items-center"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-units"
                            onClick={() => handleOpenEdit(record)}
                            title="Chỉnh sửa biến thể"
                        >
                            <i data-feather="edit" className="feather-edit" style={{ width: '16px', height: '16px' }} />
                        </Link>
                        <Link
                            className="confirm-text p-2 btn btn-sm btn-outline-danger d-flex align-items-center"
                            to="#"
                            onClick={() => handleDelete(record.id)}
                            title="Xóa biến thể"
                        >
                            <i data-feather="trash-2" className="feather-trash-2" style={{ width: '16px', height: '16px' }} />
                        </Link>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="page-header">
                    <div className="add-item d-flex">
                        <div className="page-title">
                            <h4>Quản lý Biến thể & Giá (Variant Attributes CRUD)</h4>
                            <h6>Quản lý kích cỡ (S, M, L, XL) và giá bán cho từng món ăn</h6>
                        </div>
                    </div>
                    <ul className="table-top-head">
                        <li>
                            <Link to="#" onClick={fetchVariants} data-bs-toggle="tooltip" data-bs-placement="top" title="Làm mới dữ liệu">
                                <RotateCcw />
                            </Link>
                        </li>
                    </ul>
                    <div className="page-btn">
                        <a
                            href="#"
                            className="btn btn-added d-flex align-items-center"
                            data-bs-toggle="modal"
                            data-bs-target="#add-units"
                        >
                            <PlusCircle className="me-2" style={{ width: '18px', height: '18px' }} />
                            Thêm Biến Thể Mới
                        </a>
                    </div>
                </div>

                <div className="card table-list-card">
                    <div className="card-body">
                        <div className="table-top d-flex justify-content-between align-items-center mb-3">
                            <div className="search-set">
                                <div className="search-input">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm (ID, Tên món, Size)..."
                                        className="form-control form-control-sm formsearch"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="form-sort d-flex align-items-center">
                                    <Sliders className="info-img me-2" style={{ width: '18px', height: '18px', color: '#6c757d' }} />
                                    <div style={{ width: '260px' }}>
                                        <Select
                                            classNamePrefix="react-select"
                                            options={sortOptions}
                                            value={selectedSort}
                                            onChange={(option) => setSelectedSort(option)}
                                            placeholder="Sắp xếp..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <Table
                                columns={columns}
                                dataSource={sortedData}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <AddVariant />
            <EditVarient />
        </div>
    );
};

export default VariantAttributes;
