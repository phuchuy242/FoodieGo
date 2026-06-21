# FoodieGo - Hệ Thống Đặt Món và Giao Đồ Ăn Trực Tuyến

Đây là một ứng dụng full-stack cho phép khách hàng đặt các món ăn trực tuyến và theo dõi quá trình giao hàng. Dự án sử dụng mô hình **Monorepo** với cấu trúc Backend (Django REST Framework) và Frontend (React + Vite).

## Kiến Trúc Dự Án

```
FoodieGo/
├── backend/              # Django REST Framework API
│   ├── config/           # Cấu hình Django chính
│   ├── apps/             # Các ứng dụng con (users, foods, cart, orders, vouchers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/             # React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Yêu Cầu Hệ Thống

- **Backend**: Python 3.10+, Django 4.2+, PostgreSQL
- **Frontend**: Node.js 16+, npm 8+

## Hướng Dẫn Khởi Động Nhanh

### Backend Setup

```bash
# 1. Tạo và kích hoạt Virtual Environment
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 2. Cài đặt Dependencies
pip install -r requirements.txt

# 3. Cấu hình Environment
# Copy .env.example thành .env và chỉnh sửa các biến môi trường
cp .env.example .env

# 4. Chạy Migration
python manage.py migrate

# 5. Tạo Superuser (Optional)
python manage.py createsuperuser

# 6. Chạy Development Server
python manage.py runserver
# API sẽ chạy tại: http://localhost:8000
```

### Frontend Setup

```bash
# 1. Cài đặt Dependencies
cd frontend
npm install

# 2. Chạy Development Server
npm run dev
# Frontend sẽ chạy tại: http://localhost:5173
```

## Tính Năng Chính

- ✅ **Quản lý Tài Khoản**: Đăng ký, đăng nhập, quản lý hồ sơ
- ✅ **Xác Thực**: JWT (JSON Web Token) SimpleJWT
- ✅ **Danh Sách Món Ăn**: Xem thêm chi tiết các món ăn
- ✅ **Giỏ Hàng**: Thêm/xóa sản phẩm
- ✅ **Đơn Hàng**: Tạo, xem, theo dõi đơn hàng
- ✅ **Voucher**: Áp dụng mã giảm giá

## API Documentation

Swagger API Documentation có sẵn tại: `http://localhost:8000/api/schema/swagger-ui/`

## Công Nghệ Sử Dụng

### Backend
- **Django**: Framework web
- **Django REST Framework**: API REST
- **SimpleJWT**: Xác thực JWT
- **PostgreSQL**: Cơ sở dữ liệu
- **django-cors-headers**: Hỗ trợ CORS
- **drf-spectacular**: Swagger/OpenAPI

### Frontend
- **React**: UI Framework
- **Vite**: Build tool
- **React Router**: Navigation
- **Axios**: HTTP Client
- **Material-UI**: Component Library

## Hướng Dẫn Phát Triển

### Tạo Model Mới

1. Tạo file `models.py` trong app mong muốn
2. Tạo Serializer tương ứng trong `serializers.py`
3. Tạo ViewSet trong `views.py`
4. Đăng ký route trong `urls.py`
5. Chạy migration: `python manage.py makemigrations` → `python manage.py migrate`

### Tạo Component React Mới

1. Tạo file `.jsx` trong `src/components/` hoặc `src/pages/`
2. Import và sử dụng trong App hoặc Route tương ứng

## Liên Lạc & Hỗ Trợ

Nếu bạn gặp vấn đề, vui lòng tạo issue hoặc liên hệ qua email.

---

**Phiên Bản**: 1.0.0 | **Ngày Cập Nhật**: June 2026
