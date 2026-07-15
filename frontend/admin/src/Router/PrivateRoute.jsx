import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * PrivateRoute - Route guard bảo vệ các trang cần đăng nhập.
 *
 * Cách dùng trong router.jsx (dùng như layout wrapper):
 *   <Route element={<PrivateRoute />}>
 *     ... các route con (publicRoutes) ...
 *   </Route>
 *
 * Nếu không có token trong localStorage → redirect sang /signin.
 * Lưu lại đường dẫn hiện tại qua state.from để có thể quay lại sau khi đăng nhập.
 */
const PrivateRoute = () => {
  const location = useLocation();

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("access_token");

  if (!token) {
    // Redirect đến /signin, lưu lại trang định vào qua state
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Có token → render các route con bình thường qua <Outlet>
  return <Outlet />;
};

export default PrivateRoute;
