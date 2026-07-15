const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const PROVIDERS = new Set(["google", "facebook"]);

function oauthLoginUrl(provider) {
  if (!PROVIDERS.has(provider)) {
    throw new Error("Unsupported OAuth provider");
  }
  return `${API_URL}/api/v1/users/oauth/${provider}/login/`;
}

function startOAuthRedirect(provider, redirectPath) {
  sessionStorage.setItem("oauth_redirect", redirectPath || "/");
  window.location.assign(oauthLoginUrl(provider));
}

export { API_URL, oauthLoginUrl, startOAuthRedirect };
