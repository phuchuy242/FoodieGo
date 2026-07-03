import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "../InitialPage/Sidebar/Header";
import Sidebar from "../InitialPage/Sidebar/Sidebar";
import { pagesRoute, posRoutes, publicRoutes } from "./router.link";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import ThemeSettings from "../InitialPage/themeSettings";
// import CollapsedSidebar from "../InitialPage/Sidebar/collapsedSidebar";
import Loader from "../feature-module/loader/loader";
// import HorizontalSidebar from "../InitialPage/Sidebar/horizontalSidebar";
//import LoadingSpinner from "../InitialPage/Sidebar/LoadingSpinner";

const AllRoutes = () => {
  const data = useSelector((state) => state.toggle_header);
  // const layoutStyles = useSelector((state) => state.layoutstyledata);
  const HeaderLayout = () => (
    <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
      <Header />
      {/* {layoutStyles == "collapsed" ? (
        <CollapsedSidebar />
      ) : layoutStyles == "horizontal" ? (
        <HorizontalSidebar />
      ) : (
        <Sidebar />
      )} */}
      <Sidebar />
      <Outlet />
      <ThemeSettings />
      <Loader />
    </div>
  );

  const Authpages = () => (
    <div className={data ? "header-collapse" : ""}>
      <Outlet />
      <Loader />
      <ThemeSettings />
    </div>
  );

  const Pospages = () => (
    <div>
      <Header />
      <Outlet />
      <Loader />
      <ThemeSettings />
    </div>
  );

  console.log(publicRoutes, "dashboard");

  return (
    <div>
      <Routes>
        <Route path="/pos" element={<Pospages />}>
          {posRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>
        <Route path={"/"} element={<HeaderLayout />}>
          {publicRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>

        <Route path={"/"} element={<Authpages />}>
          {pagesRoute.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>

        {/* <Route path={"/expenses/"} element={<HeaderLayout />}>
          {expensesRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route> */}
      </Routes>
    </div>
  );
};
export default AllRoutes;
