import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";

import ImageWithBasePath from "../../img/imagewithbasebath";

const API_URL =
  "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/users/";

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
  img: "assets/img/users/user-15.jpg",
};

const EditUser = ({
  selectedUser,
  loadingDetail = false,
  onUpdated,
}) => {
  const [formData, setFormData] =
    useState(emptyForm);

  const [originalData, setOriginalData] =
    useState(emptyForm);

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

  const statusOptions = [
    {
      value: true,
      label: "Active",
    },
    {
      value: false,
      label: "Inactive",
    },
  ];

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const userData = {
      username:
        selectedUser.username || "",

      firstName:
        selectedUser.firstName || "",

      lastName:
        selectedUser.lastName || "",

      fullName:
        selectedUser.fullName || "",

      phone:
        selectedUser.phone ===
        "Not provided"
          ? ""
          : selectedUser.phone || "",

      email:
        selectedUser.email ===
        "Not provided"
          ? ""
          : selectedUser.email || "",

      address:
        selectedUser.address ===
        "Not provided"
          ? ""
          : selectedUser.address || "",

      role:
        selectedUser.role ||
        "customer",

      isActive:
        selectedUser.isActive ??
        selectedUser.status ===
          "Active",

      img:
        selectedUser.img ||
        "assets/img/users/user-15.jpg",
    };

    setFormData(userData);
    setOriginalData(userData);
    setErrors({});
  }, [selectedUser]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
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

  function handleStatusChange(option) {
    setFormData((previousData) => ({
      ...previousData,
      isActive:
        option?.value ?? true,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      isActive: "",
      general: "",
    }));
  }

  function createChangedPayload() {
    const fieldMap = {
      username: "username",
      firstName: "first_name",
      lastName: "last_name",
      fullName: "full_name",
      phone: "phone_number",
      email: "email",
      address: "default_address",
      role: "role",
      isActive: "is_active",
    };

    const payload = {};

    Object.keys(fieldMap).forEach(
      (frontendField) => {
        if (
          formData[frontendField] !==
          originalData[frontendField]
        ) {
          payload[
            fieldMap[frontendField]
          ] =
            formData[frontendField];
        }
      }
    );

    return payload;
  }

  function validatePayload(payload) {
    const validationErrors = {};

    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        "email"
      ) &&
      payload.email &&
      !/\S+@\S+\.\S+/.test(
        payload.email
      )
    ) {
      validationErrors.email =
        "Email address is invalid.";
    }

    return validationErrors;
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

    const payload =
      createChangedPayload();

    if (
      Object.keys(payload).length === 0
    ) {
      Swal.fire({
        icon: "info",
        title: "No changes",
        text: "No user information has been changed.",
        customClass: {
          confirmButton:
            "btn btn-submit",
        },
        buttonsStyling: false,
      });

      return;
    }

    const validationErrors =
      validatePayload(payload);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
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
      await axios.patch(
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

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text: "User profile updated successfully.",
        customClass: {
          confirmButton:
            "btn btn-submit",
        },
        buttonsStyling: false,
      });

      setOriginalData(formData);

      if (
        typeof onUpdated ===
        "function"
      ) {
        await onUpdated();
      }

      const closeButton =
        document.querySelector(
          "#edit-units [data-bs-dismiss='modal']"
        );

      closeButton?.click();
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
          apiErrors.username?.[0] ||
          "",

        firstName:
          apiErrors.first_name?.[0] ||
          "",

        lastName:
          apiErrors.last_name?.[0] ||
          "",

        fullName:
          apiErrors.full_name?.[0] ||
          "",

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
          apiErrors.is_active?.[0] ||
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
                    Edit User Profile
                  </h4>

                  <p className="mb-0 text-muted">
                    Update user information,
                    permissions and status
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
                    User information is
                    unavailable.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
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
                              <ImageWithBasePath
                                src={
                                  formData.img
                                }
                                className="user-editer"
                                alt="User"
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
                      />

                      <EditInput
                        label="Phone Number"
                        name="phone"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleChange
                        }
                        error={errors.phone}
                      />

                      <EditInput
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
                      />

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Role</label>

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
                              ) || null
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

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>
                            Status
                          </label>

                          <Select
                            className="select"
                            options={
                              statusOptions
                            }
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
                            <small className="text-danger">
                              {
                                errors.isActive
                              }
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
                            <small className="text-danger">
                              {errors.address}
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
}) => {
  return (
    <div className="col-lg-6">
      <div className="input-blocks">
        <label>{label}</label>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
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

export default EditUser;