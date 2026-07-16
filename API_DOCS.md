# Tài liệu API FoodieGo (Chi tiết)

Toàn bộ hệ thống API được xây dựng theo chuẩn RESTful. Format trao đổi dữ liệu mặc định là `application/json`.
**Xác thực:** Sử dụng Bearer Token (JWT). Thêm header `Authorization: Bearer <your_access_token>` vào các request cần xác thực.

---

## 1. Xác thực & Người dùng (Auth & Users)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Đăng nhập | `POST` | `/api/v1/users/login/` | Public |
| Đăng ký | `POST` | `/api/v1/users/register/` | Public |
| Làm mới Token | `POST` | `/api/v1/users/refresh/` | Public |
| Đăng xuất | `POST` | `/api/v1/users/logout/` | Có Token |
| Lấy/Sửa Profile | `GET/PUT`| `/api/v1/users/profile/` | Có Token |
| Đổi mật khẩu | `POST` | `/api/v1/users/password/` | Có Token |
| Quên mật khẩu | `POST` | `/api/v1/users/forgot-password/` | Public |
| Xác thực OTP | `POST` | `/api/v1/users/verify-otp/` | Public |
| Quản lý Địa chỉ Giao hàng | `CRUD` | `/api/v1/users/addresses/` | Customer |
| Lấy Voucher của Tôi | `GET` | `/api/v1/users/vouchers/` | Customer |

## 2. Thực đơn & Danh mục (Menu & Categories)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Danh sách Danh mục | `GET` | `/api/v1/menu/categories/` | Public |
| Danh sách Món ăn (Items) | `GET` | `/api/v1/menu/items/` | Public |
| Món phổ biến (Popular) | `GET` | `/api/v1/menu/popular/` | Public |
| Danh sách Toppings | `GET` | `/api/v1/menu/toppings/` | Public |
| Cập nhật Món ăn/Danh mục | `POST/PUT/DEL` | *(Thêm `/api/v1/menu/...`)* | Admin |

## 3. Đơn hàng (Orders)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Lấy danh sách Đơn hàng | `GET` | `/api/v1/orders/` | Staff/Admin |
| Tạo Đơn hàng mới | `POST` | `/api/v1/orders/` | Customer |
| Tính phí giao hàng | `POST` | `/api/v1/orders/calculate-fee/` | Customer |
| Lịch sử đơn hàng | `GET` | `/api/v1/orders/history/` | Customer |
| Xác nhận đơn hàng | `POST` | `/api/v1/orders/{id}/confirm/` | Staff |
| Hủy đơn hàng | `POST` | `/api/v1/orders/{id}/cancel/` | Customer/Staff |
| Cập nhật trạng thái Đơn | `POST` | `/api/v1/orders/{id}/update-status/` | Staff/Admin |
| Đánh giá đơn hàng (Rate) | `POST` | `/api/v1/orders/{id}/rate/` | Customer |

## 4. Thanh toán (Payments)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Lấy danh sách Giao dịch | `GET` | `/api/v1/payments/` | Admin |
| Tạo thanh toán QR (Auto-Confirm) | `POST` | `/api/v1/payments/create_with_qr/` | Customer |
| Webhook (SePay IPN) | `POST` | `/api/v1/payments/webhook/sepay/` | System |
| Quản lý Tài khoản Ngân hàng | `CRUD` | `/api/v1/payments/bank-accounts/` | Admin |
| Thanh toán bằng Mã (Paycode) | `GET` | `/api/v1/payments/by_pay_code/` | Staff |

## 5. Khuyến mãi (Vouchers)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Danh sách Vouchers | `GET` | `/api/v1/vouchers/` | Customer/Public |
| Áp dụng Voucher | `POST` | `/api/v1/vouchers/{id}/apply/` | Customer |
| Xác thực (Validate) Voucher | `POST` | `/api/v1/vouchers/validate/` | Customer |

## 6. Người giao hàng (Shipper)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Đơn chờ giao (Available) | `GET` | `/api/v1/shipper/orders/available/` | Shipper |
| Nhận đơn giao (Accept) | `POST` | `/api/v1/shipper/orders/{id}/accept/` | Shipper |
| Cập nhật trạng thái Giao | `POST` | `/api/v1/shipper/orders/{id}/status/` | Shipper |
| Lịch sử giao hàng | `GET` | `/api/v1/shipper/orders/history/` | Shipper |

## 7. Gọi nhân viên (Staff Calls)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Tạo yêu cầu hỗ trợ | `POST` | `/api/v1/staff-calls/` | Customer |
| Nhận yêu cầu (Assign) | `POST` | `/api/v1/staff-calls/{id}/assign/` | Staff |
| Hoàn tất (Complete) | `POST` | `/api/v1/staff-calls/{id}/complete/` | Staff |
| Danh sách đang pending | `GET` | `/api/v1/staff-calls/pending/` | Staff |

## 8. Bàn (Tables)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Danh sách Bàn | `GET` | `/api/v1/tables/` | Mọi Role |
| Bàn trống (Available) | `GET` | `/api/v1/tables/available/` | Mọi Role |
| Cập nhật trạng thái Bàn | `POST` | `/api/v1/tables/{id}/update-status/` | Staff |

## 9. Báo cáo (Reports)
| Chức năng | Method | Endpoint | Quyền (Role) |
| --- | --- | --- | --- |
| Biểu đồ Doanh thu | `GET` | `/api/v1/reports/revenue-chart/` | Admin |
| Top Món bán chạy | `GET` | `/api/v1/reports/top-dishes/` | Admin |
| Tóm tắt Doanh thu (Summary) | `GET` | `/api/v1/reports/summary/` | Admin |
| Thống kê trạng thái Đơn | `GET` | `/api/v1/reports/order-status/` | Admin |

---
**Ghi chú:** Các API cần quyền đều yêu cầu Header `Authorization: Bearer <token>`. Đọc file Collection Postman để xem chi tiết JSON Request Body cụ thể cho từng Endpoint. <!-- Clean CI -->
