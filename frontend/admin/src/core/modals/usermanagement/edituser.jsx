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
    { value: "customer", label: "Customer" },
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
    { value: "shipper", label: "Shipper" },
  ];

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
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
        selectedUser.status === "Active",

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
        "User name is required.";
    }

    if (!formData.firstName.trim()) {
      validationErrors.firstName =
        "First name is required.";
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName =
        "Last name is required.";
    }

    if (!formData.phone.trim()) {
      validationErrors.phone =
        "Phone number is required.";
    } else if (
      !/^0\d{9}$/.test(
        formData.phone.trim()
      )
    ) {
      validationErrors.phone =
        "Phone number must be 10 digits and start with 0.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email is required.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        formData.email.trim()
      )
    ) {
      validationErrors.email =
        "Email address is invalid.";
    }

    if (
      formData.avatarUrl.trim() &&
      !/^https?:\/\/.+/i.test(
        formData.avatarUrl.trim()
      )
    ) {
      validationErrors.avatarUrl =
        "Avatar URL must begin with http:// or https://";
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
          "User information is unavailable.",
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
        title: "No changes",
        text: "No user information has been changed.",
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
          "Access token not found. Please sign in again.",
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
        title: "Updated",
        text: "User profile updated successfully.",
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
      console.error(
        "Update user error:",
        requestError
      );

      const responseData =
        requestError.response?.data;

      const apiErrors =
        responseData?.errors || {};

      setErrors({
        username:
          apiErrors.username?.[0] || "",

        firstName:
          apiErrors.first_name?.[0] || "",

        lastName:
          apiErrors.last_name?.[0] || "",

        phone:
          apiErrors.phone_number?.[0] ||
          "",

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

        general:
          responseData?.msg ||
          responseData?.message ||
          responseData?.detail ||
          "Unable to update user.",
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
                  <h4>Edit User Profile</h4>

                  <p className="mb-0 text-muted">
                    Update user information,
                    permissions, status and avatar
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
                {loadingDetail ? (
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
                      Loading user details...
                    </p>
                  </div>
                ) : !selectedUser ? (
                  <div className="alert alert-warning mb-0">
                    User information is unavailable.
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
                            Profile Image
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
                                  "User"
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
                        required
                      />

                      <EditInput
                        label="Full Name"
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
                        label="First Name"
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
                        label="Last Name"
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
                        label="Phone Number"
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
                          <label>Role</label>

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
                          <label>Status</label>

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
                            Default Address
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
                            placeholder="Enter default address"
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
                            Avatar URL
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
                            placeholder="https://example.com/avatar.jpg"
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
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                      >
                        {loading
                          ? "Saving..."
                          : "Save Changes"}
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
              ? "Automatically generated"
              : `Enter ${label.toLowerCase()}`
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