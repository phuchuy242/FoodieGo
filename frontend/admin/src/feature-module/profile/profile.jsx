import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useSelector, useDispatch } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { ChevronUp, User, Lock, Camera, RotateCcw } from "feather-icons-react/build/IconComponents";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { API_BASE } from "../../environment";
const MySwal = withReactContent(Swal);

const Profile = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'password'

  // Edit info fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  // Change password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("access_token");
    const headers = { "ngrok-skip-browser-warning": "true" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await axios.get(`${API_BASE}/api/v1/users/profile/`, { headers: getHeaders() });
      const user = res.data?.data || res.data;
      if (!user || typeof user !== "object") {
        console.warn("Profile response empty or invalid:", res.data);
        return;
      }
      setProfile(user);
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phone_number || "");
      setAvatarUrl(user.avatar_url || user.avatar || "");
    } catch (err) {
      console.error("Error loading profile:", err);
      MySwal.fire({ title: "Lỗi", text: "Không thể tải thông tin hồ sơ!", icon: "error" });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) {
      MySwal.fire({ title: "Thiếu thông tin", text: "Vui lòng nhập Họ hoặc Tên!", icon: "warning" });
      return;
    }
    try {
      setSavingInfo(true);
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        avatar_url: avatarUrl.trim(),
      };
      const res = await axios.patch(`${API_BASE}/api/v1/users/profile/`, payload, { headers: getHeaders() });
      const updated = res.data?.data || res.data;
      setProfile(updated);
      MySwal.fire({ title: "Thành công", text: "Đã cập nhật thông tin hồ sơ!", icon: "success", timer: 1800, showConfirmButton: false });
    } catch (err) {
      MySwal.fire({ title: "Lỗi", text: err?.response?.data?.message || "Không thể cập nhật!", icon: "error" });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      MySwal.fire({ title: "Thiếu thông tin", text: "Vui lòng điền đầy đủ các trường mật khẩu!", icon: "warning" });
      return;
    }
    if (newPassword.length < 8) {
      MySwal.fire({ title: "Mật khẩu yếu", text: "Mật khẩu mới phải có ít nhất 8 ký tự!", icon: "warning" });
      return;
    }
    try {
      setSavingPassword(true);
      await axios.put(`${API_BASE}/api/v1/users/password/`, {
        old_password: oldPassword,
        new_password: newPassword,
      }, { headers: getHeaders() });
      MySwal.fire({ title: "Thành công", text: "Đã đổi mật khẩu thành công! Vui lòng đăng nhập lại.", icon: "success" });
      setOldPassword(""); setNewPassword("");
    } catch (err) {
      const msg = err?.response?.data?.errors?.old_password?.[0]
        || err?.response?.data?.message
        || "Không thể đổi mật khẩu!";
      MySwal.fire({ title: "Lỗi", text: msg, icon: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  const renderCollapseTooltip = (props) => (
    <Tooltip id="collapse-tooltip" {...props}>Thu gọn</Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>Làm mới</Tooltip>
  );

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    if (profile?.full_name) return profile.full_name.slice(0, 2).toUpperCase();
    if (profile?.user_name) return profile.user_name.slice(0, 2).toUpperCase();
    return "AD";
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Hồ sơ cá nhân</h4>
              <h6>Xem và chỉnh sửa thông tin tài khoản của bạn</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                <Link to="#" onClick={(e) => { e.preventDefault(); fetchProfile(); }}>
                  <RotateCcw />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  to="#"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={(e) => { e.preventDefault(); dispatch(setToogleHeader(!data)); }}
                >
                  <ChevronUp />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {loadingProfile ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-muted">Đang tải thông tin hồ sơ...</p>
          </div>
        ) : (
          <div className="row">
            {/* Left: Avatar & Info Card */}
            <div className="col-xl-4 col-lg-4 col-md-12 mb-4">
              <div className="card" style={{ borderRadius: "16px" }}>
                <div className="card-body text-center py-5">
                  {/* Avatar */}
                  <div className="position-relative d-inline-block mb-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="rounded-circle"
                        style={{ width: 100, height: 100, objectFit: "cover", border: "3px solid #e2e8f0" }}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.classList.remove("d-none"); e.target.nextSibling.classList.add("d-flex"); }}
                      />
                    ) : null}
                    <div
                      className={`rounded-circle align-items-center justify-content-center bg-primary text-white fw-bold ${avatarUrl ? "d-none" : "d-flex"}`}
                      style={{ width: 100, height: 100, fontSize: 32, margin: "0 auto" }}
                    >
                      {getInitials()}
                    </div>
                  </div>

                  <h5 className="fw-bold mb-1">
                    {profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || profile?.user_name || "Admin"}
                  </h5>
                  <span className={`badge ${profile?.is_staff ? "bg-danger" : "bg-primary"} mb-2`}>
                    {profile?.is_staff ? "Quản trị viên" : "Khách hàng"}
                  </span>

                  <div className="mt-3 text-start">
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <i data-feather="mail" className="me-2" style={{ width: 14 }} />
                      <span>{profile?.email || "—"}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <i data-feather="phone" className="me-2" style={{ width: 14 }} />
                      <span>{profile?.phone_number || "—"}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <i data-feather="user" className="me-2" style={{ width: 14 }} />
                      <span>@{profile?.user_name || "—"}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                      <i data-feather="calendar" className="me-2" style={{ width: 14 }} />
                      <span>Tham gia: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : "—"}</span>
                    </div>
                  </div>

                  <hr />
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="fw-bold text-primary" style={{ fontSize: 20 }}>{profile?.points || 0}</div>
                      <div className="text-muted small">Điểm thưởng</div>
                    </div>
                    <div className="col-6">
                      <div className="fw-bold text-success" style={{ fontSize: 20 }}>{profile?.membership_tier || "Standard"}</div>
                      <div className="text-muted small">Hạng thành viên</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Edit Tabs */}
            <div className="col-xl-8 col-lg-8 col-md-12">
              <div className="card" style={{ borderRadius: "16px" }}>
                <div className="card-header bg-white border-0 pt-4 px-4">
                  <ul className="nav nav-tabs nav-tabs-solid nav-justified mb-0">
                    <li className="nav-item">
                      <button
                        className={`nav-link d-flex align-items-center justify-content-center gap-2 ${activeTab === "info" ? "active" : ""}`}
                        onClick={() => setActiveTab("info")}
                        style={{ cursor: "pointer", border: "none", background: "none" }}
                      >
                        <User size={15} />
                        Thông tin cá nhân
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link d-flex align-items-center justify-content-center gap-2 ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                        style={{ cursor: "pointer", border: "none", background: "none" }}
                      >
                        <Lock size={15} />
                        Đổi mật khẩu
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="card-body p-4">
                  {/* Tab: Thông tin cá nhân */}
                  {activeTab === "info" && (
                    <form onSubmit={handleSaveInfo}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Họ <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập họ..."
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            Tên <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập tên..."
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Nhập email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">Số điện thoại</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập số điện thoại..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label fw-bold">
                            <Camera size={15} className="me-1" />
                            Link ảnh đại diện (Avatar URL)
                          </label>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="https://... hoặc /media/..."
                              value={avatarUrl}
                              onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                            {avatarUrl && (
                              <img
                                src={avatarUrl}
                                alt="preview"
                                className="rounded-circle"
                                style={{ width: 42, height: 42, objectFit: "cover", border: "1px solid #ddd", minWidth: 42 }}
                                onError={(e) => { e.target.style.opacity = 0; }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Read-only fields */}
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold text-muted">Tên đăng nhập</label>
                          <input type="text" className="form-control bg-light" value={profile?.user_name || "—"} readOnly />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold text-muted">Vai trò</label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={profile?.is_staff ? "Quản trị viên (Admin)" : "Khách hàng"}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-2">
                        <button type="button" className="btn btn-cancel" onClick={fetchProfile} disabled={savingInfo}>
                          Đặt lại
                        </button>
                        <button type="submit" className="btn btn-submit" disabled={savingInfo}>
                          {savingInfo ? "Đang lưu..." : "Lưu thông tin"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tab: Đổi mật khẩu */}
                  {activeTab === "password" && (
                    <form onSubmit={handleChangePassword}>
                      <div className="row justify-content-center">
                        <div className="col-md-8">
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Mật khẩu hiện tại <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <input
                                type={showOld ? "text" : "password"}
                                className="form-control"
                                placeholder="Nhập mật khẩu hiện tại..."
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowOld(!showOld)}
                              >
                                <i data-feather={showOld ? "eye-off" : "eye"} style={{ width: 16 }} />
                                {showOld ? " Ẩn" : " Hiện"}
                              </button>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              Mật khẩu mới <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <input
                                type={showNew ? "text" : "password"}
                                className="form-control"
                                placeholder="Tối thiểu 8 ký tự..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowNew(!showNew)}
                              >
                                <i data-feather={showNew ? "eye-off" : "eye"} style={{ width: 16 }} />
                                {showNew ? " Ẩn" : " Hiện"}
                              </button>
                            </div>
                            {newPassword && newPassword.length < 8 && (
                              <div className="text-danger small mt-1">Mật khẩu phải có ít nhất 8 ký tự</div>
                            )}
                          </div>



                          <div className="alert alert-info small">
                            <i data-feather="info" className="me-1" style={{ width: 14 }} />
                            Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất khỏi tất cả thiết bị.
                          </div>

                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-cancel"
                              onClick={() => { setOldPassword(""); setNewPassword(""); }}
                              disabled={savingPassword}
                            >
                              Xóa trắng
                            </button>
                            <button type="submit" className="btn btn-submit" disabled={savingPassword}>
                              {savingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
