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
        "User name is required.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email is required.";
    } else if (
      !/\S+@\S+\.\S+/.test(
        formData.email
      )
    ) {
      validationErrors.email =
        "Email address is invalid.";
    }

    if (!formData.phoneNumber.trim()) {
      validationErrors.phoneNumber =
        "Phone number is required.";
    } else if (!/^0\d{9}$/.test(formData.phoneNumber.trim())) {
      validationErrors.phoneNumber =
        "Phone number must be 10 digits and start with 0.";
    }

    if (!formData.password) {
      validationErrors.password =
        "Password is required.";
    } else if (
      formData.password.length < 8
    ) {
      validationErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword =
        "Confirm password is required.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      validationErrors.confirmPassword =
        "Passwords do not match.";
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
          "Access token not found. Please sign in again.",
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
        title: "Created",
        text: "User created successfully.",
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
                  <h4>Add New User</h4>

                  <p className="mb-0 text-muted">
                    Create a new user
                    account from Admin
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
                      label="User Name"
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
                      placeholder="Enter user name"
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
                      placeholder="Enter email address"
                    />

                    <InputField
                      label="Phone Number"
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
                      placeholder="Enter phone number"
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
                      label="Password"
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
                      placeholder="Enter password"
                    />

                    <InputField
                      label="Confirm Password"
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
                      placeholder="Confirm password"
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
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-submit"
                      disabled={loading}
                    >
                      {loading
                        ? "Creating..."
                        : "Create User"}
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