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
      label: "Mới nhất",
    },
    {
      value: "oldest",
      label: "Cũ nhất",
    },
  ];

  const roleOptions = [
    {
      value: "",
      label: "Tất cả vai trò",
    },
    {
      value: "admin",
      label: "Quản trị viên",
    },
    {
      value: "customer",
      label: "Khách hàng",
    },
    {
      value: "staff",
      label: "Nhân viên",
    },
    {
      value: "shipper",
      label: "Shipper",
    },
  ];

  const statusOptions = [
    {
      value: "",
      label: "Tất cả trạng thái",
    },
    {
      value: "active",
      label: "Hoạt động",
    },
    {
      value: "inactive",
      label: "Không hoạt động",
    },
  ];

  function getToken() {
    return localStorage.getItem("token");
  }

  function normalizeUser(user) {
    const username =
      user.username ||
      user.user_name ||
      "Not provided";

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

      email: user.email || "Chưa có",
      phone: user.phone_number || "Chưa có",

      role: user.role || "customer",

      points: user.points ?? 0,

      membershipTier:
        user.membership_tier || "Tiêu chuẩn",

      address:
        user.default_address || "Chưa có",

      status: user.is_active
        ? "Hoạt động"
        : "Không hoạt động",

      isActive: Boolean(user.is_active),
      isVerified: Boolean(user.is_verified),
      isStaff: Boolean(user.is_staff),

      createdon: user.created_at || "",
      updatedAt: user.updated_at || "",

      img:
        user.avatar_url ||
        user.avatar ||
        "assets/img/users/default-user.jpg",
    };
  }

  function formatDateTime(value) {
    if (!value) {
      return "Chưa có";
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

      const normalizedUsers = results.map((user) =>
        normalizeUser(user)
      );

      // Client-side keyword filtering: match full name, email, phone or username
      const keyword = (searchKeyword || "").trim().toLowerCase();
      let filteredUsers = normalizedUsers;

      if (keyword) {
        filteredUsers = normalizedUsers.filter((user) => {
          const fullName = (user.fullName || "").toLowerCase();
          const email = (user.email || "").toLowerCase();
          const phone = (user.phone || "").toLowerCase();
          const username = (user.username || "").toLowerCase();

          return (
            fullName.includes(keyword) ||
            email.includes(keyword) ||
            phone.includes(keyword) ||
            username.includes(keyword)
          );
        });
      }

      if (selectedRole) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === selectedRole
        );
      }

      const sortedUsers = [...filteredUsers].sort(
        (firstUser, secondUser) => {
          const firstTime = new Date(
            (firstUser.createdon || "").replace(" ", "T")
          ).getTime();

          const secondTime = new Date(
            (secondUser.createdon || "").replace(" ", "T")
          ).getTime();

          const safeFirstTime = Number.isNaN(firstTime)
            ? 0
            : firstTime;
          const safeSecondTime = Number.isNaN(secondTime)
            ? 0
            : secondTime;

          return sortOrder === "oldest"
            ? safeFirstTime - safeSecondTime
            : safeSecondTime - safeFirstTime;
        }
      );

      setDataSource(sortedUsers);

      setTotalUsers(
        keyword || selectedRole
          ? filteredUsers.length
          : Number(
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
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (
        requestError.response?.status === 403
      ) {
        setError(
          "Bạn không có quyền xem danh sách người dùng."
        );
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            "Không thể tải danh sách người dùng."
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
      title: "Bạn có chắc không?",
      text: `Bạn có muốn xóa ${record.fullName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa",
      cancelButtonText: "Hủy",
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
          title: "Đang xóa...",
          text: "Vui lòng đợi",
          allowOutsideClick: false,
          didOpen: () => {
            MySwal.showLoading();
          },
        });

        await deleteUser(record.id);

        await MySwal.fire({
          icon: "success",
          title: "Đã xóa",
          text: "Xóa người dùng thành công.",
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
          title: "Xóa thất bại",
          text: getApiErrorMessage(
            requestError,
            "Không thể xóa người dùng."
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

  function handleSearchInputChange(event) {
    const nextValue = event.target.value;

    setSearchInput(nextValue);
    setSearchKeyword(nextValue.trim());
    setCurrentPage(1);
  }

  function handleSearchSubmit(event) {
    event?.preventDefault();

    const nextKeyword = searchInput.trim();

    setCurrentPage(1);
    setSearchKeyword(nextKeyword);
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
    setIsFilterVisible((previousValue) => {
      const nextValue = !previousValue;

      // If the filter panel is being closed, reset filters to 'All'
      if (previousValue && !nextValue) {
        handleResetFilter();
      }

      return nextValue;
    });
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
        In
      </Tooltip>
    );
  }

  function renderRefreshTooltip(props) {
    return (
      <Tooltip
        id="refresh-tooltip"
        {...props}
      >
        Làm mới
      </Tooltip>
    );
  }

  function renderCollapseTooltip(props) {
    return (
      <Tooltip
        id="collapse-tooltip"
        {...props}
      >
        Thu gọn
      </Tooltip>
    );
  }

  const columns = [
    {
      title: "Người dùng",
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
      title: "Số điện thoại",
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
      title: "Vai trò",
      dataIndex: "role",

      render: (text) => {
        const roleKey = (text || "customer").toLowerCase();
        const label =
          roleKey === "admin"
            ? "Quản trị viên"
            : roleKey === "staff"
            ? "Nhân viên"
            : roleKey === "shipper"
            ? "Shipper"
            : "Khách hàng";

        return (
          <span className="badge badge-soft-info text-capitalize">
            {label}
          </span>
        );
      },

      sorter: (a, b) =>
        (a.role || "").localeCompare(
          b.role || ""
        ),
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdon",

      render: (value) =>
        formatDateTime(value),

      sorter: (a, b) =>
        new Date(a.createdon || 0) -
        new Date(b.createdon || 0),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",

      render: (text) =>
        text === "Hoạt động" ? (
          <span className="badge badge-linesuccess">
            Hoạt động
          </span>
        ) : (
          <span className="badge badge-linedanger">
            Không hoạt động
          </span>
        ),

      sorter: (a, b) =>
        (a.status || "").localeCompare(
          b.status || ""
        ),
    },

    {
      title: "Hành động",
      key: "actions",

      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              title="Xem người dùng"
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
              title="Chỉnh sửa người dùng"
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
              title="Xóa người dùng"
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
                  Quản lý hồ sơ người dùng
                </h4>

                <h6>
                  Xem và quản lý thông tin hồ sơ người dùng
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
                  Thêm người dùng mới
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
                      onChange={handleSearchInputChange}
                      placeholder="Tìm theo tên người dùng"
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
                        alt="Đóng"
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
                          placeholder="Chọn vai trò"
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
                          placeholder="Chọn trạng thái"
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
                          Tìm kiếm
                        </button>

                        <button
                          type="button"
                          className="btn btn-cancel"
                          onClick={
                            handleResetFilter
                          }
                          disabled={loading}
                        >
                          Đặt lại
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
                    Thử lại
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
                      Đang tải...
                    </span>
                  </div>

                  <p className="mt-3 mb-0">
                    Đang tải người dùng...
                  </p>
                </div>
              ) : !error &&
                dataSource.length === 0 ? (
                <div className="text-center py-5">
                  <User
                    size={48}
                    className="mb-3 text-muted"
                  />

                  <h5>Không tìm thấy người dùng nào</h5>

                  <p className="text-muted mb-0">
                    Thử thay đổi từ khóa
                    hoặc bộ lọc.
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
                        Hiển thị {startItem}–{endItem} trong {totalUsers} người dùng
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
                        Trước
                      </button>

                      <span className="px-2">
                        Trang {currentPage}/
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
                        Tiếp
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