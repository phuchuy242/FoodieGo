import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { ChevronUp, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { setToogleHeader } from '../../core/redux/action';
import { Sliders } from 'react-feather';
import Select from 'react-select';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from "../../core/pagination/datatable";

const DeleteAccount = () => {

    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const dataSource = useSelector((state) => state.deleteaccount_data);
    const renderTooltip = (props) => (
        <Tooltip id="pdf-tooltip" {...props}>
            PDF
        </Tooltip>
    );
    const renderExcelTooltip = (props) => (
        <Tooltip id="excel-tooltip" {...props}>
            Excel
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
    )
    const oldandlatestvalue = [
        { value: "date", label: "Sắp xếp theo ngày" },
        { value: "newest", label: "Mới nhất" },
        { value: "oldest", label: "Cũ nhất" },
    ];

    const columns = [
        {
            title: "Tên người dùng",
            dataIndex: "username",
            render: (text, record) => (
                <span className="userimgname">
                    <Link to="/profile">
                        <ImageWithBasePath alt="ảnh người dùng" src={record.img} className='product-img' />
                    </Link>
                    <Link to="/profile">{text}</Link>
                </span>
            ),
            sorter: (a, b) => a.username.length - b.username.length,
        },
       
        {
            title: "Ngày yêu cầu",
            dataIndex: "requisitiondate",
            sorter: (a, b) => a.requisitiondate.length - b.requisitiondate.length,
        },
        {
            title: "Ngày xóa yêu cầu",
            dataIndex: "deleterequisitiondate",
            sorter: (a, b) => a.deleterequisitiondate.length - b.deleterequisitiondate.length,
        },
        {
            title: "Hành động",
            dataIndex: "actions",
            key: "actions",
            render: () => (
                <td className="action-table-data">
                    <div className="edit-delete-action">
                        <Link className="confirm-text p-2" to="#" onClick={showConfirmationAlert}>
                            <i
                                data-feather="trash-2"
                                className="feather-trash-2"
                            ></i>
                        </Link>
                    </div>
                </td>
            ),
        },
    ];
    const MySwal = withReactContent(Swal);

    const showConfirmationAlert = () => {
        MySwal.fire({
            title: 'Bạn có chắc không?',
            text: 'Hành động này không thể hoàn tác.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: 'Có, xóa',
            cancelButtonColor: '#ff0000',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'btn btn-submit me-2',
                cancelButton: 'btn btn-cancel',
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {

                MySwal.fire({
                    title: 'Đã xóa!',
                    text: 'Yêu cầu xóa đã được xử lý.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-success',
                    },
                    buttonsStyling: false,
                });
            } else {
                MySwal.close();
            }

        });
    };
    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Yêu cầu xóa tài khoản</h4>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={renderTooltip}>
                                    <Link>
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
                                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
                                        <i data-feather="printer"/>
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>

                                    <Link data-bs-toggle="tooltip" data-bs-placement="top">
                                        <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>

                                    <Link
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        id="collapse-header"
                                        className={data ? "active" : ""}
                                        onClick={() => { dispatch(setToogleHeader(!data)) }}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                        </ul>
                    </div>
                    {/* /product list */}
                    <div className="card table-list-card">
                        <div className="card-body pb-0">
                            <div className="table-top table-top-two">
                                <div className="search-input">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm"
                                        className="form-control form-control-sm formsearch"
                                    />
                                    <Link to className="btn btn-searchset">
                                        <i data-feather="search" className="feather-search" />
                                    </Link>
                                </div>
                                <div className="search-path d-flex align-items-center search-path-new">
                                    <div className="form-sort">
                                        <Sliders className="info-img" />
                                        <Select
                                            className="select"
                                            options={oldandlatestvalue}
                                            placeholder="Mới nhất"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                            <Table columns={columns} dataSource={dataSource} />

                            </div>
                        </div>
                    </div>
                    {/* /product list */}
                </div>
            </div>
        </div>
    )
}

export default DeleteAccount
