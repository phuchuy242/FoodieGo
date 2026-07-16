import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";

const API_URL =
  "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/users/";

const DEFAULT_AVATAR =
  "/assets/img/users/default-user.jpg";

const emptyForm = {
  username: "",
  firstName: "",
  lastName: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  role: "customer",
  isActive: true,
  avatarUrl: "",
};

const EditUser = ({
  selectedUser,
  loadingDetail = false,
  onUpdated,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [originalData, setOriginalData] =
    useState(emptyForm);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    {
      value: "customer",
      label: "Khách hàng",
    },
    {
      value: "admin",
      label: "Quản trị viên",
    },
    {
      value: "staff",
      label: "Nhân viên",
    },
    {
      value: "shipper",
      label: "Người giao hàng",
    },
  ];

  const statusOptions = [
    {
      value: true,
      label: "Hoạt động",
    },
    {
      value: false,
      label: "Không hoạt động",
    },
  ];

  function buildFullName(lastName, firstName) {
    return [lastName?.trim(), firstName?.trim()]
      .filter(Boolean)
      .join(" ");
  }

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const firstName = selectedUser.firstName || "";
    const lastName = selectedUser.lastName || "";

    const generatedFullName =
      buildFullName(lastName, firstName) ||
      selectedUser.fullName ||
      "";

    const userData = {
      username:
        selectedUser.username === "Not provided"
          ? ""
          : selectedUser.username || "",

      firstName,
      lastName,
      fullName: generatedFullName,

      phone:
        selectedUser.phone === "Not provided"
          ? ""
          : selectedUser.phone || "",

      email:
        selectedUser.email === "Not provided"
          ? ""
          : selectedUser.email || "",

      address:
        selectedUser.address === "Not provided"
          ? ""
          : selectedUser.address || "",

      role: selectedUser.role || "customer",

      isActive:
        selectedUser.isActive ??
        selectedUser.status === "Hoạt động",

      avatarUrl:
        !selectedUser.img ||
        selectedUser.img === DEFAULT_AVATAR ||
        selectedUser.img.includes("default-user.jpg")
          ? ""
          : selectedUser.img,
    };

    setFormData(userData);
    setOriginalData(userData);
    setErrors({});
  }, [selectedUser]);

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      let normalizedValue = digitsOnly;

      if (normalizedValue.length > 0) {
        normalizedValue =
          normalizedValue[0] === "0"
            ? normalizedValue
            : `0${normalizedValue.slice(0, 9)}`;
      }

      nextValue = normalizedValue.slice(0, 10);
    }

    setFormData((previousData) => {
      const nextData = {
        ...previousData,
        [name]: nextValue,
      };

      if (
        name === "firstName" ||
        name === "lastName"
      ) {
        nextData.fullName = buildFullName(
          nextData.lastName,
          nextData.firstName
        );
      }

      return nextData;
    });

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      fullName: "",
      general: "",
    }));
  }

  function handleRoleChange(option) {
    setFormData((previousData) => ({
      ...previousData,
      role: option?.value || "customer",
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      role: "",
      general: "",
    }));
  }

  function handleStatusChange(option) {
    setFormData((previousData) => ({
      ...previousData,
      isActive: option?.value ?? true,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      isActive: "",
      general: "",
    }));
  }

  function handleAvatarError(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_AVATAR;
  }

  function validateForm() {
    const validationErrors = {};

    if (!formData.username.trim()) {
      validationErrors.username =
        "Tên đăng nhập là bắt buộc.";
    }

    if (!formData.firstName.trim()) {
      validationErrors.firstName =
        "Tên là bắt buộc.";
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName =
        "Họ là bắt buộc.";
    }

    if (!formData.phone.trim()) {
      validationErrors.phone =
        "Số điện thoại là bắt buộc.";
    } else if (
      !/^0\d{9}$/.test(formData.phone.trim())
    ) {
      validationErrors.phone =
        "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email là bắt buộc.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        formData.email.trim()
      )
    ) {
      validationErrors.email =
        "Email không hợp lệ.";
    }

    if (
      formData.avatarUrl.trim() &&
      !/^https?:\/\/.+/i.test(
        formData.avatarUrl.trim()
      )
    ) {
      validationErrors.avatarUrl =
        "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://";
    }

    return validationErrors;
  }

  function createChangedPayload() {
    const fieldMap = {
      username: "username",
      firstName: "first_name",
      lastName: "last_name",
      phone: "phone_number",
      email: "email",
      address: "default_address",
      role: "role",
      isActive: "is_active",
      avatarUrl: "avatar_url",
    };

    const payload = {};

    Object.keys(fieldMap).forEach(
      (frontendField) => {
        const currentValue =
          formData[frontendField];

        const originalValue =
          originalData[frontendField];

        if (currentValue !== originalValue) {
          payload[fieldMap[frontendField]] =
            typeof currentValue === "string"
              ? currentValue.trim()
              : currentValue;
        }
      }
    );

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedUser?.id) {
      setErrors({
        general:
          "Không có thông tin người dùng.",
      });

      return;
    }

    const validationErrors = validateForm();

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    const payload = createChangedPayload();

    if (Object.keys(payload).length === 0) {
      Swal.fire({
        icon: "info",
        title: "Không có thay đổi",
        text: "Không có thông tin nào được thay đổi.",
        customClass: {
          confirmButton: "btn btn-submit",
        },
        buttonsStyling: false,
      });

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setErrors({
        general:
          "Không tìm thấy mã truy cập. Vui lòng đăng nhập lại.",
      });

      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.patch(
        `${API_URL}${selectedUser.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            Accept: "application/json",
            "ngrok-skip-browser-warning":
              "true",
          },
        }
      );

      const updatedUser =
        response.data?.data || response.data;

      const updatedFirstName =
        updatedUser?.first_name ??
        formData.firstName;

      const updatedLastName =
        updatedUser?.last_name ??
        formData.lastName;

      const nextOriginalData = {
        ...formData,

        username:
          updatedUser?.username ??
          formData.username,

        firstName: updatedFirstName,
        lastName: updatedLastName,

        fullName: buildFullName(
          updatedLastName,
          updatedFirstName
        ),

        phone:
          updatedUser?.phone_number ??
          formData.phone,

        email:
          updatedUser?.email ??
          formData.email,

        address:
          updatedUser?.default_address ??
          formData.address,

        role:
          updatedUser?.role ??
          formData.role,

        isActive:
          updatedUser?.is_active ??
          formData.isActive,

        avatarUrl:
          updatedUser?.avatar_url ??
          formData.avatarUrl,
      };

      setFormData(nextOriginalData);
      setOriginalData(nextOriginalData);

      await Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        text: "Hồ sơ người dùng đã được cập nhật.",
        customClass: {
          confirmButton: "btn btn-submit",
        },
        buttonsStyling: false,
      });

      if (typeof onUpdated === "function") {
        await onUpdated();
      }

      document
        .querySelector(
          "#edit-units [data-bs-dismiss='modal']"
        )
        ?.click();
    } catch (requestError) {
      const responseData =
        requestError.response?.data;

      const apiErrors =
        responseData?.errors || {};

      console.error("Lỗi cập nhật người dùng:", {
        status: requestError.response?.status,
        responseData,
        requestPayload: payload,
      });

      const fieldMessages = Object.values(
        apiErrors
      )
        .flatMap((value) => {
          if (Array.isArray(value)) {
            return value;
          }

          if (typeof value === "string") {
            return [value];
          }

          return [];
        })
        .filter(Boolean);

      const generalMessage =
        fieldMessages.length > 0
          ? fieldMessages.join(" ")
          : typeof responseData?.detail ===
              "string"
            ? responseData.detail
            : responseData?.msg ||
              responseData?.message ||
              `Không thể cập nhật người dùng${
                requestError.response?.status
                  ? ` (Mã lỗi ${requestError.response.status})`
                  : ""
              }.`;

      setErrors({
        username:
          apiErrors.username?.[0] || "",

        firstName:
          apiErrors.first_name?.[0] || "",

        lastName:
          apiErrors.last_name?.[0] || "",

        phone:
          apiErrors.phone_number?.[0] || "",

        email:
          apiErrors.email?.[0] || "",

        address:
          apiErrors.default_address?.[0] ||
          "",

        role:
          apiErrors.role?.[0] || "",

        isActive:
          apiErrors.is_active?.[0] || "",

        avatarUrl:
          apiErrors.avatar_url?.[0] ||
          apiErrors.avatar?.[0] ||
          "",

        general: generalMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFormData(originalData);
    setErrors({});
  }

  return (
    <div
      className="modal fade"
      id="edit-units"
    >
      <div className="modal-dialog modal-dialog-centered custom-modal-two modal-lg">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>
                    Chỉnh sửa hồ sơ người dùng
                  </h4>

                  <p className="mb-0 text-muted">
                    Cập nhật thông tin, vai trò,
                    trạng thái và ảnh đại diện
                  </p>
                </div>

                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Đóng"
                  onClick={handleClose}
                >
                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>

              <div className="modal-body custom-modal-body">
                {loadingDetail ? (
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
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                  >
                    {errors.general && (
                      <div className="alert alert-danger">
                        {errors.general}
                      </div>
                    )}

                    <div className="row">
                      <div className="col-lg-12">
                        <div className="new-employee-field">
                          <span>
                            Ảnh đại diện
                          </span>

                          <div className="profile-pic-upload edit-pic">
                            <div className="profile-pic">
                              <img
                                src={
                                  formData.avatarUrl ||
                                  DEFAULT_AVATAR
                                }
                                alt={
                                  formData.fullName ||
                                  formData.username ||
                                  "Người dùng"
                                }
                                className="user-editer"
                                onError={
                                  handleAvatarError
                                }
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <EditInput
                        label="Tên đăng nhập"
                        name="username"
                        value={
                          formData.username
                        }
                        onChange={
                          handleChange
                        }
                        error={
                          errors.username
                        }
                        required
                      />

                      <EditInput
                        label="Họ và tên"
                        name="fullName"
                        value={
                          formData.fullName
                        }
                        onChange={
                          handleChange
                        }
                        error={
                          errors.fullName
                        }
                        readOnly
                      />

                      <EditInput
                        label="Tên"
                        name="firstName"
                        value={
                          formData.firstName
                        }
                        onChange={
                          handleChange
                        }
                        error={
                          errors.firstName
                        }
                        required
                      />

                      <EditInput
                        label="Họ"
                        name="lastName"
                        value={
                          formData.lastName
                        }
                        onChange={
                          handleChange
                        }
                        error={
                          errors.lastName
                        }
                        required
                      />

                      <EditInput
                        label="Số điện thoại"
                        name="phone"
                        value={formData.phone}
                        onChange={
                          handleChange
                        }
                        error={errors.phone}
                        required
                        inputMode="numeric"
                        maxLength={10}
                      />

                      <EditInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={
                          handleChange
                        }
                        error={errors.email}
                        required
                      />

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Vai trò</label>

                          <Select
                            className="select"
                            options={roleOptions}
                            value={
                              roleOptions.find(
                                (option) =>
                                  option.value ===
                                  formData.role
                              ) || null
                            }
                            onChange={
                              handleRoleChange
                            }
                            placeholder="Chọn vai trò"
                            noOptionsMessage={() =>
                              "Không có lựa chọn"
                            }
                          />

                          {errors.role && (
                            <small className="text-danger d-block mt-1">
                              {errors.role}
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>
                            Trạng thái
                          </label>

                          <Select
                            className="select"
                            options={statusOptions}
                            value={
                              statusOptions.find(
                                (option) =>
                                  option.value ===
                                  formData.isActive
                              ) || null
                            }
                            onChange={
                              handleStatusChange
                            }
                            placeholder="Chọn trạng thái"
                            noOptionsMessage={() =>
                              "Không có lựa chọn"
                            }
                          />

                          {errors.isActive && (
                            <small className="text-danger d-block mt-1">
                              {errors.isActive}
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>
                            Địa chỉ mặc định
                          </label>

                          <input
                            type="text"
                            name="address"
                            value={
                              formData.address
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Nhập địa chỉ mặc định"
                          />

                          {errors.address && (
                            <small className="text-danger d-block mt-1">
                              {errors.address}
                            </small>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className="input-blocks">
                          <label>
                            Đường dẫn ảnh đại diện
                          </label>

                          <input
                            type="text"
                            name="avatarUrl"
                            value={
                              formData.avatarUrl
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Nhập đường dẫn ảnh, ví dụ: https://example.com/avatar.jpg"
                          />

                          {errors.avatarUrl && (
                            <small className="text-danger d-block mt-1">
                              {errors.avatarUrl}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        disabled={loading}
                        onClick={handleClose}
                      >
                        Hủy
                      </button>

                      <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                      >
                        {loading
                          ? "Đang lưu..."
                          : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditInput = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  readOnly = false,
  inputMode,
  maxLength,
}) => {
  return (
    <div className="col-lg-6">
      <div className="input-blocks">
        <label>
          {label}

          {required && (
            <span className="text-danger ms-1">
              *
            </span>
          )}
        </label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={
            readOnly
              ? "Được tạo tự động từ họ và tên"
              : `Nhập ${label.toLowerCase()}`
          }
          className={
            error ? "is-invalid" : ""
          }
        />

        {error && (
          <small className="text-danger d-block mt-1">
            {error}
          </small>
        )}
      </div>
    </div>
  );
};

export default EditUser;