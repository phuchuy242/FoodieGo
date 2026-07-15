import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";

const API_URL =
  "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/users/";

const initialFormData = {
  username: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "customer",
};

const AddUsers = ({ onCreated }) => {
  const [formData, setFormData] =
    useState(initialFormData);

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const roleOptions = [
    {
      value: "customer",
      label: "Customer",
    },
    {
      value: "admin",
      label: "Admin",
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
          normalized[0] === "0"
            ? normalized
            : `0${normalized.slice(0, 9)}`;
      }

      nextValue = normalized.slice(0, 10);
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: nextValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
      general: "",
    }));
  }

  function handleRoleChange(option) {
    setFormData((previousData) => ({
      ...previousData,
      role:
        option?.value || "customer",
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      role: "",
      general: "",
    }));
  }

  function validate() {
    const validationErrors = {};

    if (!formData.username.trim()) {
      validationErrors.username =
        "Tên người dùng là bắt buộc.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email là bắt buộc.";
    } else if (
      !/\S+@\S+\.\S+/.test(
        formData.email
      )
    ) {
      validationErrors.email =
        "Địa chỉ email không hợp lệ.";
    }

    if (!formData.phoneNumber.trim()) {
      validationErrors.phoneNumber =
        "Số điện thoại là bắt buộc.";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber.trim())) {
      validationErrors.phoneNumber =
        "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
    }

    if (!formData.password) {
      validationErrors.password =
        "Mật khẩu là bắt buộc.";
    } else if (
      formData.password.length < 8
    ) {
      validationErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword =
        "Xác nhận mật khẩu là bắt buộc.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      validationErrors.confirmPassword =
        "Mật khẩu không khớp.";
    }

    return validationErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors =
      validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setErrors({
        general:
          "Không tìm thấy token truy cập. Vui lòng đăng nhập lại.",
      });

      return;
    }

    setLoading(true);

    try {
      await axios.post(
        API_URL,
        {
          username:
            formData.username.trim(),

          email:
            formData.email.trim(),

          phone_number:
            formData.phoneNumber.trim(),

          password: formData.password,

          role: formData.role,
        },
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

      await Swal.fire({
        icon: "success",
        title: "Đã tạo",
        text: "Tạo người dùng thành công.",
        customClass: {
          confirmButton:
            "btn btn-submit",
        },
        buttonsStyling: false,
      });

      setFormData(initialFormData);
      setErrors({});

      if (
        typeof onCreated ===
        "function"
      ) {
        await onCreated();
      }

      const closeButton =
        document.querySelector(
          "#add-units [data-bs-dismiss='modal']"
        );

      closeButton?.click();
    } catch (requestError) {
      console.error(
        "Create user error:",
        requestError
      );

      const responseData =
        requestError.response?.data;

      const apiErrors =
        responseData?.errors || {};

      setErrors({
        username:
          apiErrors.username?.[0] ||
          "",

        email:
          apiErrors.email?.[0] || "",

        phoneNumber:
          apiErrors.phone_number?.[0] ||
          "",

        password:
          apiErrors.password?.[0] ||
          "",

        role:
          apiErrors.role?.[0] || "",

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
    <div
      className="modal fade"
      id="add-units"
    >
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
                  <span aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>

              <div className="modal-body custom-modal-body">
                <form
                  onSubmit={handleSubmit}
                >
                  {errors.general && (
                    <div className="alert alert-danger">
                      {errors.general}
                    </div>
                  )}

                  <div className="row">
                    <InputField
                      label="Tên người dùng"
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
                      placeholder="Nhập tên người dùng"
                    />

                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      error={errors.email}
                      placeholder="Nhập địa chỉ email"
                    />

                    <InputField
                      label="Số điện thoại"
                      name="phoneNumber"
                      value={
                        formData.phoneNumber
                      }
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={10}
                      error={
                        errors.phoneNumber
                      }
                      placeholder="Nhập số điện thoại"
                    />

                    <div className="col-lg-6">
                      <div className="input-blocks">
                        <label>
                          Role
                          <span className="text-danger">
                            {" "}
                            *
                          </span>
                        </label>

                        <Select
                          className="select"
                          options={
                            roleOptions
                          }
                          value={
                            roleOptions.find(
                              (option) =>
                                option.value ===
                                formData.role
                            ) ||
                            roleOptions[0]
                          }
                          onChange={
                            handleRoleChange
                          }
                        />

                        {errors.role && (
                          <small className="text-danger">
                            {errors.role}
                          </small>
                        )}
                      </div>
                    </div>

                    <InputField
                      label="Mật khẩu"
                      name="password"
                      type="password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.password
                      }
                      placeholder="Nhập mật khẩu"
                    />

                    <InputField
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type="password"
                      value={
                        formData.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.confirmPassword
                      }
                      placeholder="Xác nhận mật khẩu"
                    />
                  </div>

                  <div className="modal-footer-btn">
                    <button
                      type="button"
                      className="btn btn-cancel me-2"
                      data-bs-dismiss="modal"
                      disabled={loading}
                      onClick={
                        handleClose
                      }
                    >
                      Hủy
                    </button>

                    <button
                      type="submit"
                      className="btn btn-submit"
                      disabled={loading}
                    >
                      {loading
                        ? "Đang tạo..."
                        : "Tạo người dùng"}
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
}) => {
  return (
    <div className="col-lg-6">
      <div className="input-blocks">
        <label>
          {label}
          <span className="text-danger">
            {" "}
            *
          </span>
        </label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
        />

        {error && (
          <small className="text-danger">
            {error}
          </small>
        )}
      </div>
    </div>
  );
};

export default AddUsers;