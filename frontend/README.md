# FoodieGo Frontend Workspaces

Thư mục `frontend` được kiến trúc theo mô hình **Multi-App Workspaces**, bao gồm 2 ứng dụng độc lập nhằm tối ưu hiệu năng cho khách hàng và phân tách rõ ràng thư viện giao diện:

## 1. Cấu Trúc Các Ứng Dụng

```
frontend/
├── admin/       # [Trang Quản lý & POS - DreamPOS] Sử dụng Vite + React + Bootstrap/SCSS
└── emenu/       # [Trang Đặt món Khách hàng - Smart E-Menu] Sử dụng Vite + React + Redux/Antd
```

### 🏢 `frontend/admin` (DreamPOS Admin Dashboard)
- **Mục đích**: Dành cho Quản lý cửa hàng, Thu ngân (POS), Quản lý kho, Nhân sự, Báo cáo doanh thu.
- **Cổng khởi chạy mặc định**: `http://localhost:3000`
- **Lệnh khởi chạy**:
  ```bash
  cd admin
  npm install
  npm start
  ```

### 📱 `frontend/emenu` (Customer E-Menu)
- **Mục đích**: Dành cho Khách hàng xem thực đơn, chọn món, thêm vào giỏ hàng và đặt hàng trực tuyến hoặc tại bàn qua mã QR.
- **Cổng khởi chạy mặc định**: `http://localhost:5173`
- **Lệnh khởi chạy**:
  ```bash
  cd emenu
  npm install
  npm run dev
  ```

---

## 2. Kết Nối Backend

Cả 2 ứng dụng đều gọi API về **Django REST Framework Backend** đang chạy tại cổng `8000`:
- **Endpoint mặc định**: `http://localhost:8000/api`

---

## 3. Triển Khai (Deploy) với GitHub Actions & GitHub Pages

Khi triển khai tự động lên GitHub Pages bằng GitHub Actions, quy trình build sẽ xuất bản cả 2 ứng dụng vào cùng một trang duy nhất:
- **E-Menu Khách hàng**: Truy cập ngay tại đường dẫn gốc `https://<domain>/`
- **Quản lý DreamPOS**: Truy cập tại đường dẫn con `https://<domain>/admin/`
