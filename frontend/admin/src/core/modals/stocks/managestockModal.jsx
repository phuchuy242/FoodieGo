import React from "react";
import Select from "react-select";
import ImageWithBasePath from "../../img/imagewithbasebath";
import { Link } from "react-router-dom";

const ManageStockModal = () => {
  const options1 = [
    { value: "choose", label: "Choose" },
    { value: "lobarHandy", label: "Lobar Handy" },
    { value: "quaintWarehouse", label: "Quaint Warehouse" },
  ];

  const options2 = [
    { value: "choose", label: "Choose" },
    { value: "selosy", label: "Selosy" },
    { value: "logerro", label: "Logerro" },
  ];

  const options3 = [
    { value: "choose", label: "Choose" },
    { value: "steven", label: "Steven" },
    { value: "gravely", label: "Gravely" },
  ];
  return (
    <>
      {/* Add Stock */}
      <div className="modal fade" id="add-units">
        <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Add Stock</h4>
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
                  <form>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Warehouse</label>
                          <Select className="select" options={options1} />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Shop</label>
                          <Select className="select" options={options2} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Responsible Person</label>
                          <Select className="select" options={options3} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks search-form mb-0">
                          <label>Product</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Select Product"
                          />
                          <i
                            data-feather="search"
                            className="feather-search custom-search"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit">
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Stock */}
      {/* Edit Stock */}
      <div className="modal fade" id="edit-units">
        <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Edit Stock</h4>
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
                  <form>
                    <div className="input-blocks search-form">
                      <label>Product</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Nike Jordan"
                      />
                      <i
                        data-feather="search"
                        className="feather-search custom-search"
                      />
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Warehouse</label>
                          <Select className="select" options={options1} />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Shop</label>
                          <Select className="select" options={options2} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>Responsible Person</label>
                          <Select className="select" options={options3} />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="input-blocks search-form mb-3">
                          <label>Product</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Select Product"
                            defaultValue="Nike Jordan"
                          />
                          <i
                            data-feather="search"
                            className="feather-search custom-search"
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="modal-body-table">
                          <div className="table-responsive">
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>Product</th>
                                  <th>SKU</th>
                                  <th>Category</th>
                                  <th>Qty</th>
                                  <th className="no-sort">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <div className="productimgname">
                                      <Link
                                        to="#"
                                        className="product-img stock-img"
                                      >
                                        <ImageWithBasePath
                                          src="assets/img/products/stock-img-02.png"
                                          alt="product"
                                        />
                                      </Link>
                                      <Link to="#">
                                        Nike Jordan
                                      </Link>
                                    </div>
                                  </td>
                                  <td>PT002</td>
                                  <td>Nike</td>
                                  <td>
                                    <div className="product-quantity">
                                      <span className="quantity-btn">
                                        <i
                                          data-feather="minus-circle"
                                          className="feather-search"
                                        />
                                      </span>
                                      <input
                                        type="text"
                                        className="quntity-input"
                                        defaultValue={2}
                                      />
                                      <span className="quantity-btn">
                                        +
                                        <i
                                          data-feather="plus-circle"
                                          className="plus-circle"
                                        />
                                      </span>
                                    </div>
                                  </td>
                                  <td className="action-table-data">
                                    <div className="edit-delete-action">
                                      <Link
                                        className="me-2 p-2"
                                        to="#"
                                        data-bs-toggle="modal"
                                        data-bs-target="#edit-units"
                                      >
                                        <i
                                          data-feather="edit"
                                          className="feather-edit"
                                        />
                                      </Link>
                                      <Link
                                        className="confirm-text p-2"
                                        to="#"
                                      >
                                        <i
                                          data-feather="trash-2"
                                          className="feather-trash-2"
                                        />
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-submit">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Stock */}
    </>
  );
};

export default ManageStockModal;
