import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";

const API_URL = "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/users/";

const initialFormData = {
  username: "",
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "customer",
  isActive: true,
  address: "",
  avatarUrl: "",
};

const AddUsers = ({ onCreated }) => {
  const [formData, setFormData] = useState(initialFormData);

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
    return [lastName?.trim(), firstName?.trim()].filter(Boolean).join(" ");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phoneNumber") {
      // allow digits only
      const digitsOnly = value.replace(/\D/g, "");

      // ensure leading zero and limit to 10 digits
      let normalized = digitsOnly;
      if (normalized.length > 0) {
        normalized =
          normalized[0] === "0" ? normalized : `0${normalized.slice(0, 9)}`;
      }

      nextValue = normalized.slice(0, 10);
    }

    setFormData((previousData) => {
      const nextData = {
        ...previousData,
        [name]: nextValue,
      };

      if (name === "firstName" || name === "lastName") {
        nextData.fullName = buildFullName(
          name === "lastName" ? nextValue : previousData.lastName,
          name === "firstName" ? nextValue : previousData.firstName
        );
      }

      return nextData;
    });

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
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

  function validate() {
    const validationErrors = {};

    if (!formData.username.trim()) {
      validationErrors.username = "Tên người dùng là bắt buộc.";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email là bắt buộc.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Địa chỉ email không hợp lệ.";
    }

    if (!formData.firstName.trim()) {
      validationErrors.firstName = "Tên là bắt buộc.";
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName = "Họ là bắt buộc.";
    }

    if (!formData.phoneNumber.trim()) {
      validationErrors.phoneNumber = "Số điện thoại là bắt buộc.";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber.trim())) {
      validationErrors.phoneNumber =
        "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email là bắt buộc.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Địa chỉ email không hợp lệ.";
    }

    if (!formData.password) {
      validationErrors.password = "Mật khẩu là bắt buộc.";
    } else if (formData.password.length < 8) {
      validationErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Mật khẩu không khớp.";
    }

    if (
      formData.avatarUrl.trim() &&
      !/^https?:\/\/.+/i.test(formData.avatarUrl.trim())
    ) {
      validationErrors.avatarUrl =
        "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://";
    }

    return validationErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setErrors({
        general: "Không tìm thấy token truy cập. Vui lòng đăng nhập lại.",
      });

      return;
    }

    setLoading(true);

    try {
      await axios.post(
        API_URL,
        {
          username: formData.username.trim(),

          first_name: formData.firstName.trim(),

          last_name: formData.lastName.trim(),

          email: formData.email.trim(),

          phone_number: formData.phoneNumber.trim(),

          password: formData.password,

          role: formData.role,

          is_active: formData.isActive,

          default_address: formData.address.trim(),

          avatar_url: formData.avatarUrl.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Đã tạo",
        text: "Tạo người dùng thành công.",
        customClass: {
          confirmButton: "btn btn-submit",
        },
        buttonsStyling: false,
      });

      setFormData(initialFormData);
      setErrors({});

      if (typeof onCreated === "function") {
        await onCreated();
      }

      const closeButton = document.querySelector(
        "#add-units [data-bs-dismiss='modal']"
      );

      closeButton?.click();
    } catch (requestError) {
      console.error("Create user error:", requestError);

      const responseData = requestError.response?.data;

      const apiErrors = responseData?.errors || {};

      setErrors({
        username: apiErrors.username?.[0] || "",

        email: apiErrors.email?.[0] || "",

        phoneNumber: apiErrors.phone_number?.[0] || "",

        password: apiErrors.password?.[0] || "",

        role: apiErrors.role?.[0] || "",

        general:
          responseData?.msg ||
          responseData?.message ||
          responseData?.detail ||
          "Unable to create user.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFormData(initialFormData);
    setErrors({});
  }

  return (
    <div className="modal fade" id="add-units">
      <div className="modal-dialog modal-dialog-centered custom-modal-two modal-lg">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4>Thêm người dùng mới</h4>

                  <p className="mb-0 text-muted">
                    Tạo tài khoản người dùng mới
                  </p>
                </div>

                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={handleClose}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="modal-body custom-modal-body">
                <form onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="alert alert-danger">{errors.general}</div>
                  )}

                  <div className="row">
                    <InputField
                      label="Tên đăng nhập"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      placeholder="Nhập tên đăng nhập"
                      required
                    />

                    <InputField
                      label="Họ và tên"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={errors.fullName}
                      placeholder="Họ và tên"
                      readOnly
                    />

                    <InputField
                      label="Tên"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      placeholder="Nhập tên"
                      required
                    />

                    <InputField
                      label="Họ"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      placeholder="Nhập họ"
                      required
                    />

                    <InputField
                      label="Số điện thoại"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={10}
                      error={errors.phoneNumber}
                      placeholder="Nhập số điện thoại"
                      required
                    />

                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="Nhập email"
                      required
                    />

                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>
                          Vai trò
                          <span className="text-danger ms-1">*</span>
                        </label>

                        <Select
                          className="select"
                          options={roleOptions}
                          value={
                            roleOptions.find(
                              (option) => option.value === formData.role
                            ) || null
                          }
                          onChange={handleRoleChange}
                          placeholder="Chọn vai trò"
                          noOptionsMessage={() => "Không có lựa chọn"}
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
                        <label>Trạng thái</label>

                        <Select
                          className="select"
                          options={statusOptions}
                          value={
                            statusOptions.find(
                              (option) => option.value === formData.isActive
                            ) || null
                          }
                          onChange={handleStatusChange}
                          placeholder="Chọn trạng thái"
                          noOptionsMessage={() => "Không có lựa chọn"}
                        />

                        {errors.isActive && (
                          <small className="text-danger d-block mt-1">
                            {errors.isActive}
                          </small>
                        )}
                      </div>
                    </div>

                    <InputField
                      label="Địa chỉ mặc định"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={errors.address}
                      placeholder="Nhập địa chỉ mặc định"
                    />

                    <InputField
                      label="Đường dẫn ảnh đại diện"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      error={errors.avatarUrl}
                      placeholder="Nhập đường dẫn ảnh, ví dụ: https://example.com/avatar.jpg"
                    />

                    <InputField
                      label="Mật khẩu"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="Nhập mật khẩu"
                      required
                    />

                    <InputField
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      placeholder="Xác nhận mật khẩu"
                      required
                    />
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
                      {loading ? "Đang tạo..." : "Tạo người dùng"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  maxLength,
  required = false,
  readOnly = false,
}) => {
  return (
    <div className="col-lg-6">
      <div className="input-blocks">
        <label>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          readOnly={readOnly}
          className={error ? "is-invalid" : ""}
        />

        {error && <small className="text-danger d-block mt-1">{error}</small>}
      </div>
    </div>
  );
};

export default AddUsers;
