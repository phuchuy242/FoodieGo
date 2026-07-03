import React, { useState } from 'react'
import ImageWithBasePath from '../../core/img/imagewithbasebath'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronUp, Download, Eye, File, Filter, PlusCircle, RotateCcw, Sliders, StopCircle, User } from 'feather-icons-react/build/IconComponents';
import { setToogleHeader } from '../../core/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import AddPurchases from '../../core/modals/purchases/addpurchases';
import ImportPurchases from '../../core/modals/purchases/importpurchases';
import EditPurchases from '../../core/modals/purchases/editpurchases';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';

const PurchasesList = () => {

    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const toggleFilterVisibility = () => {
        setIsFilterVisible((prevVisibility) => !prevVisibility);
    };
    const oldandlatestvalue = [
        { value: 'date', label: 'Sort by Date' },
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
    ];

    const suppliername = [
        { value: 'chooseSupplier', label: 'Choose Supplier Name' },
        { value: 'apexComputers', label: 'Apex Computers' },
        { value: 'beatsHeadphones', label: 'Beats Headphones' },
        { value: 'dazzleShoes', label: 'Dazzle Shoes' },
        { value: 'bestAccessories', label: 'Best Accessories' },
      ];
      const status = [
        { value: 'chooseStatus', label: 'Choose Status' },
        { value: 'received', label: 'Received' },
        { value: 'ordered', label: 'Ordered' },
        { value: 'pending', label: 'Pending' },
      ];
      const refrencecode = [
        { value: 'enterReference', label: 'Enter Reference' },
        { value: 'PT001', label: 'PT001' },
        { value: 'PT002', label: 'PT002' },
        { value: 'PT003', label: 'PT003' },
      ];
      const paymentstatus = [
        { value: 'choosePaymentStatus', label: 'Choose Payment Status' },
        { value: 'paid', label: 'Paid' },
        { value: 'partial', label: 'Partial' },
        { value: 'unpaid', label: 'Unpaid' },
      ];
    const renderTooltip = (props) => (
        <Tooltip id="pdf-tooltip" {...props}>
            Pdf
        </Tooltip>
    );
    const renderExcelTooltip = (props) => (
        <Tooltip id="excel-tooltip" {...props}>
            Excel
        </Tooltip>
    );
    const renderPrinterTooltip = (props) => (
        <Tooltip id="printer-tooltip" {...props}>
            Printer
        </Tooltip>
    );
    const renderRefreshTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Refresh
        </Tooltip>
    );
    const renderCollapseTooltip = (props) => (
        <Tooltip id="refresh-tooltip" {...props}>
            Collapse
        </Tooltip>
    );
    const MySwal = withReactContent(Swal);

    const showConfirmationAlert = () => {
        MySwal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonColor: '#ff0000',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {

                MySwal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    className: "btn btn-success",
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'btn btn-success',
                    },
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
                    <div className="page-header transfer">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Purchase List</h4>
                                <h6>Manage your purchases</h6>
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
                                        <i data-feather="printer" className="feather-printer" />
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
                        <div className="d-flex purchase-pg-btn">
                            <div className="page-btn">
                                <Link
                                    to="#"
                                    className="btn btn-added"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add-units"
                                >
                                    
                                    <PlusCircle className="me-2"/> 
                                    Add New Purchase
                                </Link>
                            </div>
                            <div className="page-btn import">
                                <Link
                                    to="#"
                                    className="btn btn-added color"
                                    data-bs-toggle="modal"
                                    data-bs-target="#view-notes"
                                >
                                  
                                    <Download  className="me-2"/>
                                    Import Purchase
                                </Link>
                            </div>
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
                                            placeholder="Search"
                                            className="form-control form-control-sm formsearch"
                                        />
                                        <Link to className="btn btn-searchset">
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="search-path">
                                    <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`} id="filter_search">
                                        <Filter
                                            className="filter-icon"
                                            onClick={toggleFilterVisibility}
                                        />
                                        <span onClick={toggleFilterVisibility}>
                                            <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                                        </span>
                                    </Link>
                                </div>
                                <div className="form-sort">
                                <Sliders className="info-img" />
                                <Select
                                    className="select"
                                    options={oldandlatestvalue}
                                    placeholder="Newest"
                                />
                                </div>
                            </div>
                            {/* /Filter */}
                            <div
                                className={`card${isFilterVisible ? " visible" : ""}`}
                                id="filter_inputs"
                                style={{ display: isFilterVisible ? "block" : "none" }}
                            >
                                <div className="card-body pb-0">
                                    <div className="row">
                                        <div className="col-lg-2 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <User className="info-img"/>
                                                <Select options={suppliername} className="select" placeholder="Choose Supplier Name" />

                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <StopCircle  className="info-img"/>
                                                <Select options={status} className="select" placeholder="Choose Status" />

                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <File className="info-img"/>
                                                <Select options={refrencecode} className="select" placeholder="Enter Reference" />

                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <i className="fas fa-money-bill info-img" />
                                                <Select options={paymentstatus} className="select" placeholder="Choose Payment Status" />

                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-sm-6 col-12 ms-auto">
                                            <div className="input-blocks">
                                                <Link className="btn btn-filters ms-auto">
                                                    {" "}
                                                    <i data-feather="search" className="feather-search" />{" "}
                                                    Search{" "}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* /Filter */}
                            <div className="table-responsive product-list">
                                <table className="table  datanew list">
                                    <thead>
                                        <tr>
                                            <th className="no-sort">
                                                <label className="checkboxs">
                                                    <input type="checkbox" id="select-all" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </th>
                                            <th>Supplier Name</th>
                                            <th>Reference</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Grand Total</th>
                                            <th>Paid</th>
                                            <th>Due</th>
                                            <th>Created by</th>
                                            <th className="no-sort">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Apex Computers</td>
                                            <td>PT001 </td>
                                            <td>19 Jan 2023</td>
                                            <td>
                                                <span className="badges status-badge">Received</span>
                                            </td>
                                            <td>$550</td>
                                            <td>$550</td>
                                            <td>$0.00</td>
                                            <td>
                                                <span className="badge-linesuccess">Paid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                        <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#" onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Beats Headphones</td>
                                            <td>PT002 </td>
                                            <td>27 Jan 2023</td>
                                            <td>
                                                <span className="badges status-badge">Received</span>
                                            </td>
                                            <td>$370</td>
                                            <td>$370</td>
                                            <td>$0.00</td>
                                            <td>
                                                <span className="badge-linesuccess">Paid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Dazzle Shoes</td>
                                            <td>PT003 </td>
                                            <td>08 Feb 2023</td>
                                            <td>
                                                <span className="badges status-badge ordered">Ordered</span>
                                            </td>
                                            <td>$400</td>
                                            <td>$400</td>
                                            <td>$200</td>
                                            <td>
                                                <span className="badges-warning">Partial</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Best Accessories</td>
                                            <td>PT004 </td>
                                            <td>16 Feb 2023</td>
                                            <td>
                                                <span className="badges unstatus-badge">Pending</span>
                                            </td>
                                            <td>$560</td>
                                            <td>$0.00</td>
                                            <td>$560</td>
                                            <td>
                                                <span className="badge badge-linedangered">Unpaid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>A-Z Store</td>
                                            <td>PT005</td>
                                            <td>12 Mar 2023</td>
                                            <td>
                                                <span className="badges unstatus-badge">Pending</span>
                                            </td>
                                            <td>$240</td>
                                            <td>$0.00</td>
                                            <td>$240</td>
                                            <td>
                                                <span className="badge badge-linedangered">Unpaid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Hatimi Hardwares</td>
                                            <td>PT006</td>
                                            <td>24 Mar 2023</td>
                                            <td>
                                                <span className="badges status-badge">Received</span>
                                            </td>
                                            <td>$170</td>
                                            <td>$170</td>
                                            <td>$0.00</td>
                                            <td>
                                                <span className="badge-linesuccess">Paid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Aesthetic Bags</td>
                                            <td>PT007</td>
                                            <td>06 Apr 2023</td>
                                            <td>
                                                <span className="badges unstatus-badge">Pending</span>
                                            </td>
                                            <td>$230</td>
                                            <td>$0.00</td>
                                            <td>$230</td>
                                            <td>
                                                <span className="badge badge-linedangered">Unpaid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Alpha Mobiles</td>
                                            <td>PT008</td>
                                            <td>14 Apr 2023</td>
                                            <td>
                                                <span className="badges status-badge ordered">Ordered</span>
                                            </td>
                                            <td>$300</td>
                                            <td>$150</td>
                                            <td>$300</td>
                                            <td>
                                                <span className="badges-warning">Partial</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Sigma Chairs</td>
                                            <td>PT009</td>
                                            <td>02 May 2023</td>
                                            <td>
                                                <span className="badges unstatus-badge">Pending</span>
                                            </td>
                                            <td>$620</td>
                                            <td>$0.00</td>
                                            <td>$620</td>
                                            <td>
                                                <span className="badge badge-linedangered">Unpaid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="checkboxs">
                                                    <input type="checkbox" />
                                                    <span className="checkmarks" />
                                                </label>
                                            </td>
                                            <td>Zenith Bags</td>
                                            <td>PT010</td>
                                            <td>23 May 2023</td>
                                            <td>
                                                <span className="badges status-badge">Received</span>
                                            </td>
                                            <td>$200</td>
                                            <td>$200</td>
                                            <td>$0.00</td>
                                            <td>
                                                <span className="badge-linesuccess">Paid</span>
                                            </td>
                                            <td className="action-table-data">
                                                <div className="edit-delete-action">
                                                    <Link className="me-2 p-2" to="#">
                                                    <Eye className="action-eye"/>
                                                    </Link>
                                                    <Link
                                                        className="me-2 p-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#edit-units"
                                                    >
                                                        <i data-feather="edit" className="feather-edit" />
                                                    </Link>
                                                    <Link className="confirm-text p-2" to="#"  onClick={showConfirmationAlert}>
                                                        <i data-feather="trash-2" className="feather-trash-2" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* /product list */}
                </div>
            </div>
        <AddPurchases />
        <ImportPurchases />
        <EditPurchases />
        </div>
    )
}

export default PurchasesList
