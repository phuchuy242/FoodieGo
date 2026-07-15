import React, { useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useDispatch, useSelector } from "react-redux";
import {
  Filter,
  Sliders,
  StopCircle,
  User,
  Zap,
} from "react-feather";
import {
  ChevronUp,
  RotateCcw,
} from "feather-icons-react/build/IconComponents";

import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Table from "../../core/pagination/datatable";
import { setToogleHeader } from "../../core/redux/action";

import AddUsers from "../../core/modals/usermanagement/addusers";
import EditUser from "../../core/modals/usermanagement/edituser";
import ViewUser from "../../core/modals/usermanagement/viewuser";

const API_URL =
  "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/users/";

const PAGE_SIZE = 20;

const Users = () => {
  const dispatch = useDispatch();

  const toggleHeader = useSelector(
    (state) => state.toggle_header
  );

  const MySwal = withReactContent(Swal);

  const [isFilterVisible, setIsFilterVisible] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [dataSource, setDataSource] = useState([]);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [selectedRole, setSelectedRole] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("newest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(PAGE_SIZE);

  const [totalUsers, setTotalUsers] =
    useState(0);

  const sortOptions = [
    {
      value: "newest",
      label: "Newest",
    },
    {
      value: "oldest",
      label: "Oldest",
    },
  ];

  const roleOptions = [
    {
      value: "",
      label: "All Roles",
    },
    {
      value: "admin",
      label: "Admin",
    },
    {
      value: "customer",
      label: "Customer",
    },
    {
      value: "staff",
      label: "Staff",
    },
    {
      value: "shipper",
      label: "Shipper",
    },
  ];

  const statusOptions = [
    {
      value: "",
      label: "All Statuses",
    },
    {
      value: "active",
      label: "Active",
    },
    {
      value: "inactive",
      label: "Inactive",
    },
  ];

  function getToken() {
    return localStorage.getItem("token");
  }

  function normalizeUser(user) {
    const username =
      user.username ||
      user.user_name ||
      (user.email
        ? user.email.split("@")[0]
        : "") ||
      `user_${user.id}`;

    const fullName =
      user.full_name ||
      [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      user.username ||
      user.user_name ||
      user.email ||
      `User ${user.id}`;

    return {
      key: user.id,

      id: user.id,
      uuid: user.uuid || "",

      username,
      userName: user.user_name || username,

      firstName: user.first_name || "",
      lastName: user.last_name || "",
      fullName,

      email: user.email || "Not provided",
      phone: user.phone_number || "Not provided",

      role: user.role || "customer",

      points: user.points ?? 0,

      membershipTier:
        user.membership_tier || "Standard",

      address:
        user.default_address || "Not provided",

      status: user.is_active
        ? "Active"
        : "Inactive",

      isActive: Boolean(user.is_active),
      isVerified: Boolean(user.is_verified),
      isStaff: Boolean(user.is_staff),

      createdon: user.created_at || "",
      updatedAt: user.updated_at || "",

      img:
        user.avatar_url ||
        user.avatar ||
        "assets/img/users/default-user.jpg",//********************** */
    };
  }

  function formatDateTime(value) {
    if (!value) {
      return "Not provided";
    }

    const normalizedValue = value.includes("T")
      ? value
      : value.replace(" ", "T");

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("vi-VN");
  }

  function getApiErrorMessage(
    requestError,
    fallbackMessage
  ) {
    const responseData =
      requestError.response?.data;

    if (typeof responseData?.detail === "string") {
      return responseData.detail;
    }

    if (Array.isArray(responseData?.detail)) {
      return responseData.detail.join(", ");
    }

    return (
      responseData?.msg ||
      responseData?.message ||
      requestError.message ||
      fallbackMessage
    );
  }

  async function fetchUsers() {
    const token = getToken();

    if (!token) {
      setDataSource([]);
      setTotalUsers(0);

      setError(
        "Access token not found. Please sign in again."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }

      if (selectedRole) {
        params.role = selectedRole;
      }

      if (selectedStatus === "active") {
        params.is_active = true;
      }

      if (selectedStatus === "inactive") {
        params.is_active = false;
      }

      if (sortOrder) {
        params.sort = sortOrder;
      }

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        params,
      });

      const responseData =
        res.data?.data || res.data;

      const results = Array.isArray(
        responseData?.results
      )
        ? responseData.results
        : Array.isArray(responseData)
          ? responseData
          : [];

      setDataSource(
        results.map((user) =>
          normalizeUser(user)
        )
      );

      setTotalUsers(
        Number(
          responseData?.total ??
            responseData?.count ??
            results.length
        )
      );

      if (responseData?.page) {
        setCurrentPage(
          Number(responseData.page)
        );
      }

      if (responseData?.limit) {
        setPageSize(
          Number(responseData.limit)
        );
      }
    } catch (requestError) {
      console.error(
        "Fetch users error:",
        requestError
      );

      setDataSource([]);
      setTotalUsers(0);

      if (
        requestError.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (
        requestError.response?.status === 403
      ) {
        setError(
          "You do not have permission to view users."
        );
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            "Unable to load the user list."
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserDetail(userId) {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Access token not found. Please sign in again."
      );
    }

    const res = await axios.get(
      `${API_URL}${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const userData =
      res.data?.data || res.data;

    return normalizeUser(userData);
  }

  async function handleViewUser(record) {
    setSelectedUser(record);
    setDetailLoading(true);

    try {
      const detail =
        await fetchUserDetail(record.id);

      setSelectedUser(detail);
    } catch (requestError) {
      console.error(
        "Get user detail error:",
        requestError
      );

      Swal.fire({
        icon: "error",
        title: "Unable to load user",
        text: getApiErrorMessage(
          requestError,
          "Unable to load user details."
        ),
        customClass: {
          confirmButton: "btn btn-submit",
        },
        buttonsStyling: false,
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleEditUser(record) {
    setSelectedUser(record);
    setDetailLoading(true);

    try {
      const detail =
        await fetchUserDetail(record.id);

      setSelectedUser(detail);
    } catch (requestError) {
      console.error(
        "Get user detail error:",
        requestError
      );

      Swal.fire({
        icon: "error",
        title: "Unable to load user",
        text: getApiErrorMessage(
          requestError,
          "Unable to load user details."
        ),
        customClass: {
          confirmButton: "btn btn-submit",
        },
        buttonsStyling: false,
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function deleteUser(userId) {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Access token not found. Please sign in again."
      );
    }

    await axios.delete(
      `${API_URL}${userId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
  }

  function showDeleteConfirmation(record) {
    MySwal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${record.fullName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "btn btn-submit me-2",
        cancelButton: "btn btn-cancel",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (!result.isConfirmed) {
        return;
      }

      try {
        MySwal.fire({
          title: "Deleting...",
          text: "Please wait",
          allowOutsideClick: false,
          didOpen: () => {
            MySwal.showLoading();
          },
        });

        await deleteUser(record.id);

        await MySwal.fire({
          icon: "success",
          title: "Deleted",
          text: "User deleted successfully.",
          customClass: {
            confirmButton:
              "btn btn-submit",
          },
          buttonsStyling: false,
        });

        if (
          dataSource.length === 1 &&
          currentPage > 1
        ) {
          setCurrentPage(
            (previousPage) =>
              previousPage - 1
          );
        } else {
          fetchUsers();
        }
      } catch (requestError) {
        console.error(
          "Delete user error:",
          requestError
        );

        MySwal.fire({
          icon: "error",
          title: "Delete failed",
          text: getApiErrorMessage(
            requestError,
            "Unable to delete user."
          ),
          customClass: {
            confirmButton:
              "btn btn-submit",
          },
          buttonsStyling: false,
        });
      }
    });
  }

  useEffect(() => {
    fetchUsers();
  }, [
    currentPage,
    pageSize,
    searchKeyword,
    selectedRole,
    selectedStatus,
    sortOrder,
  ]);

  function handleSearchSubmit(event) {
    event?.preventDefault();

    setCurrentPage(1);
    setSearchKeyword(searchInput.trim());
  }

  function handleResetFilter() {
    setSearchInput("");
    setSearchKeyword("");
    setSelectedRole("");
    setSelectedStatus("");
    setSortOrder("newest");
    setCurrentPage(1);
  }

  function toggleFilterVisibility() {
    setIsFilterVisible(
      (previousValue) => !previousValue
    );
  }

  function renderPdfTooltip(props) {
    return (
      <Tooltip
        id="pdf-tooltip"
        {...props}
      >
        PDF
      </Tooltip>
    );
  }

  function renderExcelTooltip(props) {
    return (
      <Tooltip
        id="excel-tooltip"
        {...props}
      >
        Excel
      </Tooltip>
    );
  }

  function renderPrinterTooltip(props) {
    return (
      <Tooltip
        id="printer-tooltip"
        {...props}
      >
        Printer
      </Tooltip>
    );
  }

  function renderRefreshTooltip(props) {
    return (
      <Tooltip
        id="refresh-tooltip"
        {...props}
      >
        Refresh
      </Tooltip>
    );
  }

  function renderCollapseTooltip(props) {
    return (
      <Tooltip
        id="collapse-tooltip"
        {...props}
      >
        Collapse
      </Tooltip>
    );
  }

  const columns = [
    {
      title: "User",
      dataIndex: "fullName",

      render: (text, record) => (
        <span className="userimgname">
          <Link
            to="#"
            className="userslist-img bg-img"
            data-bs-toggle="modal"
            data-bs-target="#view-user"
            onClick={() =>
              handleViewUser(record)
            }
          >
            {/* <ImageWithBasePath
              alt="User"
              src={record.img}
            /> */}
            <img
              src={record.img}
              alt="User"
              className="product-img"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
            }}
/>
          </Link>

          <div>
            <Link
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#view-user"
              onClick={() =>
                handleViewUser(record)
              }
            >
              {text}
            </Link>

            <div className="text-muted fs-12">
              @{record.username}
            </div>
          </div>
        </span>
      ),

      sorter: (a, b) =>
        (a.fullName || "").localeCompare(
          b.fullName || ""
        ),
    },

    {
      title: "Phone",
      dataIndex: "phone",

      sorter: (a, b) =>
        (a.phone || "").localeCompare(
          b.phone || ""
        ),
    },

    {
      title: "Email",
      dataIndex: "email",

      sorter: (a, b) =>
        (a.email || "").localeCompare(
          b.email || ""
        ),
    },

    {
      title: "Role",
      dataIndex: "role",

      render: (text) => (
        <span className="badge badge-soft-info text-capitalize">
          {text || "customer"}
        </span>
      ),

      sorter: (a, b) =>
        (a.role || "").localeCompare(
          b.role || ""
        ),
    },

    {
      title: "Created On",
      dataIndex: "createdon",

      render: (value) =>
        formatDateTime(value),

      sorter: (a, b) =>
        new Date(a.createdon || 0) -
        new Date(b.createdon || 0),
    },

    {
      title: "Status",
      dataIndex: "status",

      render: (text) =>
        text === "Active" ? (
          <span className="badge badge-linesuccess">
            Active
          </span>
        ) : (
          <span className="badge badge-linedanger">
            Inactive
          </span>
        ),

      sorter: (a, b) =>
        (a.status || "").localeCompare(
          b.status || ""
        ),
    },

    {
      title: "Actions",
      key: "actions",

      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              title="View User"
              data-bs-toggle="modal"
              data-bs-target="#view-user"
              onClick={() =>
                handleViewUser(record)
              }
            >
              <i
                data-feather="eye"
                className="feather feather-eye action-eye"
              />
            </Link>

            <Link
              className="me-2 p-2"
              to="#"
              title="Edit User"
              data-bs-toggle="modal"
              data-bs-target="#edit-units"
              onClick={() =>
                handleEditUser(record)
              }
            >
              <i
                data-feather="edit"
                className="feather-edit"
              />
            </Link>

            <Link
              className="confirm-text p-2"
              to="#"
              title="Delete User"
              onClick={() =>
                showDeleteConfirmation(record)
              }
            >
              <i
                data-feather="trash-2"
                className="feather-trash-2"
              />
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const totalPages = Math.max(
    1,
    Math.ceil(totalUsers / pageSize)
  );

  const startItem =
    totalUsers === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const endItem = Math.min(
    currentPage * pageSize,
    totalUsers
  );

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>
                  User Profile Management
                </h4>

                <h6>
                  View and manage user profile
                  information
                </h6>
              </div>
            </div>

            <ul className="table-top-head">
              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={renderPdfTooltip}
                >
                  <Link to="#">
                    <ImageWithBasePath
                      src="assets/img/icons/pdf.svg"
                      alt="PDF"
                    />
                  </Link>
                </OverlayTrigger>
              </li>

              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    renderExcelTooltip
                  }
                >
                  <Link to="#">
                    <ImageWithBasePath
                      src="assets/img/icons/excel.svg"
                      alt="Excel"
                    />
                  </Link>
                </OverlayTrigger>
              </li>

              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    renderPrinterTooltip
                  }
                >
                  <Link to="#">
                    <i
                      data-feather="printer"
                      className="feather-printer"
                    />
                  </Link>
                </OverlayTrigger>
              </li>

              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    renderRefreshTooltip
                  }
                >
                  <Link
                    to="#"
                    onClick={fetchUsers}
                  >
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>

              <li>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    renderCollapseTooltip
                  }
                >
                  <Link
                    to="#"
                    id="collapse-header"
                    className={
                      toggleHeader
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      dispatch(
                        setToogleHeader(
                          !toggleHeader
                        )
                      )
                    }
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
                <i
                  data-feather="plus-circle"
                  className="me-2"
                />
                Add New User
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <form
                    className="search-input"
                    onSubmit={
                      handleSearchSubmit
                    }
                  >
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(event) =>
                        setSearchInput(
                          event.target.value
                        )
                      }
                      placeholder="Search name, email or phone"
                      className="form-control form-control-sm formsearch"
                    />

                    <button
                      type="submit"
                      className="btn btn-searchset"
                      disabled={loading}
                    >
                      <i
                        data-feather="search"
                        className="feather-search"
                      />
                    </button>
                  </form>
                </div>

                <div className="search-path">
                  <Link
                    to="#"
                    className={`btn btn-filter ${
                      isFilterVisible
                        ? "setclose"
                        : ""
                    }`}
                    id="filter_search"
                    onClick={
                      toggleFilterVisibility
                    }
                  >
                    <Filter className="filter-icon" />

                    <span>
                      <ImageWithBasePath
                        src="assets/img/icons/closes.svg"
                        alt="Close"
                      />
                    </span>
                  </Link>
                </div>

                <div className="form-sort">
                  <Sliders className="info-img" />

                  <Select
                    className="select"
                    options={sortOptions}
                    value={
                      sortOptions.find(
                        (option) =>
                          option.value ===
                          sortOrder
                      ) || sortOptions[0]
                    }
                    onChange={(option) => {
                      setSortOrder(
                        option?.value ||
                          "newest"
                      );

                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div
                className={`card${
                  isFilterVisible
                    ? " visible"
                    : ""
                }`}
                id="filter_inputs"
                style={{
                  display:
                    isFilterVisible
                      ? "block"
                      : "none",
                }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Zap className="info-img" />

                        <Select
                          className="select"
                          options={roleOptions}
                          value={
                            roleOptions.find(
                              (option) =>
                                option.value ===
                                selectedRole
                            ) ||
                            roleOptions[0]
                          }
                          onChange={(option) => {
                            setSelectedRole(
                              option?.value || ""
                            );

                            setCurrentPage(1);
                          }}
                          placeholder="Choose Role"
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="input-blocks">
                        <StopCircle className="info-img" />

                        <Select
                          className="select"
                          options={
                            statusOptions
                          }
                          value={
                            statusOptions.find(
                              (option) =>
                                option.value ===
                                selectedStatus
                            ) ||
                            statusOptions[0]
                          }
                          onChange={(option) => {
                            setSelectedStatus(
                              option?.value || ""
                            );

                            setCurrentPage(1);
                          }}
                          placeholder="Choose Status"
                        />
                      </div>
                    </div>

                    <div className="col-lg-4 col-sm-12 col-12">
                      <div className="input-blocks d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-filters"
                          onClick={
                            handleSearchSubmit
                          }
                          disabled={loading}
                        >
                          <i
                            data-feather="search"
                            className="feather-search"
                          />
                          Search
                        </button>

                        <button
                          type="button"
                          className="btn btn-cancel"
                          onClick={
                            handleResetFilter
                          }
                          disabled={loading}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  className="alert alert-danger d-flex justify-content-between align-items-center"
                  role="alert"
                >
                  <span>{error}</span>

                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={fetchUsers}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>

                  <p className="mt-3 mb-0">
                    Loading users...
                  </p>
                </div>
              ) : !error &&
                dataSource.length === 0 ? (
                <div className="text-center py-5">
                  <User
                    size={48}
                    className="mb-3 text-muted"
                  />

                  <h5>No users found</h5>

                  <p className="text-muted mb-0">
                    Try changing the keyword
                    or filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table
                      columns={columns}
                      dataSource={
                        dataSource
                      }
                      pagination={false}
                    />
                  </div>

                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
                    <p className="mb-0 text-muted">
                      Showing {startItem}–
                      {endItem} of{" "}
                      {totalUsers} users
                    </p>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={
                          loading ||
                          currentPage <= 1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (previousPage) =>
                              previousPage -
                              1
                          )
                        }
                      >
                        Previous
                      </button>

                      <span className="px-2">
                        Page {currentPage}/
                        {totalPages}
                      </span>

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={
                          loading ||
                          currentPage >=
                            totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (previousPage) =>
                              previousPage +
                              1
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddUsers onCreated={fetchUsers} />

      <ViewUser
        selectedUser={selectedUser}
        loading={detailLoading}
      />

      <EditUser
        selectedUser={selectedUser}
        loadingDetail={detailLoading}
        onUpdated={fetchUsers}
      />
    </div>
  );
};

export default Users;