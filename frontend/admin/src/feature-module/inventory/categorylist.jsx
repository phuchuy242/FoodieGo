import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { Link } from 'react-router-dom';
import { ChevronUp, PlusCircle, RotateCcw, Sliders } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import Select from 'react-select';
import AddCategoryList from '../../core/modals/inventory/addcategorylist';
import EditCategoryList from '../../core/modals/inventory/editcategorylist';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import { API_BASE } from '../../environment';

const CategoryList = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const reduxDataSource = useSelector((state) => state.categotylist_data) || [];

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.get(`${API_BASE}/api/v1/admin/menu/categories/`, { headers });
            const list = res.data?.data?.results || res.data?.data || res.data || [];
            if (Array.isArray(list)) {
                const formatted = list.map((cat) => ({
                    key: cat.id,
                    id: cat.id,
                    category: cat.name || '',
                    categoryslug: cat.slug || cat.description || '',
                    createdon: cat.created_at ? new Date(cat.created_at).toLocaleDateString('vi-VN') : '15-07-2026',
                    status: (cat.is_active !== undefined ? cat.is_active : (cat.is_available !== undefined ? cat.is_available : true)) ? 'Active' : 'Inactive',
                    is_active: cat.is_active !== undefined ? cat.is_active : true,
                    products_count: cat.products_count || 0
                }));
                setDataSource(formatted);
            } else {
                setDataSource(reduxDataSource);
            }
        } catch (err) {
            console.error('Failed to fetch categories, using fallback:', err);
            setDataSource(reduxDataSource);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        const handleRefresh = () => fetchCategories();
        window.addEventListener('refreshCategoryList', handleRefresh);
        return () => window.removeEventListener('refreshCategoryList', handleRefresh);
    }, []);

    const [selectedSort, setSelectedSort] = useState({ value: 'default', label: 'Sắp xếp' });
    const sortOptions = [
        { value: 'default', label: 'Mặc định' },
        { value: 'idAsc', label: 'ID Tăng dần (#1 -> #9)' },
        { value: 'idDesc', label: 'ID Giảm dần (#9 -> #1)' },
        { value: 'nameAsc', label: 'Tên A -> Z' },
        { value: 'nameDesc', label: 'Tên Z -> A' },
        { value: 'countDesc', label: 'Số lượng món nhiều nhất' },
    ];

    const renderTooltip = (props) => (
        <Tooltip id="pdf-tooltip" {...props}>
            Xuất PDF
        </Tooltip>
    );
    const renderExcelTooltip = (props) => (
        <Tooltip id="excel-tooltip" {...props}>
            Xuất Excel
        </Tooltip>
    );
    const renderPrinterTooltip = (props) => (
        <Tooltip id="printer-tooltip" {...props}>
            In
        </Tooltip>
    );
    const renderRefreshTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Làm mới
        </Tooltip>
    );
    const renderCollapseTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Thu gọn
        </Tooltip>
    );

    const MySwal = withReactContent(Swal);

    const handleStatusToggle = async (record) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const nextState = !record.is_active;
            await axios.patch(`${API_BASE}/api/v1/admin/menu/categories/${record.id}/status/`, {
                is_available: nextState,
                is_active: nextState
            }, { headers });

            MySwal.fire({
                title: 'Cập nhật thành công',
                text: `Danh mục đã chuyển sang trạng thái ${nextState ? 'Active' : 'Inactive'}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            fetchCategories();
        } catch (err) {
            MySwal.fire({ title: 'Lỗi', text: 'Không thể đổi trạng thái danh mục', icon: 'error' });
        }
    };

    const showConfirmationAlert = (id) => {
        MySwal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Danh mục này sẽ bị xóa vĩnh viễn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Có, xóa ngay!',
            cancelButtonText: 'Hủy bỏ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                    const headers = { 'ngrok-skip-browser-warning': 'true' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    await axios.delete(`${API_BASE}/api/v1/admin/menu/categories/${id}/`, { headers });
                    MySwal.fire({
                        title: 'Đã xóa!',
                        text: 'Danh mục đã được xóa thành công.',
                        icon: 'success',
                        customClass: { confirmButton: 'btn btn-success' }
                    });
                    fetchCategories();
                } catch (err) {
                    MySwal.fire({ title: 'Lỗi', text: 'Không thể xóa danh mục này!', icon: 'error' });
                }
            }
        });
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text) => <span className="badge bg-secondary font-weight-bold">#{text}</span>,
            sorter: (a, b) => (a.id || 0) - (b.id || 0),
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            sorter: (a, b) => a.category.localeCompare(b.category),
        },
        {
            title: "Mô tả / Slug",
            dataIndex: "categoryslug",
            sorter: (a, b) => (a.categoryslug || '').localeCompare(b.categoryslug || ''),
        },
        {
            title: "Số lượng món",
            dataIndex: "products_count",
            render: (count) => <span className="badge bg-light text-dark font-weight-bold">{count || 0} món</span>,
            sorter: (a, b) => (a.products_count || 0) - (b.products_count || 0),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdon",
            sorter: (a, b) => (a.createdon || '').localeCompare(b.createdon || ''),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (text, record) => (
                <span
                    className={`badge ${text === 'Active' ? 'badge-linesuccess' : 'badge-linedanger'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleStatusToggle(record)}
                    title="Click để đổi trạng thái"
                >
                    {text}
                </span>
            ),
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: 'Thao tác',
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (
                <td className="action-table-data">
                    <div className="edit-delete-action">
                        <Link
                            className="me-2 p-2"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-category"
                            onClick={() => window.dispatchEvent(new CustomEvent('selectCategoryForEdit', { detail: record }))}
                        >
                            <i data-feather="edit" className="feather-edit"></i>
                        </Link>
                        <Link className="confirm-text p-2" to="#" onClick={(e) => { e.preventDefault(); showConfirmationAlert(record.id); }}>
                            <i data-feather="trash-2" className="feather-trash-2"></i>
                        </Link>
                    </div>
                </td>
            )
        },
    ];

    const filteredData = dataSource.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (item.category && item.category.toLowerCase().includes(q)) ||
               (item.categoryslug && item.categoryslug.toLowerCase().includes(q));
    }).sort((a, b) => {
        if (!selectedSort || selectedSort.value === 'default') return 0;
        if (selectedSort.value === 'idAsc') return (a.id || 0) - (b.id || 0);
        if (selectedSort.value === 'idDesc') return (b.id || 0) - (a.id || 0);
        if (selectedSort.value === 'nameAsc') return (a.category || '').localeCompare(b.category || '');
        if (selectedSort.value === 'nameDesc') return (b.category || '').localeCompare(a.category || '');
        if (selectedSort.value === 'countDesc') return (b.products_count || 0) - (a.products_count || 0);
        return 0;
    });

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Danh mục</h4>
                                <h6>Quản lý danh mục ({filteredData.length} mục)</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <Link to="#">
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                                    <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top">
                                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                                    <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top">
                                        <i data-feather="printer" className="feather-printer" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                                    <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" onClick={(e) => { e.preventDefault(); fetchCategories(); }}>
                                        <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                                    <Link
                                        to="#"
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        id="collapse-header"
                                        className={data ? 'active' : ''}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            dispatch(setToogleHeader(!data));
                                        }}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                        </ul>
                        <div className="page-btn">
                            <Link
                                to="#"
                                className="btn btn-added"
                                data-bs-toggle="modal"
                                data-bs-target="#add-units-category"
                            >
                                <PlusCircle className="me-2 iconsize" />
                                Thêm danh mục mới
                            </Link>
                        </div>
                    </div>
                    {/* /product list */}
                    <div className="card table-list-card">
                        <div className="card-body">
                            <div className="table-top">
                                <div className="search-set">
                                    <div className="search-input">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm danh mục..."
                                            className="form-control form-control-sm formsearch"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Link to="#" className="btn btn-searchset" onClick={(e) => e.preventDefault()}>
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="form-sort">
                                    <Sliders className="info-img" />
                                    <Select
                                        classNamePrefix="react-select"
                                        options={sortOptions}
                                        value={selectedSort}
                                        onChange={(opt) => setSelectedSort(opt)}
                                        placeholder="Sắp xếp"
                                    />
                                </div>
                            </div>
                            <div className="table-responsive">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Đang tải danh sách danh mục từ API...</p>
                                    </div>
                                ) : (
                                    <Table columns={columns} dataSource={filteredData} />
                                )}
                            </div>
                        </div>
                    </div>
                    {/* /product list */}
                </div>
            </div>
            <AddCategoryList />
            <EditCategoryList />
        </div>
    );
};

export default CategoryList;
