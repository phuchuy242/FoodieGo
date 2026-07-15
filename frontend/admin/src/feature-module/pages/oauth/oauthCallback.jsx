import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../api/auth/oauthClient";

const DEFAULT_ERROR = "Không thể hoàn tất đăng nhập. Vui lòng thử lại.";

function safeRedirectPath(value) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/oauth/callback")
  ) {
    return "/";
  }
  return value;
}

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) {
      return;
    }
    exchangeStarted.current = true;

    const oauthError = searchParams.get("error");
    const handoffCode = searchParams.get("code");
    window.history.replaceState({}, document.title, "/oauth/callback");

    if (oauthError) {
      setError(oauthError.slice(0, 300));
      setStatus("error");
      return;
    }

    if (!handoffCode) {
      setError("Không nhận được mã xác thực đăng nhập.");
      setStatus("error");
      return;
    }

    async function exchangeCode() {
      try {
        const response = await axios.post(
          `${API_URL}/api/v1/users/oauth/exchange/`,
          { code: handoffCode }
        );
        const payload = response.data?.data || {};
        const accessToken = payload.access || payload.access_token;
        const refreshToken = payload.refresh || payload.refresh_token;

        if (!accessToken || !refreshToken) {
          throw new Error("invalid_oauth_response");
        }

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        const redirectPath = safeRedirectPath(
          sessionStorage.getItem("oauth_redirect")
        );
        sessionStorage.removeItem("oauth_redirect");
        setStatus("success");
        window.setTimeout(() => navigate(redirectPath, { replace: true }), 500);
      } catch (requestError) {
        sessionStorage.removeItem("oauth_redirect");
        setError(requestError.response?.data?.msg || DEFAULT_ERROR);
        setStatus("error");
      }
    }

    exchangeCode();
  }, [navigate, searchParams]);

  return (
    <div className="oauth-callback-page">
      <div className="oauth-callback-card" role="status" aria-live="polite">
        {status === "error" && (
          <>
            <h3 className="text-danger mb-2">Đăng nhập thất bại</h3>
            <p className="mb-4">{error}</p>
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => navigate("/signin", { replace: true })}
            >
              Quay lại đăng nhập
            </button>
          </>
        )}

        {status === "loading" && (
          <>
            <div
              className="spinner-border text-primary mb-3"
              aria-hidden="true"
            />
            <h3>Đang hoàn tất đăng nhập</h3>
            <p>Vui lòng chờ trong giây lát...</p>
          </>
        )}

        {status === "success" && (
          <>
            <i className="fa fa-check-circle text-success fs-1 mb-3" />
            <h3>Đăng nhập thành công</h3>
            <p>Đang chuyển đến trang của bạn...</p>
          </>
        )}
      </div>
    </div>
  );
};

export { safeRedirectPath };
export default OAuthCallback;
