# Tài liệu API FoodieGo (Chi tiết)

Toàn bộ hệ thống API được xây dựng theo chuẩn RESTful. Format trao đổi dữ liệu mặc định là `application/json`.
**Xác thực:** Sử dụng Bearer Token (JWT). Thêm header `Authorization: Bearer <your_access_token>` vào các request cần xác thực.

---

## 1. Xác thực & Người dùng (Authentication & Users)

| Chức năng | Method | Endpoint | Quyền (Role) | Body/Params |
| --- | --- | --- | --- | --- |
| Đăng nhập | `POST` | `/api/v1/users/login/` | Public | `{"username": "...", "password": "..."}` |
| Đăng ký | `POST` | `/api/v1/users/register/` | Public | `{"username": "...", "email": "...", "password": "..."}` |
| Refresh Token | `POST` | `/api/v1/users/refresh/` | Public | `{"refresh": "..."}` |
| Lấy User Profile | `GET` | `/api/v1/users/profile/` | Customer/Staff | *Header: Authorization* |
| Cập nhật Profile | `PUT` | `/api/v1/users/profile/` | Customer/Staff | `{"first_name": "...", "phone": "..."}` |

## 2. Thực đơn & Danh mục (Foods & Categories)

| Chức năng | Method | Endpoint | Quyền (Role) | Ghi chú |
| --- | --- | --- | --- | --- |
| Lấy DS Danh mục | `GET` | `/api/v1/categories/` | Public | |
| Lấy DS Món ăn | `GET` | `/api/v1/foods/` | Public | Hỗ trợ filter: `?category_id=1&search=...` |
| Chi tiết Món ăn | `GET` | `/api/v1/foods/{id}/` | Public | |
| Thêm Món mới | `POST` | `/api/v1/foods/` | Admin | `{"name": "...", "price": 100, "category": 1}` |
| Sửa/Xóa Món | `PUT/DELETE` | `/api/v1/foods/{id}/` | Admin | |

## 3. Đơn hàng (Orders)

| Chức năng | Method | Endpoint | Quyền (Role) | Body/Params |
| --- | --- | --- | --- | --- |
| Tạo Đơn hàng | `POST` | `/api/v1/orders/` | Customer | `{"table_id": 5, "items": [{"food_id": 1, "qty": 2}]}` |
| Lấy DS Đơn hàng | `GET` | `/api/v1/orders/` | Staff/Admin | Hỗ trợ filter trạng thái: `?status=PENDING` |
| Chi tiết Đơn | `GET` | `/api/v1/orders/{id}/` | Mọi Role | Trả về thông tin đơn và list món |
| Cập nhật Trạng thái | `PATCH` | `/api/v1/orders/{id}/` | Staff/Admin | `{"status": "PREPARING" \| "COMPLETED"}` |

## 4. Bàn & Đặt bàn (Tables)

| Chức năng | Method | Endpoint | Quyền (Role) | Ghi chú |
| --- | --- | --- | --- | --- |
| Lấy DS Bàn | `GET` | `/api/v1/tables/` | Public/Staff | Lấy trạng thái bàn (Trống/Đang sử dụng) |
| Cập nhật Bàn | `PATCH` | `/api/v1/tables/{id}/` | Staff/Admin | `{"is_occupied": true}` |
| Lấy Mã QR Bàn | `GET` | `/api/v1/tables/{id}/qr/` | Admin | Trả về URL ảnh QR của bàn |

## 5. Thanh toán & Khuyến mãi (Payments & Vouchers)

| Chức năng | Method | Endpoint | Quyền (Role) | Body/Params |
| --- | --- | --- | --- | --- |
| Lấy DS Voucher | `GET` | `/api/v1/vouchers/` | Customer/Public | Lấy mã giảm giá khả dụng |
| Áp dụng Voucher | `POST` | `/api/v1/orders/{id}/apply_voucher/` | Customer | `{"code": "SUMMER50"}` |
| Tạo Thanh toán QR | `POST` | `/api/v1/payments/create/` | Customer | `{"order_id": 12, "method": "BANK_TRANSFER"}` |
| Webhook (IPN) | `POST` | `/api/v1/payments/webhook/` | System | Data từ cổng thanh toán đẩy về hệ thống |

## 6. Tiện ích & Báo cáo (Utilities & Reports)

| Chức năng | Method | Endpoint | Quyền (Role) | Body/Params |
| --- | --- | --- | --- | --- |
| Gọi nhân viên | `POST` | `/api/v1/staff-calls/` | Customer | `{"table_id": 5, "reason": "Thanh toán"}` |
| Lấy DS Yêu cầu | `GET` | `/api/v1/staff-calls/` | Staff | Danh sách khách đang gọi |
| Xử lý Yêu cầu | `PATCH` | `/api/v1/staff-calls/{id}/` | Staff | `{"status": "RESOLVED"}` |
| Báo cáo Doanh thu | `GET` | `/api/v1/reports/revenue/` | Admin | Filter theo ngày/tháng/năm |
| Báo cáo Món bán chạy | `GET` | `/api/v1/reports/top-foods/` | Admin | |

---
**Lưu ý khi dùng Postman:** 
Tất cả các API cần quyền (Staff, Admin, Customer) đều phải có Bearer Token. Vui lòng gọi API `/login/` trước để lấy token, sau đó cấu hình vào mục Authorization của Postman.
