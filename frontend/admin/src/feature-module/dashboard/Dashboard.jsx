import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  File,
  User,
  UserCheck,
} from "feather-icons-react/build/IconComponents";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { ArrowRight, Box } from "react-feather";
import { all_routes } from "../../Router/all_routes";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE } from "../../environment";

const formatCurrency = (value) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const Dashboard = () => {
  const route = all_routes;
  const [loading, setLoading] = useState(true);
  
  // States for API data
  const [summaryStats, setSummaryStats] = useState({});
  const [chartDays, setChartDays] = useState(7);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" };

        const [summaryRes, chartRes, statusRes, dishesRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/v1/admin/reports/`, { headers }),
          axios.get(`${API_BASE}/api/v1/admin/reports/revenue-chart/?days=${chartDays}`, { headers }),
          axios.get(`${API_BASE}/api/v1/admin/reports/order-status/`, { headers }),
          axios.get(`${API_BASE}/api/v1/admin/reports/top-dishes/?limit=5`, { headers }),
          axios.get(`${API_BASE}/api/v1/admin/reports/recent-orders/?limit=5`, { headers })
        ]);

        setSummaryStats(summaryRes.data?.data || summaryRes.data);
        setRevenueChartData(chartRes.data?.data || chartRes.data);
        setOrderStatusData(statusRes.data?.data || statusRes.data);
        setTopDishes(dishesRes.data?.data || dishesRes.data);
        setRecentOrders(ordersRes.data?.data || ordersRes.data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [chartDays]);
  const getRevenueChartOptions = () => {
    const categories = revenueChartData.map(item => item.date);
    const revenues = revenueChartData.map(item => item.revenue);
    const orders = revenueChartData.map(item => item.orders);
    
    return {
      series: [
        { name: "Doanh thu", type: 'column', data: revenues },
        { name: "Số đơn", type: 'line', data: orders }
      ],
      options: {
        chart: { height: 320, type: "line", zoom: { enabled: false } },
        colors: ["#28C76F", "#EA5455"],
        stroke: { width: [0, 4] },
        dataLabels: { enabled: false, enabledOnSeries: [1] },
        labels: categories,
        xaxis: { type: 'category' },
        yaxis: [
          { title: { text: 'Doanh thu (VNĐ)' }, labels: { formatter: (val) => new Intl.NumberFormat("vi-VN").format(val) } },
          { opposite: true, title: { text: 'Số đơn' } }
        ],
        legend: { position: 'top', horizontalAlign: 'right' }
      }
    };
  };

  const getPieChartOptions = () => {
    const labels = orderStatusData.map(item => item.status);
    const series = orderStatusData.map(item => item.count);
    return {
      series: series,
      options: {
        chart: { type: 'donut', height: 320 },
        labels: labels,
        colors: ['#28C76F', '#FF9F43', '#EA5455', '#00CFE8', '#A8AAAE', '#FF3F3F'],
        plotOptions: { donut: { size: '65%' } },
        dataLabels: { enabled: true },
        legend: { position: 'bottom' },
        responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }]
      }
    };
  };

  const MySwal = withReactContent(Swal);
  const showConfirmationAlert = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          className: "btn btn-success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else {
        MySwal.close();
      }
    });
  };
  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="row">
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-widget w-100">
                <div className="dash-widgetimg">
                  <span><ImageWithBasePath src="assets/img/icons/dash1.svg" alt="img" /></span>
                </div>
                <div className="dash-widgetcontent">
                  <h5>{loading ? "..." : formatCurrency(summaryStats?.total_revenue)}</h5>
                  <h6>Tổng doanh thu</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-widget dash1 w-100">
                <div className="dash-widgetimg">
                  <span><ImageWithBasePath src="assets/img/icons/dash2.svg" alt="img" /></span>
                </div>
                <div className="dash-widgetcontent">
                  <h5>{loading ? "..." : formatCurrency(summaryStats?.today_revenue)}</h5>
                  <h6>Doanh thu hôm nay</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-widget dash2 w-100">
                <div className="dash-widgetimg">
                  <span><ImageWithBasePath src="assets/img/icons/dash3.svg" alt="img" /></span>
                </div>
                <div className="dash-widgetcontent">
                  <h5>{loading ? "..." : <CountUp start={0} end={summaryStats?.total_orders || 0} duration={2} />}</h5>
                  <h6>Tổng số đơn</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-widget dash3 w-100">
                <div className="dash-widgetimg">
                  <span><ImageWithBasePath src="assets/img/icons/dash4.svg" alt="img" /></span>
                </div>
                <div className="dash-widgetcontent">
                  <h5>{loading ? "..." : <CountUp start={0} end={summaryStats?.today_orders || 0} duration={2} />}</h5>
                  <h6>Đơn hôm nay</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count">
                <div className="dash-counts">
                  <h4>{loading ? "..." : summaryStats?.completed_orders || 0}</h4>
                  <h5>Đơn hoàn thành</h5>
                </div>
                <div className="dash-imgs"><User /></div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count das1">
                <div className="dash-counts">
                  <h4>{loading ? "..." : summaryStats?.pending_orders || 0}</h4>
                  <h5>Đơn chờ xử lý</h5>
                </div>
                <div className="dash-imgs"><UserCheck /></div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count das2">
                <div className="dash-counts">
                  <h4>{loading ? "..." : summaryStats?.total_users || 0}</h4>
                  <h5>Tổng người dùng</h5>
                </div>
                <div className="dash-imgs">
                  <ImageWithBasePath src="assets/img/icons/file-text-icon-01.svg" className="img-fluid" alt="icon" />
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className="dash-count das3">
                <div className="dash-counts">
                  <h4>{loading ? "..." : summaryStats?.new_users_today || 0}</h4>
                  <h5>Người dùng mới hôm nay</h5>
                </div>
                <div className="dash-imgs"><File /></div>
              </div>
            </div>
          </div>
          {/* Button trigger modal */}

          <div className="row">
            {/* Revenue Chart */}
            <div className="col-xl-8 col-sm-12 col-12 d-flex">
              <div className="card flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Biểu đồ doanh thu</h5>
                  <div className="graph-sets">
                    <div className="dropdown dropdown-wraper">
                      <button
                        className="btn btn-light btn-sm dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {chartDays === 7 ? "7 Ngày Qua" : chartDays === 30 ? "30 Ngày Qua" : "90 Ngày Qua"}
                      </button>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                      >
                        <li>
                          <Link to="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setChartDays(7); }}>
                            7 Ngày Qua
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setChartDays(30); }}>
                            30 Ngày Qua
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); setChartDays(90); }}>
                            90 Ngày Qua
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {!loading && revenueChartData.length > 0 ? (
                    <Chart
                      options={getRevenueChartOptions().options}
                      series={getRevenueChartOptions().series}
                      type="line"
                      height={320}
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: 320 }}>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Status Donut Chart */}
            <div className="col-xl-4 col-sm-12 col-12 d-flex">
              <div className="card flex-fill">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Trạng thái đơn hàng</h5>
                </div>
                <div className="card-body">
                  {!loading && orderStatusData.length > 0 ? (
                    <Chart
                      options={getPieChartOptions().options}
                      series={getPieChartOptions().series}
                      type="donut"
                      height={320}
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: 320 }}>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {/* Top Món Ăn Bán Chạy */}
            <div className="col-xl-6 col-sm-12 col-12 d-flex">
              <div className="card flex-fill default-cover mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4 className="card-title mb-0">Top Món Ăn Bán Chạy</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive dataview">
                    <table className="table dashboard-recent-products">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Món Ăn</th>
                          <th>Lượt Bán</th>
                          <th>Doanh Thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="4" className="text-center">Đang tải...</td></tr>
                        ) : topDishes.length > 0 ? (
                          topDishes.map((dish, index) => (
                            <tr key={dish.product_id || index}>
                              <td>{index + 1}</td>
                              <td className="productimgname">
                                <Link to="#" className="product-img">
                                  <img
                                    src={dish.image_url || "assets/img/products/stock-img-01.png"}
                                    alt="product"
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                  />
                                </Link>
                                <Link to="#">{dish.product_name}</Link>
                              </td>
                              <td>{dish.total_quantity}</td>
                              <td>{formatCurrency(dish.total_revenue)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="text-center">Không có dữ liệu</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Đơn Hàng Mới Nhất */}
            <div className="col-xl-6 col-sm-12 col-12 d-flex">
              <div className="card flex-fill default-cover mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4 className="card-title mb-0">Đơn Hàng Mới Nhất</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive dataview">
                    <table className="table dashboard-recent-products">
                      <thead>
                        <tr>
                          <th>Mã Đơn</th>
                          <th>Khách Hàng</th>
                          <th>Trạng Thái</th>
                          <th>Tổng Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="4" className="text-center">Đang tải...</td></tr>
                        ) : recentOrders.length > 0 ? (
                          recentOrders.map((order, index) => (
                            <tr key={order.id || index}>
                              <td>
                                <Link to="#">#{order.id}</Link>
                              </td>
                              <td>{order.customer_name || "Khách Vãng Lai"}</td>
                              <td>
                                <span className={`badges ${
                                  order.status === 'completed' ? 'bg-lightgreen' :
                                  order.status === 'pending' || order.status === 'awaiting_payment' ? 'bg-lightyellow' :
                                  order.status === 'cancelled' ? 'bg-lightred' :
                                  'bg-lightgrey'
                                }`}>
                                  {order.status_display || order.status}
                                </span>
                              </td>
                              <td>{formatCurrency(order.total_amount)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="text-center">Không có dữ liệu</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
