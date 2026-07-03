import React, { useState } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Filter, Sliders } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Select from "react-select";
import { Link } from "react-router-dom";
import { Archive, Calendar, User, Trash2, Edit } from "react-feather";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StockTransferModal from "../../core/modals/stocks/stocktransferModal";
import { useSelector } from "react-redux";
import Table from "../../core/pagination/datatable";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const StockTransfer = () => {
  const data = useSelector((state) => state.stocktransferdata);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prevVisibility) => !prevVisibility);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const options = [
    { value: "sortByDate", label: "Sort by Date" },
    { value: "140923", label: "14 09 23" },
    { value: "110923", label: "11 09 23" },
  ];

  const warehouseOptions = [
    { value: "Lobar Handy", label: "Lobar Handy" },
    { value: "Quaint Warehouse", label: "Quaint Warehouse" },
    { value: "Traditional Warehouse", label: "Traditional Warehouse" },
    { value: "Cool Warehouse", label: "Cool Warehouse" },
  ];

  const destinationOptions = [
    { value: "Selosy", label: "Selosy" },
    { value: "Logerro", label: "Logerro" },
    { value: "Vesloo", label: "Vesloo" },
    { value: "Crompy", label: "Crompy" },
  ];

  const columns = [
    {
      title: "From Warehouse",
      dataIndex: "fromWarehouse",
      sorter: (a, b) => a.fromWarehouse.length - b.fromWarehouse.length,
    },
    {
      title: "To Warehouse",
      dataIndex: "toWarehouse",
      sorter: (a, b) => a.toWarehouse.length - b.toWarehouse.length,
    },
    {
      title: "No Of Products",
      dataIndex: "noOfProducts",
      sorter: (a, b) => a.noOfProducts.length - b.noOfProducts.length,
    },

    {
      title: "Quantity Transferred",
      dataIndex: "quantityTransferred",
      sorter: (a, b) =>
        a.quantityTransferred.length - b.quantityTransferred.length,
    },

    {
      title: "Ref Number",
      dataIndex: "refNumber",
      sorter: (a, b) => a.refNumber.length - b.refNumber.length,
    },

    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => a.date.length - b.date.length,
    },

    {
      title: "Action",
      dataIndex: "action",
      render: () => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <div className="input-block add-lists"></div>

            <Link
              className="me-2 p-2"
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
            >
              <Edit className="feather-edit" />
            </Link>

            <Link
              className="confirm-text p-2"
              to="#"
              onClick={showConfirmationAlert}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
      sorter: (a, b) => a.createdby.length - b.createdby.length,
    },
  ];

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else {
        MySwal.close();
      }
    });
  };
  return (
    <div className="page-wrapper">
      <div className="content">
        <Breadcrumbs
          maintitle="Stock Transfer"
          subtitle="Manage your stock transfer"
          addButton="Add New"
          importbutton="Import Transfer"
        />
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
                <Link
                  className={`btn btn-filter ${
                    isFilterVisible ? "setclose" : ""
                  }`}
                  id="filter_search"
                >
                  <Filter
                    className="filter-icon"
                    onClick={toggleFilterVisibility}
                  />
                  <span onClick={toggleFilterVisibility}>
                    <ImageWithBasePath
                      src="assets/img/icons/closes.svg"
                      alt="img"
                    />
                  </span>
                </Link>
              </div>
              <div className="form-sort stylewidth">
                <Sliders className="info-img" />

                <Select
                  className="select "
                  options={options}
                  placeholder="Sort by Date"
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
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Archive className="info-img" />
                      <Select
                        className="select"
                        options={warehouseOptions}
                        placeholder="Warehouse From"
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <User className="info-img" />
                      <Select
                        className="select"
                        options={destinationOptions}
                        placeholder="Warehouse To"
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Calendar className="info-img" />
                      <div className="input-groupicon">
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Choose Date"
                          className="datetimepicker"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                    <div className="input-blocks">
                      <a className="btn btn-filters ms-auto">
                        {" "}
                        <i
                          data-feather="search"
                          className="feather-search"
                        />{" "}
                        Search{" "}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Filter */}
            <div className="table-responsive">
              <Table
                className="table datanew"
                columns={columns}
                dataSource={data}

                // pagination={true}
              />
            </div>
          </div>
        </div>
        {/* /product list */}
      </div>
      <StockTransferModal />
    </div>
  );
};

export default StockTransfer;
