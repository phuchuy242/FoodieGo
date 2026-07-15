import React from "react";
import ImageWithBasePath from "../../img/imagewithbasebath";

const ViewUser = ({
  selectedUser,
  loading = false,
}) => {
  const user = selectedUser || {};

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
                  <h4>User Profile Details</h4>

                  <p className="mb-0 text-muted">
                    View personal and account
                    information
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
                          "Not provided"}
                      </h5>

                      <p className="text-muted mb-2">
                        @
                        {user.username ||
                          "unknown"}
                      </p>

                      {user.isActive ? (
                        <span className="badge badge-linesuccess">
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-linedanger">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="card mb-0">
                      <div className="card-body">
                        <div className="row">
                          <ProfileItem
                            label="User ID"
                            value={user.id}
                          />

                          <ProfileItem
                            label="User Name"
                            value={
                              user.username
                            }
                          />

                          <ProfileItem
                            label="First Name"
                            value={
                              user.firstName
                            }
                          />

                          <ProfileItem
                            label="Last Name"
                            value={
                              user.lastName
                            }
                          />

                          <ProfileItem
                            label="Full Name"
                            value={
                              user.fullName
                            }
                          />

                          <ProfileItem
                            label="Email"
                            value={user.email}
                          />

                          <ProfileItem
                            label="Phone Number"
                            value={user.phone}
                          />

                          <ProfileItem
                            label="Role"
                            value={user.role}
                            capitalize
                          />

                          <ProfileItem
                            label="Membership Tier"
                            value={
                              user.membershipTier
                            }
                          />

                          <ProfileItem
                            label="Points"
                            value={
                              user.points ?? 0
                            }
                          />

                          <ProfileItem
                            label="Verified"
                            value={
                              user.isVerified
                                ? "Yes"
                                : "No"
                            }
                          />

                          <ProfileItem
                            label="Staff Account"
                            value={
                              user.isStaff
                                ? "Yes"
                                : "No"
                            }
                          />

                          <ProfileItem
                            label="Created On"
                            value={formatDateTime(
                              user.createdon
                            )}
                          />

                          <ProfileItem
                            label="Updated On"
                            value={formatDateTime(
                              user.updatedAt
                            )}
                          />

                          <div className="col-lg-12">
                            <div className="mb-0">
                              <p className="text-muted mb-1">
                                Default Address
                              </p>

                              <h6 className="mb-0">
                                {user.address ||
                                  "Not provided"}
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
                    Close
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
                    Edit Profile
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
      ? "Not provided"
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