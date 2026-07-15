import React, { useRef, useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";

const Twostepverification = () => {
  const route = all_routes;
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length < 4) {
      setError("Please enter the 4-digit verification code");
      return;
    }
    console.log("OTP entered:", otpCode);
  };

  const handleResendOtp = () => {
    setError("");
    console.log("Resend OTP clicked");
  };



  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content">
            <div className="login-userset">
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
              </div>
              <Link to={route.dashboard} className="login-logo logo-white">
                <ImageWithBasePath src="assets/img/logo-white.png" alt />
              </Link>
              <div className="login-userheading">
                <h3>Login With Your Email Address</h3>
                <h4 className="verfy-mail-content">
                  We sent a verification code to your email. Enter the code from
                  the email in the field below
                </h4>
              </div>
              <form onSubmit={handleVerifyOtp} className="digit-group">
                <div className="wallet-add">
                  <div className="otp-box">
                    <div className="forms-block text-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          id={`digit-${index + 1}`}
                          maxLength={1}
                          value={digit}
                          ref={(el) => (inputRefs.current[index] = el)}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-danger text-center mt-2">
                      {error}
                    </div>
                  )}
                </div>
                <div className="Otp-expire text-center">
                  <p>Otp will expire in 09 :10</p>
                </div>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </button>
                </div>
                <div className="form-login mt-4">
                  <button type="submit" className="btn btn-login w-100">
                    Verify My Account
                  </button>
                </div>
              </form>
              <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Twostepverification;
