import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { all_routes } from "../../../Router/all_routes";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { API_URL, startOAuthRedirect } from "../../../api/auth/oauthClient";

const Signin = () => {
  const route = all_routes;
  const [email, setEmail] = useState(
    localStorage.getItem("adminEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    !!localStorage.getItem("adminEmail")
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const socialRedirectStarted = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  function getRequestedPath() {
    const from = location.state?.from;
    if (typeof from === "string") {
      return from;
    }
    return from?.pathname ? `${from.pathname}${from.search || ""}` : "/";
  }

  async function startSocialSignIn(provider) {
    if (loading || socialRedirectStarted.current) {
      return;
    }

    socialRedirectStarted.current = true;
    setSocialLoading(provider);
    setErrors((current) => ({ ...current, login: undefined }));

    try {
      await axios.get(`${API_URL}/health/`, {
        timeout: 3000,
        validateStatus: () => true,
      });
      startOAuthRedirect(provider, getRequestedPath());
    } catch {
      socialRedirectStarted.current = false;
      setSocialLoading("");
      setErrors((current) => ({
        ...current,
        login:
          "Cannot connect to the server. Please start the backend and try again.",
      }));
    }
  }

  function handleGoogleSignIn() {
    startSocialSignIn("google");
  }

  function handleFacebookSignIn() {
    startSocialSignIn("facebook");
  }

  function validate() {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  }

  async function handleSignIn(event) {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/v1/users/login/`, {
        email,
        password,
      });
      const { access_token: accessToken, refresh_token: refreshToken } =
        response.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      if (remember) {
        localStorage.setItem("adminEmail", email);
      } else {
        localStorage.removeItem("adminEmail");
      }

      navigate("/");
    } catch (error) {
      setErrors({
        login:
          error.response?.data?.msg ||
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "An error occurred during sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const socialDisabled = loading || !!socialLoading;
  const socialIcon = (provider, src) =>
    socialLoading === provider ? (
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
    ) : (
      <ImageWithBasePath src={src} alt="" />
    );

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content">
            <form onSubmit={handleSignIn}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="" />
                </Link>
                <div className="login-userheading">
                  <h3>Sign In</h3>
                  <h4>
                    Access the Dreamspos panel using your email and passcode.
                  </h4>
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
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

                <div className="form-login mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="pass-input form-control"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
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
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      <div className="custom-control custom-checkbox">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                          <input
                            type="checkbox"
                            className="form-control"
                            checked={remember}
                            onChange={(event) =>
                              setRemember(event.target.checked)
                            }
                          />
                          <span className="checkmarks" />
                          Remember me
                        </label>
                      </div>
                      <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.login && (
                  <div className="alert alert-danger py-2">{errors.login}</div>
                )}
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login"
                    disabled={loading || !!socialLoading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
                <div className="signinform">
                  <h4>
                    New on our platform?
                    <Link to={route.register} className="hover-a">
                      {" "}
                      Create an account
                    </Link>
                  </h4>
                </div>
                <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>
                <div className="form-sociallink">
                  <ul className="d-flex">
                    <li>
                      <button
                        type="button"
                        className="facebook-logo"
                        onClick={handleFacebookSignIn}
                        disabled={socialDisabled}
                        aria-label="Sign in with Facebook"
                        aria-busy={socialLoading === "facebook"}
                      >
                        {socialIcon(
                          "facebook",
                          "assets/img/icons/facebook-logo.svg"
                        )}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={socialDisabled}
                        aria-label="Sign in with Google"
                        aria-busy={socialLoading === "google"}
                      >
                        {socialIcon("google", "assets/img/icons/google.png")}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="apple-logo"
                        disabled
                        aria-label="Sign in with Apple (not available yet)"
                        title="Apple sign-in is not available yet"
                      >
                        <ImageWithBasePath
                          src="assets/img/icons/apple-logo.svg"
                          alt="Apple"
                        />
                      </button>
                    </li>
                  </ul>
                  <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                    <p>Copyright © 2026 DreamsPOS. All rights reserved</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
