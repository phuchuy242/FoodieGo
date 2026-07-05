# PHÂN CÔNG NHIỆM VỤ CHI TIẾT — TEAM 6 THÀNH VIÊN (FOODIEGO)

Tài liệu này quy định rõ vai trò và phân chia công việc (Tasks) cho 6 thành viên trong nhóm theo từng Sprint (S1 → S4), tuân thủ đúng tài liệu [SPRINT-PLANNING.md](SPRINT-PLANNING.md) và [FOODIEGO-MASTER-TASKS.md](FOODIEGO-MASTER-TASKS.md).

---

## 👥 DANH SÁCH & VAI TRÒ CHỦ ĐẠO

| STT | Họ và Tên | Vai Trò Chính | Trách Nhiệm Phụ Trách |
|---|---|---|---|
| 1 | **Trần Ngọc Phúc Huy** | **Backend Lead & DevOps** | **Full 100% Backend Tasks**, Database PostgreSQL, Auth JWT, Redis, Celery, Microservices, Docker, k6 Load Test, CI/CD Pipeline. |
| 2 | **Trần Vương Thuận** | **Frontend Lead (E-Menu & Figma)** | Thiết kế Figma E-Menu, kiến trúc app `frontend/emenu`, Trang chủ Khách hàng, Menu Món ăn & Tìm kiếm món. |
| 3 | **Nguyễn Thái Hoàng Hiếu** | **Frontend Dev (Customer Order Flow)** | Thiết kế Figma Cart/Checkout, giao diện Giỏ hàng (`Cart UI`), Trang Thanh toán (`Checkout UI`), Lịch sử đơn hàng. |
| 4 | **Trần Vương Hùng** | **Frontend Dev (Admin Dashboard & POS)** | Thiết kế Figma Admin DreamPOS, Layout Admin, Quản lý Món ăn/Danh mục (`Food/Category UI`), Báo cáo Doanh thu. |
| 5 | **Nguyễn Trọng Dương** | **Frontend Dev (Admin Order & Voucher)** | Thiết kế Figma Màn hình Thu ngân (POS), Quản lý Đơn hàng Admin, Quản lý Khuyến mãi (`Voucher UI`). |
| 6 | **Nguyễn Hoàng Nam** | **Frontend Dev & QA / SPQM Docs** | Thiết kế Figma Auth & Users, Đăng ký/Đăng nhập UI, Quản lý Người dùng Admin (`User Management UI`), Đánh giá & Review, Báo cáo SPQM. |

---

## 📅 PHÂN CÔNG CHI TIẾT THEO SPRINT

### 🏁 SPRINT 1 — NỀN TẢNG & MENU (Tuần 1 - SP: 26)

#### ⚡ 1. Trần Ngọc Phúc Huy (Backend)
- `FOOD-001`: Khởi tạo dự án Backend Django REST Framework, setup CSDL PostgreSQL.
- `FOOD-002`: Thiết lập GitHub Actions CI cho Backend (chạy linter & automated tests).
- `FOOD-003`: Cấu hình xác thực JWT (SimpleJWT), phân quyền cơ bản.
- `FOOD-005`: Viết API CRUD Category (Danh mục món ăn).
- `FOOD-006`: Viết API CRUD Food (Món ăn, giá bán, hình ảnh).
- `FOOD-007`: Viết API Tìm kiếm, lọc món ăn theo danh mục/giá.
- `FOOD-009`: Cấu hình Swagger/OpenAPI tự động sinh tài liệu API cho team Frontend.

#### 🎨 2. Trần Vương Thuận (Frontend E-Menu & Figma)
- **Figma**: Thiết kế Design System & Wireframe màn hình Trang chủ E-Menu, Danh sách món ăn.
- `FOOD-001 (FE)`: Setup kiến trúc Vite cho `frontend/emenu`.
- `FOOD-008`: Xây dựng giao diện Trang chủ Khách hàng, hiển thị danh mục và thẻ món ăn (Menu Card). Tích hợp API gọi danh sách món từ Backend.

#### 🎨 3. Nguyễn Thái Hoàng Hiếu (Frontend E-Menu)
- **Figma**: Thiết kế Wireframe chi tiết món ăn (Detail Modal), chọn Topping/Size.
- Xây dựng Component Modal xem chi tiết món ăn và chọn biến thể (`DetailProducts.jsx`, `VariantModal.jsx`).

#### 🎨 4. Trần Vương Hùng (Frontend Admin & Figma)
- **Figma**: Thiết kế Design System & Layout tổng thể cho Trang Quản lý DreamPOS.
- `FOOD-001 (FE Admin)`: Setup kiến trúc Vite cho `frontend/admin`.
- Xây dựng giao diện Quản lý Danh mục món ăn (`Category CRUD UI`) trong Admin.

#### 🎨 5. Nguyễn Trọng Dương (Frontend Admin)
- **Figma**: Thiết kế Wireframe trang Quản lý Món ăn (Thêm/Sửa/Xóa Món).
- Xây dựng giao diện Quản lý Món ăn (`Food CRUD UI`), form upload hình ảnh và định giá sản phẩm trong Admin.

#### 🎨 6. Nguyễn Hoàng Nam (Frontend Auth & QA)
- **Figma**: Thiết kế giao diện Đăng nhập / Đăng ký cho cả Khách hàng và Admin.
- `FOOD-004 (FE UI)`: Xây dựng màn hình Đăng nhập (`LoginPhone.jsx`), Đăng ký và lưu trữ token JWT vào LocalStorage/Redux.

---

### 🛒 SPRINT 2 — GIỎ HÀNG & ĐƠN HÀNG (Tuần 2 - SP: 37)

#### ⚡ 1. Trần Ngọc Phúc Huy (Backend)
- `FOOD-010`: Viết API Giỏ hàng (Thêm/Sửa số lượng/Xóa món trong giỏ).
- `FOOD-012`: Viết API Tạo Đơn hàng (Create Order & Order Items transaction).
- `FOOD-013`: Cập nhật trạng thái thanh toán COD & luồng chuyển trạng thái đơn (Pending → Processing → Shipping → Completed).
- `FOOD-015`: Viết API Theo dõi trạng thái đơn hàng theo ID / User.
- `FOOD-016`: Viết API Admin quản lý danh sách Users & khóa tài khoản.
- `FOOD-coverage-70`: Viết Unit Test cho Backend đạt độ phủ tối thiểu **70%**.

#### 🎨 2. Trần Vương Thuận (Frontend E-Menu)
- Tích hợp state Giỏ hàng toàn cục (Redux Toolkit) cho Trang Khách hàng.
- Thêm hiệu ứng bay vào giỏ hàng và cập nhật số lượng badge trên Header.

#### 🎨 3. Nguyễn Thái Hoàng Hiếu (Frontend E-Menu)
- **Figma**: Thiết kế màn hình Giỏ hàng & Thanh toán trên Mobile/Tablet.
- `FOOD-011`: Xây dựng giao diện Trang Giỏ hàng (`Cart UI`, `CartSummary.jsx`).
- `FOOD-014`: Xây dựng Trang Thanh toán (`Checkout Page`), nhập địa chỉ giao hàng và phương thức thanh toán.

#### 🎨 4. Trần Vương Hùng (Frontend Admin)
- `FOOD-017`: Hoàn thiện bố cục Layout Admin chuẩn POS (`Sidebar`, `Header`, `Breadcrumbs`).
- Xây dựng màn hình danh sách Đơn hàng tổng quan trong Admin.

#### 🎨 5. Nguyễn Trọng Dương (Frontend Admin POS)
- **Figma**: Thiết kế màn hình bán hàng tại quầy POS (`POS Design`).
- `FOOD-012 (Admin UI)`: Xây dựng màn hình Thu ngân POS cho phép nhân viên bấm chọn món nhanh cho khách mua trực tiếp tại quán và đổi trạng thái đơn hàng.

#### 🎨 6. Nguyễn Hoàng Nam (Frontend Admin Users & QA)
- `FOOD-015 (FE UI)`: Xây dựng trang Lịch sử đơn hàng và theo dõi tiến độ giao hàng cho Khách (`HistoryOrder.jsx`).
- `FOOD-016 (UI)`: Xây dựng trang Quản lý Người dùng (`Employees/Users Grid UI`) trong Admin.
- **QA**: Kiểm thử luồng đặt hàng End-to-End từ E-Menu sang Admin.

---

### 🚀 SPRINT 3 — MỞ RỘNG & CHẤT LƯỢNG (Tuần 3 - SP: 36)

#### ⚡ 1. Trần Ngọc Phúc Huy (Backend)
- `FOOD-018`: Phân quyền RBAC 4 vai trò (Admin, Manager, Staff, Customer).
- `FOOD-019`: Tích hợp Redis Cache để tối ưu tốc độ đọc Menu món ăn.
- `FOOD-020`: Viết API Quản lý Voucher (CRUD khuyến mãi).
- `FOOD-021`: Viết logic tính giảm giá Voucher khi Checkout.
- `FOOD-022`: Viết API Rating & Review món ăn sau khi hoàn tất đơn.
- `FOOD-023` & `FOOD-024`: Tích hợp Celery Jobs gửi email thông báo đặt hàng thành công / nhắc nhở.
- `FOOD-025`: Viết API thống kê Báo cáo doanh thu theo ngày/tuần/tháng.
- `FOOD-026` & `FOOD-027`: Đóng gói Docker Compose & tích hợp SonarQube Quality Gate (Coverage ≥ 80%).

#### 🎨 2. Trần Vương Thuận (Frontend E-Menu)
- Tích hợp hiển thị Badge Khuyến mãi & Món ăn bán chạy trên thẻ món ăn E-Menu.
- Tối ưu hiệu năng hiển thị danh sách món (Lazy Loading / Virtual Scroll).

#### 🎨 3. Nguyễn Thái Hoàng Hiếu (Frontend E-Menu)
- `FOOD-021 (FE UI)`: Tích hợp ô nhập mã Voucher tại trang Checkout, tự động tính lại tổng tiền.
- Xây dựng màn hình Đặt hàng thành công (`OrderSuccessful.jsx`).

#### 🎨 4. Trần Vương Hùng (Frontend Admin Dashboard)
- `FOOD-025 (UI)`: Xây dựng trang Dashboard chính thống kê biểu đồ doanh thu, số lượng đơn hàng bằng ApexCharts/Chart.js.

#### 🎨 5. Nguyễn Trọng Dương (Frontend Admin Voucher)
- **Figma**: Thiết kế màn hình tạo và quản lý mã giảm giá.
- `FOOD-020 (UI)`: Xây dựng trang Quản lý Voucher (Tạo mã, hạn sử dụng, điều kiện giảm giá) trong Admin.

#### 🎨 6. Nguyễn Hoàng Nam (Frontend Reviews & SPQM Docs)
- `FOOD-022 (UI)`: Xây dựng giao diện Đánh giá & Bình luận số sao cho món ăn trên E-Menu và trang duyệt bình luận trong Admin.
- Tác vụ gọi chuông phục vụ (`CallStaff.jsx`).

---

### 🏗️ SPRINT 4 — MICROSERVICES & NỘP BÀI (Tuần 4 - SP: 35)

#### ⚡ 1. Trần Ngọc Phúc Huy (Backend Lead)
- `FOOD-028`: Tách & đóng gói `User Service` độc lập.
- `FOOD-029`: Tách & đóng gói `Food Service` độc lập.
- `FOOD-030`: Tách & đóng gói `Order Service` độc lập.
- `FOOD-031`: Xây dựng `API Gateway` điều hướng request.
- `FOOD-032`: Tích hợp hệ thống giám sát Prometheus & Grafana Dashboard.
- `FOOD-033`: Thực hiện Load Testing bằng k6 (Đảm bảo P95 < 500ms với 500 VUs).

#### 🎨 2. Trần Vương Thuận & 3. Nguyễn Thái Hoàng Hiếu (Frontend E-Menu Polish)
- Cập nhật endpoint API của E-Menu sang cổng API Gateway mới (`FOOD-031`).
- `FOOD-final-polish`: Trao đổi, tinh chỉnh UI/UX, kiểm tra tính responsive trên mọi thiết bị di động (Mobile/Tablet).

#### 🎨 4. Trần Vương Hùng & 5. Nguyễn Trọng Dương (Frontend Admin Polish)
- Cập nhật endpoint API của Admin DreamPOS sang API Gateway mới.
- Rà soát các lỗi hiển thị trên bảng biểu (`DataTables`), kiểm tra tính ổn định của luồng POS.

#### 🎨 6. Nguyễn Hoàng Nam (QA Lead & SPQM Final Report)
- `FOOD-spqm-final-report`: Tổng hợp toàn bộ số liệu kiểm thử, SonarQube, k6 Load Test vào báo cáo SPQM đồ án.
- Phối hợp với cả team quay kịch bản **Demo Video 5-10 phút** giới thiệu luồng hoạt động từ Khách đặt món (E-Menu) đến Thu ngân xử lý (DreamPOS Admin) và hệ thống Microservices đằng sau.
