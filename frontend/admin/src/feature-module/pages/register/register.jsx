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

  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{9,11}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 9 to 11 digits";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = "Confirm password is required";
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    if (!agree) {
      newErrors.agree = "You must agree to the Terms & Privacy";
    }

    return newErrors;
  }

  async function handleRegister(e) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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
      localStorage.setItem("refresh_token", data.refresh_token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/");
    } catch (error) {
      setErrors({
        register:
          error.response?.data?.message ||
          error.response?.data?.msg ||
          error.response?.data?.detail ||
          "Register failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin(e) {
    e.preventDefault();
    setErrors({
      register:
        "Google registration is not available yet. Please register with email and password.",
    });
  }

  function handleFacebookLogin(e) {
    e.preventDefault();
    setErrors({
      register:
        "Facebook registration is not available yet. Please register with email and password.",
    });
  }

  function handleAppleLogin(e) {
    e.preventDefault();
    setErrors({
      register:
        "Apple registration is not available yet. Please register with email and password.",
    });
  }

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
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="Logo" />
                </Link>

                <div className="login-userheading">
                  <h3>Register</h3>
                  <h4>Create your FoodieGo account</h4>
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
                  {errors.username && (
                    <small className="text-danger">{errors.username}</small>
                  )}
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
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>

                <div className="form-login">
                  <label>Phone Number</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/phone.svg"
                      alt="img"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <small className="text-danger">{errors.phoneNumber}</small>
                  )}
                </div>

                <div className="form-login">
                  <label>Password</label>
                  <div className="pass-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="pass-input form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      className={`fas toggle-password ${
                        showPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>

                <div className="form-login">
                  <label>Confirm Password</label>
                  <div className="pass-group">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      className="pass-inputs form-control"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <span
                      className={`fas toggle-passwords ${
                        showPasswordConfirm ? "fa-eye" : "fa-eye-slash"
                      }`}
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  {errors.passwordConfirm && (
                    <small className="text-danger">
                      {errors.passwordConfirm}
                    </small>
                  )}
                </div>

                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="custom-control custom-checkbox justify-content-start">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                          <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                          />
                          <span className="checkmarks" />I agree to the{" "}
                          <Link to="#" className="hover-a">
                            Terms &amp; Privacy
                          </Link>
                        </label>
                      </div>

                      {errors.agree && (
                        <small className="text-danger">{errors.agree}</small>
                      )}
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
                    Already have an account?{" "}
                    <Link to={route.signin} className="hover-a">
                      Sign In
                    </Link>
                  </h4>
                </div>

                <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>

                <div className="form-sociallink">
                  <ul className="d-flex">
                    <li>
                      <Link
                        to="#"
                        className="facebook-logo"
                        onClick={handleFacebookLogin}
                      >
                        <ImageWithBasePath
                          src="assets/img/icons/facebook-logo.svg"
                          alt="Facebook"
                        />
                      </Link>
                    </li>

                    <li>
                      <Link to="#" onClick={handleGoogleLogin}>
                        <ImageWithBasePath
                          src="assets/img/icons/google.png"
                          alt="Google"
                        />
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="#"
                        className="apple-logo"
                        onClick={handleAppleLogin}
                      >
                        <ImageWithBasePath
                          src="assets/img/icons/apple-logo.svg"
                          alt="Apple"
                        />
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2026 FoodieGo. All rights reserved</p>
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