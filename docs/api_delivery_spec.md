# 📖 Đặc Tả Chi Tiết 55+ API Chuẩn JSON (Hệ Sinh Thái Online Food Delivery)

Tài liệu này đặc tả chi tiết từng API cho toàn bộ 3 phân hệ: **Khách Hàng (Customer)**, **Quản Lý Quán (Admin POS)** và **Tài Xế (Shipper)**. Mỗi endpoint đều kèm theo cấu trúc dữ liệu gửi lên (`Request JSON`) và cấu trúc trả về chuẩn xác (`Response JSON`).

---

## 🛍️ PHẦN I: PHÂN HỆ KHÁCH HÀNG (CUSTOMER APP)

### 1. Nhóm Xác Thực & Tài Khoản (Authentication & Profile)

#### 1.1. Đăng ký tài khoản (`POST /api/v1/users/register/`)
* **Request JSON:**
```json
{
  "username": "nguyenvana",
  "email": "vana@gmail.com",
  "phone_number": "0912345678",
  "full_name": "Nguyễn Văn A",
  "password": "mypassword123",
  "password_confirm": "mypassword123"
}
```
* **Response JSON (`201 Created`):**
```json
{
  "status": "success",
  "msg": "Đăng ký tài khoản thành công!",
  "data": {
    "user": {
      "id": 101,
      "username": "nguyenvana",
      "email": "vana@gmail.com",
      "phone_number": "0912345678",
      "full_name": "Nguyễn Văn A",
      "role": "customer",
      "points": 0,
      "membership_tier": "Standard"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs...",
      "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### 1.2. Đăng nhập (`POST /api/v1/users/login/`)
* **Request JSON:**
```json
{
  "username": "0912345678",
  "password": "mypassword123"
}
```
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "msg": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 101,
      "username": "nguyenvana",
      "email": "vana@gmail.com",
      "phone_number": "0912345678",
      "full_name": "Nguyễn Văn A",
      "role": "customer",
      "points": 150,
      "membership_tier": "Gold"
    },
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 1.3. Đăng xuất (`POST /api/v1/users/logout/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:** `{ "refresh": "eyJhbGciOiJIUzI1NiIs..." }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đăng xuất thành công" }`

#### 1.4. Refresh Token (`POST /api/v1/users/refresh/`)
* **Request JSON:** `{ "refresh": "eyJhbGciOiJIUzI1NiIs..." }`
* **Response JSON (`200 OK`):** `{ "status": "success", "access": "eyJhbGciOiJIUzI1NiIs..." }`

#### 1.5. Lấy thông tin Profile (`GET /api/v1/users/profile/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": 101,
    "username": "nguyenvana",
    "email": "vana@gmail.com",
    "phone_number": "0912345678",
    "full_name": "Nguyễn Văn A",
    "avatar": "https://cdn.foodiego.vn/avatars/user101.jpg",
    "points": 150,
    "membership_tier": "Gold",
    "default_address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng"
  }
}
```

#### 1.6. Cập nhật Profile (`PUT /api/v1/users/profile/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:**
```json
{
  "full_name": "Nguyễn Văn A+",
  "email": "vana_new@gmail.com",
  "phone_number": "0912345678",
  "avatar": "https://cdn.foodiego.vn/avatars/new.jpg"
}
```
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Cập nhật thành công", "data": { "full_name": "Nguyễn Văn A+", "email": "vana_new@gmail.com" } }`

#### 1.7. Đổi mật khẩu (`PUT /api/v1/users/password/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:** `{ "old_password": "oldpassword123", "new_password": "newpassword456" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đổi mật khẩu thành công" }`

#### 1.8. Quên mật khẩu - Gửi OTP (`POST /api/v1/users/forgot-password/`)
* **Request JSON:** `{ "phone_number": "0912345678" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Mã OTP đã được gửi đến số điện thoại 0912345678", "otp_id": "OTP8899" }`

#### 1.9. Xác thực OTP (`POST /api/v1/users/verify-otp/`)
* **Request JSON:** `{ "phone_number": "0912345678", "otp_code": "123456" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Xác thực OTP thành công", "reset_token": "TKN_RESET_99" }`

---

### 2. Nhóm Sổ Địa Chỉ Giao Hàng (Address Book)

#### 2.1. Lấy danh sách địa chỉ (`GET /api/v1/users/addresses/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "phone": "0912345678",
      "address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng",
      "note": "Để trước cổng nhà",
      "is_default": true
    }
  ]
}
```

#### 2.2. Thêm địa chỉ mới (`POST /api/v1/users/addresses/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:**
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "456 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng",
  "note": "Gọi trước khi đến",
  "is_default": false
}
```
* **Response JSON (`201 Created`):** `{ "status": "success", "data": { "id": 2, "name": "Nguyễn Văn A", "address": "456 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng", "is_default": false } }`

#### 2.3. Sửa địa chỉ (`PUT /api/v1/users/addresses/{id}/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:** `{ "address": "789 Nguyễn Lương Bằng, Đà Nẵng", "note": "Nhà mặt tiền" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã cập nhật địa chỉ" }`

#### 2.4. Xóa địa chỉ (`DELETE /api/v1/users/addresses/{id}/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã xóa địa chỉ" }`

#### 2.5. Đặt làm địa chỉ mặc định (`PATCH /api/v1/users/addresses/{id}/default/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã đặt làm địa chỉ mặc định" }`

---

### 3. Nhóm Thực Đơn & Món Ăn (Menu & Products)

#### 3.1. Lấy danh sách danh mục (`GET /api/v1/menu/categories/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Mì Trộn KEY KÉP", "image": "https://cdn.foodiego.vn/cat1.jpg" },
    { "id": 2, "name": "Mì Nước Đặc Biệt", "image": "https://cdn.foodiego.vn/cat2.jpg" },
    { "id": 3, "name": "Đồ Uống & Trà", "image": "https://cdn.foodiego.vn/cat3.jpg" }
  ]
}
```

#### 3.2. Lấy danh sách toàn bộ món ăn (`GET /api/v1/menu/products/?page=1&limit=20`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "products": [
      {
        "id": 10,
        "name": "Mì Trộn KEY KÉP Đặc Biệt",
        "price": 100000,
        "image": "https://cdn.foodiego.vn/p10.jpg",
        "category_id": 1,
        "is_available": true,
        "rating": 4.8,
        "sold_count": 1250
      }
    ]
  }
}
```

#### 3.3. Xem chi tiết món ăn (`GET /api/v1/menu/products/{id}/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": 10,
    "name": "Mì Trộn KEY KÉP Đặc Biệt",
    "description": "Mì trộn xốt bí truyền dai giòn cùng bò súng, tóp mỡ và trứng lòng đào siêu ngon.",
    "price": 100000,
    "image": "https://cdn.foodiego.vn/p10.jpg",
    "category_id": 1,
    "is_available": true,
    "rating": 4.8,
    "sold_count": 1250
  }
}
```

#### 3.4. Lọc món theo danh mục (`GET /api/v1/menu/products/by-category/?category_id=1`)
* **Response JSON (`200 OK`):** `{ "status": "success", "data": [ { "id": 10, "name": "Mì Trộn KEY KÉP Đặc Biệt", "price": 100000 } ] }`

#### 3.5. Tìm kiếm món ăn (`GET /api/v1/menu/products/search/?q=mì`)
* **Response JSON (`200 OK`):** `{ "status": "success", "data": [ { "id": 10, "name": "Mì Trộn KEY KÉP Đặc Biệt", "price": 100000 } ] }`

#### 3.6. Lấy biến thể giá món (`GET /api/v1/menu/products/{id}/variants/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": 5, "name": "Size Vừa", "price_diff": 0 },
    { "id": 6, "name": "Size Lớn (Nhiều bò)", "price_diff": 20000 }
  ]
}
```

#### 3.7. Lấy Topping món ăn (`GET /api/v1/menu/products/{id}/toppings/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Thêm Trứng Lòng Đào", "price": 10000 },
    { "id": 2, "name": "Thêm Tóp Mỡ Giòn", "price": 15000 }
  ]
}
```

#### 3.8. Lấy đánh giá món ăn (`GET /api/v1/menu/products/{id}/reviews/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": 1, "user_name": "Trần B", "rating": 5, "comment": "Mì cực kỳ ngon, xốt đậm đà!", "created_at": "2026-07-01T10:00:00Z" }
  ]
}
```

---

### 4. Nhóm Đặt Hàng & Giao Nhận (Orders & Checkout)

#### 4.1. Tạo đơn đặt hàng Online (`POST /api/v1/orders/`)
* **Request JSON:**
```json
{
  "order_type": "delivery",
  "table": null,
  "customer_name": "Nguyễn Văn A",
  "customer_phone": "0912345678",
  "delivery_address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng",
  "delivery_note": "Để trước cổng nhà",
  "payment_method": "cod",
  "voucher_code": "FREESHIP15",
  "shipping_fee": 0,
  "discount_amount": 15000,
  "total_amount": 185000,
  "items": [
    { "variant": 5, "quantity": 2, "notes": "Ít cay, nhiều hành" }
  ]
}
```
* **Response JSON (`201 Created`):**
```json
{
  "status": "success",
  "msg": "Đặt hàng Online thành công!",
  "data": {
    "id": "ORD1720108800",
    "pay_code": "HW8F3K2P",
    "order_type": "delivery",
    "status": "pending",
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0912345678",
    "delivery_address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng",
    "total_amount": 185000,
    "estimated_delivery_time": "20 - 30 phút",
    "created_at": "2026-07-05T00:15:00Z"
  }
}
```

#### 4.2. Lịch sử đơn hàng của tôi (`GET /api/v1/orders/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": "ORD1720108800", "pay_code": "HW8F3K2P", "status": "delivering", "total_amount": 185000, "created_at": "2026-07-05T00:15:00Z" }
  ]
}
```

#### 4.3. Xem chi tiết đơn hàng (`GET /api/v1/orders/{id}/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": "ORD1720108800",
    "status": "delivering",
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0912345678",
    "delivery_address": "120 Hoàng Minh Thảo, Đà Nẵng",
    "total_amount": 185000,
    "items": [ { "name": "Mì Trộn KEY KÉP Đặc Biệt", "quantity": 2, "subtotal": 200000 } ]
  }
}
```

#### 4.4. Tra cứu đơn bằng Mã Thanh Toán (`GET /api/v1/orders/by-paycode/?pay_code=HW8F3K2P`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": "ORD1720108800",
    "pay_code": "HW8F3K2P",
    "status": "delivering",
    "status_step": 4,
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0912345678",
    "delivery_address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng",
    "total_amount": 185000,
    "shipper": { "name": "Nguyễn Văn Tài Xế", "phone": "0988777666", "vehicle": "Honda Wave - 43F1-123.45" },
    "items": [ { "name": "Mì Trộn KEY KÉP Đặc Biệt", "quantity": 2, "price": 100000 } ]
  }
}
```

#### 4.5. Khách yêu cầu hủy đơn (`POST /api/v1/orders/{id}/cancel/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:** `{ "reason": "Thay đổi địa chỉ nhận hàng" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã hủy đơn hàng", "data": { "status": "cancelled" } }`

#### 4.6. Đặt lại đơn hàng cũ (`POST /api/v1/orders/{id}/reorder/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã thêm 2 món vào giỏ hàng", "data": { "cart_items_count": 2 } }`

---

### 5. Nhóm Theo Dõi & Tài Xế (Realtime Tracking)

#### 5.1. Lấy tiến trình & GPS Tài xế (`GET /api/v1/orders/{id}/tracking/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "order_id": "ORD1720108800",
    "status_step": 4,
    "step_name": "Đang giao hàng",
    "shipper_lat": 16.0550,
    "shipper_lng": 108.1510,
    "estimated_arrival_min": 10
  }
}
```

#### 5.2. Lấy thông tin Tài xế (`GET /api/v1/orders/{id}/shipper/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "shipper_name": "Nguyễn Văn Tài Xế",
    "phone": "0988777666",
    "vehicle": "Honda Wave - 43F1-123.45",
    "avatar": "https://cdn.foodiego.vn/shippers/drv1.png",
    "rating": 4.9
  }
}
```

#### 5.3. Cuộc gọi ẩn số tới Tài xế (`POST /api/v1/orders/{id}/call-shipper/`)
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đang kết nối cuộc gọi...", "mask_phone": "1900888999_ext_102" }`

---

### 6. Nhóm Khuyến Mãi & Voucher (Promotions)

#### 6.1. Danh sách khuyến mãi đang áp dụng (`GET /api/v1/vouchers/valid/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "code": "FREESHIP15", "title": "Miễn phí ship 15k", "minSpend": 150000, "type": "freeship", "value": 15000 },
    { "code": "GIAM20K", "title": "Giảm ngay 20.000đ", "minSpend": 200000, "type": "fixed", "value": 20000 }
  ]
}
```

#### 6.2. Kiểm tra & tính giảm giá Voucher (`POST /api/v1/vouchers/apply/`)
* **Request JSON:** `{ "voucher_code": "FREESHIP15", "subtotal": 180000, "shipping_fee": 15000 }`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": { "valid": true, "discount_amount": 15000, "final_total": 180000 } }`

#### 6.3. Ví voucher của khách hàng (`GET /api/v1/users/vouchers/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": [ { "code": "FREESHIP15", "status": "available", "expires_in": "7 ngày" } ] }`

---

### 7. Nhóm Thanh Toán (Payment Gateway)

#### 7.1. Tạo mã VietQR/MoMo thanh toán (`POST /api/v1/payments/create-qr/`)
* **Request JSON:** `{ "order_id": "ORD1720108800", "amount": 185000, "gateway": "vietqr" }`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "qr_url": "https://img.vietqr.io/image/MB-0912345678-compact2.png?amount=185000&addInfo=ORD1720108800",
    "bank_name": "MBBank",
    "account_number": "0912345678",
    "account_name": "QUAN MI KEY KEP",
    "transfer_content": "ORD1720108800"
  }
}
```

#### 7.2. Kiểm tra trạng thái thanh toán (`GET /api/v1/payments/status/?order_id=ORD1720108800`)
* **Response JSON (`200 OK`):** `{ "status": "success", "data": { "order_id": "ORD1720108800", "is_paid": true, "paid_at": "2026-07-05T00:16:10Z" } }`

#### 7.3. Webhook Ngân hàng báo có tiền (`POST /api/v1/payments/callback/`)
* **Request JSON (Từ Ngân hàng/MoMo gửi đến):** `{ "transaction_id": "TX998877", "order_id": "ORD1720108800", "amount": 185000, "status": "SUCCESS" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Received" }`

---

### 8. Nhóm Đánh Giá & Hội Viên (Loyalty & Reviews)

#### 8.1. Chấm điểm món & tài xế (`POST /api/v1/orders/{id}/review/`)
* **Request JSON:** `{ "order_id": "ORD1720108800", "rating": 5, "comment": "Mì ngon, giao nhanh!", "customer_phone": "0912345678" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Cảm ơn bạn đã đánh giá! +100 điểm thưởng.", "data": { "reward_points": 100, "total_points": 250 } }`

#### 8.2. Lịch sử tích điểm (`GET /api/v1/users/loyalty-history/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": [ { "reason": "Đánh giá đơn ORD1720108800", "points": "+100", "date": "2026-07-05" } ] }`

#### 8.3. Đổi điểm thưởng (`POST /api/v1/loyalty/redeem/`)
* **Headers:** `Authorization: Bearer {accessToken}`
* **Request JSON:** `{ "reward_id": "VOUCHER_20K" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đổi quà thành công", "data": { "voucher_code": "LOYALTY20K", "remaining_points": 50 } }`

---

### 9. Nhóm Quán & Phí Vận Chuyển (Store & Shipping)

#### 9.1. Thông tin quán (`GET /api/v1/store/info/`)
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "store_name": "Mì Trộn KEY KÉP - Đà Nẵng",
    "address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng",
    "is_open": true,
    "open_time": "08:00 - 22:30",
    "hotline": "0912345678"
  }
}
```

#### 9.2. Tính phí giao hàng theo tọa độ (`POST /api/v1/shipping/calculate/`)
* **Request JSON:** `{ "delivery_address": "120 Hoàng Minh Thảo, Đà Nẵng", "order_subtotal": 180000 }`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": { "distance_km": 2.5, "base_shipping_fee": 15000, "freeship_discount": 15000, "final_shipping_fee": 0 } }`

---

## 🏪 PHẦN II: PHÂN HỆ QUẢN LÝ QUÁN / ADMIN POS

### 10. Quản Lý Thực Đơn (Menu Management)

#### 10.1. Thêm món ăn mới (`POST /api/v1/admin/menu/products/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "name": "Mì Trộn Đặc Biệt", "price": 100000, "category_id": 1, "image": "https://cdn/p1.jpg" }`
* **Response JSON (`201 Created`):** `{ "status": "success", "msg": "Đã thêm món", "data": { "id": 11, "name": "Mì Trộn Đặc Biệt", "price": 100000 } }`

#### 10.2. Sửa thông tin món ăn (`PUT /api/v1/admin/menu/products/{id}/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "price": 105000, "is_available": true }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã cập nhật món ăn" }`

#### 10.3. Xóa món ăn (`DELETE /api/v1/admin/menu/products/{id}/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã xóa món ăn" }`

#### 10.4. Bật/Tắt hết món real-time (`PATCH /api/v1/admin/menu/products/{id}/status/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "is_available": false }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Món đã chuyển sang trạng thái TẠM HẾT", "data": { "id": 10, "is_available": false } }`

#### 10.5. Quản lý danh mục (`POST /api/v1/admin/menu/categories/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "name": "Mì Trộn Siêu Cay" }`
* **Response JSON (`201 Created`):** `{ "status": "success", "data": { "id": 4, "name": "Mì Trộn Siêu Cay" } }`

#### 10.6. Quản lý Topping (`POST /api/v1/admin/menu/toppings/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "name": "Thêm Bò Súng", "price": 25000 }`
* **Response JSON (`201 Created`):** `{ "status": "success", "data": { "id": 3, "name": "Thêm Bò Súng", "price": 25000 } }`

---

### 11. Quản Lý Đơn Hàng (Order Processing)

#### 11.1. Danh sách đơn hàng POS real-time (`GET /api/v1/admin/orders/?status=pending`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": "ORD1720108800", "customer_name": "Nguyễn Văn A", "phone": "0912345678", "total_amount": 185000, "status": "pending", "created_at": "00:15" }
  ]
}
```

#### 11.2. Duyệt đơn hàng (`PATCH /api/v1/admin/orders/{id}/confirm/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "estimated_prep_time_min": 15 }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã duyệt đơn! Chuyển sang bếp làm món.", "data": { "id": "ORD1720108800", "status": "cooking" } }`

#### 11.3. Báo món làm xong (`PATCH /api/v1/admin/orders/{id}/ready/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Món đã xong! Đang gọi Tài xế tới lấy.", "data": { "id": "ORD1720108800", "status": "ready" } }`

#### 11.4. Gán Tài xế giao đơn (`POST /api/v1/admin/orders/{id}/assign-shipper/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "shipper_id": 501 }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã gán đơn cho tài xế Nguyễn Văn Tài Xế", "data": { "status": "delivering" } }`

#### 11.5. Hủy đơn từ Quán (`PATCH /api/v1/admin/orders/{id}/cancel/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "cancel_reason": "Quán đột xuất hết bò súng" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã hủy đơn hàng và hoàn tiền (nếu có)" }`

---

### 12. Thống Kê & Báo Cáo (Analytics & Reports)

#### 12.1. Báo cáo doanh thu (`GET /api/v1/admin/reports/revenue/?period=month`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": { "total_revenue": 45000000, "total_orders": 350, "growth_percentage": "+15%" } }`

#### 12.2. Top món bán chạy (`GET /api/v1/admin/reports/top-products/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": [ { "name": "Mì Trộn KEY KÉP Đặc Biệt", "sold": 1250, "revenue": 125000000 } ] }`

#### 12.3. Thống kê vận hành (`GET /api/v1/admin/reports/order-stats/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": { "success_rate": "98.5%", "cancel_rate": "1.5%", "avg_prep_time": "12 phút" } }`

---

### 13. Quản Lý Khuyến Mãi (Vouchers Admin)

#### 13.1. Tạo Voucher mới (`POST /api/v1/admin/vouchers/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "code": "FREESHIP15", "title": "Freeship 15k", "type": "freeship", "value": 15000, "min_spend": 150000 }`
* **Response JSON (`201 Created`):** `{ "status": "success", "msg": "Đã tạo mã giảm giá FREESHIP15" }`

#### 13.2. Sửa Voucher (`PUT /api/v1/admin/vouchers/{id}/`)
* **Headers:** `Authorization: Bearer {adminToken}`
* **Request JSON:** `{ "is_active": false }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã tạm dừng khuyến mãi" }`

---

## 🛵 PHẦN III: PHÂN HỆ TÀI XẾ (SHIPPER DRIVER APP)

### 14. Nhận & Giao Đơn (Driver Operations)

#### 14.1. Danh sách đơn chờ giao (`GET /api/v1/shipper/orders/available/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    { "id": "ORD1720108800", "store_name": "Mì Trộn KEY KÉP", "store_address": "120 Hoàng Minh Thảo", "customer_address": "456 Tôn Đức Thắng", "shipping_fee_earning": 15000, "distance_km": 2.5 }
  ]
}
```

#### 14.2. Tài xế nhận chuyến (`POST /api/v1/shipper/orders/{id}/accept/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "msg": "Nhận chuyến thành công! Vui lòng đến quán lấy món.",
  "data": {
    "order_id": "ORD1720108800",
    "status": "delivering",
    "customer": { "name": "Nguyễn Văn A", "phone": "0912345678", "address": "120 Hoàng Minh Thảo" },
    "cod_to_collect": 185000
  }
}
```

#### 14.3. Xác nhận đã lấy món (`PATCH /api/v1/shipper/orders/{id}/picked/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã xác nhận lấy món từ quán! Đang giao tới nhà khách.", "data": { "status": "delivering", "step": 4 } }`

#### 14.4. Xác nhận giao thành công (`PATCH /api/v1/shipper/orders/{id}/delivered/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Request JSON:** `{ "proof_image": "https://cdn.foodiego.vn/proof/ord1720108800.jpg", "note": "Đã giao cho khách" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Giao hàng thành công! +15.000đ vào ví tài xế.", "data": { "status": "delivered", "earning": 15000 } }`

#### 14.5. Báo cáo giao thất bại (`PATCH /api/v1/shipper/orders/{id}/fail/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Request JSON:** `{ "reason": "Khách không nghe máy sau 3 lần gọi" }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Đã ghi nhận giao thất bại. Vui lòng hoàn món về quán." }`

---

### 15. GPS & Thu Nhập (GPS & Wallet)

#### 15.1. Cập nhật GPS real-time (`POST /api/v1/shipper/location/update/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Request JSON:** `{ "latitude": 16.0548, "longitude": 108.1505, "speed_kmh": 30.5 }`
* **Response JSON (`200 OK`):** `{ "status": "success", "msg": "Location updated" }`

#### 15.2. Xem số dư ví Tài xế (`GET /api/v1/shipper/wallet/balance/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Response JSON (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "wallet_balance": 350000,
    "cash_in_hand_cod": 185000,
    "today_earnings": 120000,
    "completed_trips_today": 8
  }
}
```

#### 15.3. Lịch sử chuyến đi (`GET /api/v1/shipper/history/`)
* **Headers:** `Authorization: Bearer {shipperToken}`
* **Response JSON (`200 OK`):** `{ "status": "success", "data": [ { "order_id": "ORD1720108800", "earning": 15000, "completed_at": "00:20" } ] }`
