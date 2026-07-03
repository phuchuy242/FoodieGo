import React, { useState } from "react";
import Breadcrumbs from "../../core/breadcrumbs";
import { Filter, Sliders } from "react-feather";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Select from "react-select";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Archive, Box, Calendar, User, Edit, Trash2 } from "react-feather";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Table from "../../core/pagination/datatable";
import StockadjustmentModal from "../../core/modals/stocks/stockadjustmentModal";
import { useSelector } from "react-redux";

const StockAdjustment = () => {
  const data = useSelector((state) => state.managestockdata);

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
    { value: "Choose Warehouse", label: "Choose Warehouse" },
    { value: "Lobar Handy", label: "Lobar Handy" },
    { value: "Quaint Warehouse", label: "Quaint Warehouse" },
    { value: "Traditional Warehouse", label: "Traditional Warehouse" },
    { value: "Cool Warehouse", label: "Cool Warehouse" },
  ];

  const productOptions = [
    { value: "Choose Product", label: "Choose Product" },
    { value: "Nike Jordan", label: "Nike Jordan" },
    { value: "Apple Series 5 Watch", label: "Apple Series 5 Watch" },
    { value: "Amazon Echo Dot", label: "Amazon Echo Dot" },
    { value: "Lobar Handy", label: "Lobar Handy" },
  ];

  const personOptions = [
    { value: "Choose Person", label: "Choose Person" },
    { value: "Steven", label: "Steven" },
    { value: "Gravely", label: "Gravely" },
  ];

  const columns = [
    {
      title: "Warehouse",
      dataIndex: "Warehouse",
      sorter: (a, b) => a.Warehouse.length - b.Warehouse.length,
    },
    {
      title: "Shop",
      dataIndex: "Shop",
      sorter: (a, b) => a.Shop.length - b.Shop.length,
    },
    {
      title: "Product",
      dataIndex: "Product",
      render: (text, record) => (
        <span className="userimgname">
          <Link to="#" className="product-img">
            <ImageWithBasePath alt="img" src={record.Product.Image} />
          </Link>
          <Link to="#">{record.Product.Name}</Link>
        </span>
      ),
      sorter: (a, b) => a.Product.Name.length - b.Product.Name.length,
    },

    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a, b) => a.Email.length - b.Email.length,
    },

    {
      title: "Person",
      dataIndex: "Person",
      render: (text, record) => (
        <span className="userimgname">
          <Link to="#" className="product-img">
            <ImageWithBasePath alt="img" src={record.Person.Image} />
          </Link>
          <Link to="#">{record.Person.Name}</Link>
        </span>
      ),
      sorter: (a, b) => a.Person.Name.length - b.Person.Name.length,
    },

    {
      title: "Notes",
      // dataIndex: "Quantity",
      render: () => (
        <Link
          to="#"
          className="view-note"
          data-bs-toggle="modal"
          data-bs-target="#view-notes"
        >
          View Note
        </Link>
      ),
      sorter: (a, b) => a.Notes.length - b.Notes.length,
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
          maintitle="Stock Adjustment"
          subtitle=" Manage your stock adjustment"
          addButton="Add New"
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
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Archive className="info-img" />
                      <Select
                        className="select"
                        options={warehouseOptions}
                        placeholder="Choose Warehouse"
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Box className="info-img" />
                      <Select
                        className="select"
                        options={productOptions}
                        placeholder="Choose Product"
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
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
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <User className="info-img" />
                      <Select
                        className="select"
                        options={personOptions}
                        placeholder="Choose Person"
                      />
                    </div>
                  </div>
                  <div className="col-lg-4 col-sm-6 col-12 ms-auto">
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
              />
            </div>
          </div>
        </div>
        {/* /product list */}
      </div>
      <StockadjustmentModal />
    </div>
  );
};

export default StockAdjustment;
