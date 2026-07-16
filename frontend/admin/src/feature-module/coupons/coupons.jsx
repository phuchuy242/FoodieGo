import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { ChevronUp, PlusCircle, RotateCcw, Sliders } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import AddCoupons from '../../core/modals/coupons/addcoupons';
import EditCoupons from '../../core/modals/coupons/editcoupons';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import { API_BASE } from '../../environment';

const Coupons = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.get(`${API_BASE}/api/v1/admin/vouchers/`, { headers });
            const list = res.data?.data?.results || res.data?.data || res.data || [];
            
            if (Array.isArray(list)) {
                const formatted = list.map((v) => ({
                    key: v.id,
                    id: v.id,
                    name: v.description || v.code, // using description as name
                    code: v.code,
                    type: v.discount_type === 'percentage' ? 'Percentage' : 'Fixed',
                    discount: v.discount_type === 'percentage' ? `${parseFloat(v.discount_value)}%` : `${parseFloat(v.discount_value).toLocaleString('vi-VN')} đ`,
                    limit: v.max_usage || '∞',
                    used: v.current_usage || 0,
                    valid: v.end_date ? new Date(v.end_date).toLocaleDateString('vi-VN') : '',
                    is_active: v.is_active,
                    status: v.is_active ? 'Active' : 'Inactive',
                    original: v
                }));
                setDataSource(formatted);
            }
        } catch (err) {
            console.error('Failed to fetch vouchers', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
        const handleRefresh = () => fetchVouchers();
        window.addEventListener('refreshVouchers', handleRefresh);
        return () => window.removeEventListener('refreshVouchers', handleRefresh);
    }, []);

    const MySwal = withReactContent(Swal);

    const handleStatusToggle = async (record) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const nextState = !record.is_active;
            await axios.patch(`${API_BASE}/api/v1/admin/vouchers/${record.id}/`, {
                is_active: nextState
            }, { headers });

            MySwal.fire({
                title: 'Thành công',
                text: `Mã giảm giá đã chuyển sang trạng thái ${nextState ? 'Active' : 'Inactive'}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            fetchVouchers();
        } catch (err) {
            MySwal.fire({ title: 'Lỗi', text: 'Không thể đổi trạng thái mã giảm giá', icon: 'error' });
        }
    };

    const showConfirmationAlert = (id) => {
        MySwal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Mã giảm giá này sẽ bị xóa vĩnh viễn!",
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

                    await axios.delete(`${API_BASE}/api/v1/admin/vouchers/${id}/`, { headers });
                    MySwal.fire({
                        title: 'Đã xóa!',
                        text: 'Mã giảm giá đã được xóa thành công.',
                        icon: 'success',
                        customClass: { confirmButton: 'btn btn-success' }
                    });
                    fetchVouchers();
                } catch (err) {
                    MySwal.fire({ title: 'Lỗi', text: 'Không thể xóa mã giảm giá này!', icon: 'error' });
                }
            }
        });
    };

    const columns = [
        {
            title: "Mã Code",
            dataIndex: "code",
            render: (text) => <span className="badge badge-bgdanger">{text}</span>,
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: "Tên / Mô tả",
            dataIndex: "name",
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: "Loại",
            dataIndex: "type",
            sorter: (a, b) => a.type.localeCompare(b.type),
        },
        {
            title: "Giảm",
            dataIndex: "discount",
            sorter: (a, b) => a.discount.localeCompare(b.discount),
        },
        {
            title: "Giới hạn",
            dataIndex: "limit",
        },
        {
            title: "Đã dùng",
            dataIndex: "used",
        },
        {
            title: "Hạn sử dụng",
            dataIndex: "valid",
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
                            data-bs-target="#edit-units"
                            onClick={() => window.dispatchEvent(new CustomEvent('selectVoucherForEdit', { detail: record.original }))}
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
        return (item.name && item.name.toLowerCase().includes(q)) ||
               (item.code && item.code.toLowerCase().includes(q));
    });

    const renderTooltip = (props) => <Tooltip id="pdf-tooltip" {...props}>Xuất PDF</Tooltip>;
    const renderExcelTooltip = (props) => <Tooltip id="excel-tooltip" {...props}>Xuất Excel</Tooltip>;
    const renderPrinterTooltip = (props) => <Tooltip id="printer-tooltip" {...props}>In</Tooltip>;
    const renderRefreshTooltip = (props) => <Tooltip id="refresh-tooltip" {...props}>Làm mới</Tooltip>;
    const renderCollapseTooltip = (props) => <Tooltip id="collapse-tooltip" {...props}>Thu gọn</Tooltip>;

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Mã giảm giá (Coupons)</h4>
                                <h6>Quản lý danh sách mã giảm giá ({filteredData.length} mã)</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <Link to="#"><ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" /></Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                                    <Link to="#"><ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" /></Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                                    <Link to="#"><i data-feather="printer" className="feather-printer" /></Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                                    <Link to="#" onClick={(e) => { e.preventDefault(); fetchVouchers(); }}><RotateCcw /></Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                                    <Link
                                        to="#"
                                        id="collapse-header"
                                        className={data ? 'active' : ''}
                                        onClick={(e) => { e.preventDefault(); dispatch(setToogleHeader(!data)); }}
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
                                data-bs-target="#add-units"
                            >
                                <PlusCircle className="me-2 iconsize" />
                                Thêm Mã Giảm Giá
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
                                            placeholder="Tìm kiếm mã..."
                                            className="form-control form-control-sm formsearch"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Link to="#" className="btn btn-searchset" onClick={(e) => e.preventDefault()}>
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2 text-muted">Đang tải danh sách từ API...</p>
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
            <AddCoupons />
            <EditCoupons />
        </div>
    );
};

export default Coupons;