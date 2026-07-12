import React, { useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";

const Register = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const handleRegister = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!username.trim()) newErrors.username = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!phoneNumber.trim()) newErrors.phone = "Phone number is required";
    if (!password) newErrors.password = "Password is required";
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await axios.post(
        "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/users/register/",
        {
          username,
          email,
          password,
          password_confirm: passwordConfirm,
          phone_number: phoneNumber,
        }
      );

      const data = res.data.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(res.data.msg);

      navigate(route.dashboard);
    } catch (error) {
      setErrors({
        register:
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "Register failed",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper register-wrap bg-img">
          <div className="login-content">
            <form onSubmit={handleRegister}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt />
                </Link>
                <div className="login-userheading">
                  <h3>Register</h3>
                  <h4>Create New Dreamspos Account</h4>
                </div>
                <div className="form-login">
                  <label>Name</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/user-icon.svg"
                      alt="img"
                    />
                  </div>
                </div>
                <div className="form-login">
                  <label>Email Address</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/mail.svg"
                      alt="img"
                    />
                  </div>
                </div>
                <div className="form-login">
                  <label>Phone Number</label>
                  <div className="pass-group">
                    <input
                      type="number"
                      className="pass-input"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <span className="fas toggle-password fa-eye-slash" />
                  </div>
                </div>
                <div className="form-login">
                  <label>Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      className="pass-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="fas toggle-password fa-eye-slash" />
                  </div>
                </div>
                <div className="form-login">
                  <label>Confirm Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      className="pass-inputs"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <span className="fas toggle-passwords fa-eye-slash" />
                  </div>
                </div>
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-sm-8">
                      <div className="custom-control custom-checkbox justify-content-start">
                        <div className="custom-control custom-checkbox">
                          <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                            <input type="checkbox" />
                            <span className="checkmarks" />I agree to the{" "}
                            <Link to="#" className="hover-a">
                              Terms &amp; Privacy
                            </Link>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.register && (
                  <div className="alert alert-danger mt-3">
                    {errors.register}
                  </div>
                )}
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login w-100"
                    disabled={loading}
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>
                <div className="signinform">
                  <h4>
                    Already have an account ?{" "}
                    <button
                      type="submit"
                      className="btn btn-login w-100"
                      disabled={loading}
                    >
                      {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                  </h4>
                </div>
                <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>
                <div className="form-sociallink">
                  <ul className="d-flex">
                    <li>
                      <Link to="#" className="facebook-logo">
                        <ImageWithBasePath
                          src="assets/img/icons/facebook-logo.svg"
                          alt="Facebook"
                        />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/google.png"
                          alt="Google"
                        />
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="apple-logo">
                        <ImageWithBasePath
                          src="assets/img/icons/apple-logo.svg"
                          alt="Apple"
                        />
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
