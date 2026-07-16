import React from "react";
import ImageWithBasePath from "../../img/imagewithbasebath";

const ViewUser = ({
  selectedUser,
  loading = false,
}) => {
  const user = selectedUser || {};

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

  return (
    <div
      className="modal fade"
      id="view-user"
    >
      <div className="modal-dialog modal-dialog-centered custom-modal-two modal-lg">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Chi tiết hồ sơ người dùng</h4>

                  <p className="mb-0 text-muted">
                    Xem thông tin cá nhân và tài khoản
                  </p>
                </div>

                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>

              <div className="modal-body custom-modal-body">
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
                      Đang tải thông tin người dùng...
                    </p>
                  </div>
                ) : !selectedUser ? (
                  <div className="alert alert-warning mb-0">
                    Không có thông tin người dùng.
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="avatar avatar-xxl mx-auto mb-3">
                        <ImageWithBasePath
                          src={
                            user.img ||
                            "assets/img/users/user-15.jpg"
                          }
                          alt="User"
                          className="rounded-circle"
                        />
                      </div>

                      <h5 className="mb-1">
                        {user.fullName ||
                          "Chưa có"}
                      </h5>

                      <p className="text-muted mb-2">
                        @
                        {user.username ||
                          "không xác định"}
                      </p>

                      {user.isActive ? (
                        <span className="badge badge-linesuccess">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="badge badge-linedanger">
                          Không hoạt động
                        </span>
                      )}
                    </div>

                    <div className="card mb-0">
                      <div className="card-body">
                        <div className="row">
                          <ProfileItem
                            label="Mã người dùng"
                            value={user.id}
                          />

                          <ProfileItem
                            label="Tên đăng nhập"
                            value={
                              user.username
                            }
                          />

                          <ProfileItem
                            label="Tên"
                            value={
                              user.firstName
                            }
                          />

                          <ProfileItem
                            label="Họ"
                            value={
                              user.lastName
                            }
                          />

                          <ProfileItem
                            label="Họ và tên"
                            value={
                              user.fullName
                            }
                          />

                          <ProfileItem
                            label="Email"
                            value={user.email}
                          />

                          <ProfileItem
                            label="Số điện thoại"
                            value={user.phone}
                          />

                          <ProfileItem
                            label="Vai trò"
                            value={user.role}
                            capitalize
                          />

                          <ProfileItem
                            label="Hạng thành viên"
                            value={
                              user.membershipTier
                            }
                          />

                          <ProfileItem
                            label="Điểm"
                            value={
                              user.points ?? 0
                            }
                          />

                          <ProfileItem
                            label="Đã xác minh"
                            value={
                              user.isVerified
                                ? "Có"
                                : "Không"
                            }
                          />

                          <ProfileItem
                            label="Tài khoản nhân viên"
                            value={
                              user.isStaff
                                ? "Có"
                                : "Không"
                            }
                          />

                          <ProfileItem
                            label="Ngày tạo"
                            value={formatDateTime(
                              user.createdon
                            )}
                          />

                          <ProfileItem
                            label="Cập nhật"
                            value={formatDateTime(
                              user.updatedAt
                            )}
                          />

                          <div className="col-lg-12">
                            <div className="mb-0">
                              <p className="text-muted mb-1">
                                Địa chỉ mặc định
                              </p>

                              <h6 className="mb-0">
                                {user.address ||
                                  "Chưa có"}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="modal-footer-btn">
                  <button
                    type="button"
                    className="btn btn-cancel"
                    data-bs-dismiss="modal"
                  >
                    Đóng
                  </button>

                  <button
                    type="button"
                    className="btn btn-submit"
                    data-bs-dismiss="modal"
                    data-bs-toggle="modal"
                    data-bs-target="#edit-units"
                    disabled={
                      loading ||
                      !selectedUser
                    }
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({
  label,
  value,
  capitalize = false,
}) => {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "Chưa có"
      : value;

  return (
    <div className="col-md-6">
      <div className="mb-3">
        <p className="text-muted mb-1">
          {label}
        </p>

        <h6
          className={`mb-0 ${
            capitalize
              ? "text-capitalize"
              : ""
          }`}
        >
          {displayValue}
        </h6>
      </div>
    </div>
  );
};

export default ViewUser;