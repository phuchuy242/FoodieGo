# HƯỚNG DẪN CHI TIẾT TỪNG TASK — FOODIEGO

Tài liệu này cung cấp mô tả chi tiết cho toàn bộ **33 tasks** thuộc dự án FoodieGo, được tổ chức theo 4 Sprint từ Level 1 (Monolith MVP) đến Level 2 (Roles, Cache, Celery) và Level 3 (Microservices & DevOps).

Mỗi task gồm 3 phần chính:
1. **Cần làm gì (What):** Nhiệm vụ cụ thể của từng vai trò (Backend, Frontend, DevOps, QA).
2. **Có cái gì (What it has):** Database schema, API Specification (đầu vào, đầu ra, mã trạng thái), và giao diện UI cần có.
3. **Như thế nào (How):** Các bước logic triển khai, cấu trúc thư mục gợi ý và các mẹo lập trình.

---

## 📌 SPRINT 1 — NỀN TẢNG & MENU

### FOOD-001 — Project Setup & Git Flow
* **Nhánh Git:** `feature/FOOD-001-project-setup`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 3

#### 1. Cần làm gì
* **DevOps:** Khởi tạo repository Git, thiết lập nhánh chính `main` và `develop`, tạo cấu trúc thư mục monorepo gồm `backend/` và `frontend/`. Định nghĩa PR Template và các file cấu hình cơ bản (`.gitignore`, `.env.example`).
* **Backend:** Khởi tạo project Django + Django REST Framework (DRF), cấu hình kết nối database PostgreSQL.
* **Frontend:** Khởi tạo ứng dụng React bằng Vite, cài đặt thư viện Material UI (MUI), React Router và Axios.

#### 2. Có cái gì
* **Thư mục dự án:**
  ```text
  FoodieGo/
  ├── backend/               # Dự án Django
  ├── frontend/              # Dự án React
  ├── .gitignore
  ├── .env.example
  └── README.md
  ```
* **Biến môi trường (`.env.example`):**
  ```env
  DB_NAME=foodiego
  DB_USER=postgres
  DB_PASSWORD=secret
  DB_HOST=localhost
  DB_PORT=5432
  SECRET_KEY=django-insecure-key
  ```

#### 3. Như thế nào
* **Cài đặt Backend:**
  1. Vào thư mục `backend/`, tạo môi trường ảo: `python -m venv venv`.
  2. Tạo file `requirements.txt` và cài đặt: `django`, `djangorestframework`, `psycopg2-binary`, `django-cors-headers`.
  3. Tạo dự án: `django-admin startproject config .`.
  4. Cấu hình CORS và Database trong `config/settings.py`.
* **Cài đặt Frontend:**
  1. Vào thư mục `frontend/`, chạy `npm create vite@latest . -- --template react`.
  2. Cài đặt các gói: `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material react-router-dom axios`.
* **Git Flow:** Tạo pull request đầu tiên từ `feature/FOOD-001-project-setup` vào `develop`.

---

### FOOD-002 — GitHub Actions CI
* **Nhánh Git:** `feature/FOOD-002-github-ci`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 2 | **Phụ thuộc:** FOOD-001

#### 1. Cần làm gì
* **DevOps:** Thiết lập GitHub Actions workflow tự động kích hoạt khi có push hoặc pull request (PR) gửi vào nhánh `develop` hoặc `main`.
* **Backend / Frontend:** Viết các lệnh chạy linting (kiểm tra chuẩn code style) và bộ test skeleton để CI kiểm thử.

#### 2. Có cái gì
* **File workflow:** `.github/workflows/ci.yml`
* **Quy trình chạy:**
  * **Job BE:** Setup Python -> Install dependencies -> Lint (flake8/black) -> Run migrations -> Run pytest.
  * **Job FE:** Setup Node.js -> Install dependencies -> Lint (ESLint) -> Build ứng dụng (`npm run build`).

#### 3. Như thế nào
* Tạo file `.github/workflows/ci.yml` sử dụng service PostgreSQL ảo chạy trên GitHub runner để phục vụ test backend:
  ```yaml
  name: CI Pipeline
  on: [push, pull_request]
  jobs:
    backend:
      runs-on: ubuntu-latest
      services:
        postgres:
          image: postgres:15
          env:
            POSTGRES_DB: foodiego_test
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: password
          ports:
            - 5432:5432
      steps:
        - uses: actions/checkout@v3
        - name: Set up Python
          uses: actions/setup-python@v4
          with:
            python-version: '3.10'
        - name: Run tests
          run: |
            cd backend
            pip install -r requirements.txt
            python manage.py test
  ```

---

### FOOD-003 — JWT Authentication
* **Nhánh Git:** `feature/FOOD-003-jwt-auth`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 5 | **Phụ thuộc:** FOOD-001

#### 1. Cần làm gì
* **Backend:** Thiết kế model `CustomUser` kế thừa từ `AbstractUser` sử dụng `email` làm khóa định danh thay cho `username`. Cài đặt thư viện `djangorestframework-simplejwt` để sinh và xác thực access/refresh token.
* **QA:** Viết unit tests kiểm thử luồng đăng nhập đúng/sai thông tin, gia hạn token.

#### 2. Có cái gì
* **Bảng database `users`:**
  * `id` (UUID, Primary Key)
  * `email` (Varchar, Unique)
  * `password` (Varchar - hash)
  * `full_name` (Varchar)
  * `role` (Enum: customer, restaurant_manager, delivery_staff, admin)
* **API Endpoints:**
  * `POST /api/v1/auth/login/`
    * Request: `{ "email": "admin@foodiego.com", "password": "password123" }`
    * Response (200 OK): `{ "access": "<token>", "refresh": "<token>", "user": { "id", "email", "role", "full_name" } }`
    * Response (401): `{ "detail": "No active account found with the given credentials" }`
  * `POST /api/v1/auth/refresh/`
    * Request: `{ "refresh": "<refresh_token>" }`
    * Response (200 OK): `{ "access": "<new_access_token>" }`

#### 3. Như thế nào
* **Triển khai Custom User:**
  1. Trong app `users`, định nghĩa `class CustomUser(AbstractUser)` loại bỏ field `username` và thiết lập `USERNAME_FIELD = 'email'`.
  2. Khai báo `AUTH_USER_MODEL = 'users.CustomUser'` trong `settings.py` trước khi chạy lệnh migrate đầu tiên.
* **SimpleJWT Setup:** Cấu hình thời gian sống cho access token (ví dụ: 60 phút) và refresh token (ví dụ: 7 ngày) trong phần `SIMPLE_JWT` của `settings.py`.

---

### FOOD-004 — User Registration & Profile
* **Nhánh Git:** `feature/FOOD-004-user-register`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 3 | **Phụ thuộc:** FOOD-003

#### 1. Cần làm gì
* **Backend:** Tạo API endpoint cho phép người dùng đăng ký tài khoản (mặc định gán vai trò `customer`).
* **Frontend:** Thiết kế trang Đăng ký (Register) và Đăng nhập (Login) sử dụng MUI. Thiết lập `AuthContext` để lưu trữ token nhận được trong LocalStorage và cài đặt Axios Interceptors tự động đính kèm token vào header cho các yêu cầu kế tiếp.

#### 2. Có cái gì
* **API Register:**
  * `POST /api/v1/auth/register/`
    * Request: `{ "email", "password", "full_name", "phone" }`
    * Response (201 Created): `{ "id", "email", "full_name", "role": "customer" }`
    * Response (400 Bad Request): Lỗi validate (mật khẩu quá ngắn, thiếu trường, email sai định dạng).
* **Giao diện:**
  * Form Đăng nhập có kiểm tra validation đầu vào (yêu cầu email hợp lệ, mật khẩu).
  * Form Đăng ký có xác thực mật khẩu trùng khớp.

#### 3. Như thế nào
* **Frontend Axios Client:**
  ```javascript
  const api = axios.create({ baseURL: '/api/v1' });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```
* **AuthContext:** Quản lý state `user` toàn cục. Khi đăng nhập thành công, lưu token và cập nhật trạng thái `isAuthenticated = true`, sau đó điều hướng người dùng bằng `useNavigate()` sang trang `/menu`.

---

### FOOD-005 — Category CRUD
* **Nhánh Git:** `feature/FOOD-005-category-crud`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 3 | **Phụ thuộc:** FOOD-003

#### 1. Cần làm gì
* **Backend:** Tạo thực thể Category. Cho phép mọi đối tượng đọc danh mục (Public GET), nhưng chỉ người có vai trò `admin` hoặc `restaurant_manager` mới được thêm, sửa, xóa (POST/PUT/DELETE).
* **Frontend:** Thiết kế trang quản lý danh mục dành cho Admin dạng bảng biểu, cho phép đóng mở Dialog để thêm hoặc chỉnh sửa.

#### 2. Có cái gì
* **Bảng database `categories`:**
  * `id` (UUID PK), `name` (Varchar Unique), `description` (Text), `is_active` (Boolean)
* **API Endpoints:**
  * `GET /api/v1/categories/` (Public) -> Trả về danh sách danh mục đang kích hoạt.
  * `POST /api/v1/categories/` (Yêu cầu JWT + Admin/Manager) -> Trả về danh mục vừa tạo.

#### 3. Như thế nào
* **Phân quyền Backend:** Tạo lớp Permission Custom trong Django:
  ```python
  class IsManagerOrAdmin(BasePermission):
      def has_permission(self, request, view):
          if request.method in SAFE_METHODS:
              return True
          return request.user.is_authenticated and request.user.role in ['admin', 'restaurant_manager']
  ```
  Sử dụng Permission này trong `CategoryViewSet`.
* **Frontend UI:** Sử dụng component `<Table>` của MUI để hiển thị danh sách, đi kèm nút chỉnh sửa hiển thị modal form có các ô input: Tên danh mục, Mô tả.

---

### FOOD-006 — Food CRUD
* **Nhánh Git:** `feature/FOOD-006-food-crud`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 3 | **Phụ thuộc:** FOOD-005

#### 1. Cần làm gì
* **Backend:** Thiết kế model Food liên kết khóa ngoại với Category. Cung cấp API CRUD. Khi tạo/sửa món ăn, kiểm tra đầu vào: giá tiền >= 0, số lượng trong kho >= 0.
* **Frontend:** Thiết kế giao diện Quản lý món ăn cho Admin, tích hợp dropdown lựa chọn Category cha.

#### 2. Có cái gì
* **Bảng database `foods`:**
  * `id`, `category_id` (FK), `name`, `description`, `price` (Decimal), `image_url`, `stock` (Int), `is_available` (Boolean)
* **API Endpoint:**
  * `POST /api/v1/foods/`
    * Request: `{ "name", "price", "category_id", "stock", "image_url" }`
    * Response (201 Created): Thông tin chi tiết món ăn kèm theo thông tin lồng của category.

#### 3. Như thế nào
* **Django Serializer:** Sử dụng `PrimaryKeyRelatedField` để nhận `category_id` khi ghi dữ liệu và override phương thức hiển thị hoặc sử dụng Serializer lồng (nested) để trả về thông tin danh mục chi tiết cho GET.
  ```python
  class FoodSerializer(serializers.ModelSerializer):
      category_id = serializers.PrimaryKeyRelatedField(
          queryset=Category.objects.all(), source='category'
      )
      category = CategorySerializer(read_only=True)
      class Meta:
          model = Food
          fields = ['id', 'name', 'price', 'stock', 'image_url', 'category_id', 'category', 'is_available']
  ```

---

### FOOD-007 — Food Search & Filter
* **Nhánh Git:** `feature/FOOD-007-food-search`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 2 | **Phụ thuộc:** FOOD-006

#### 1. Cần làm gì
* **Backend:** Tích hợp tính năng lọc theo danh mục, tìm kiếm theo tên và phân trang kết quả trả về của API danh sách món ăn.
* **Frontend:** Viết component SearchBar thực hiện debounce nhập liệu để tránh spam API request.

#### 2. Có cái gì
* **API Endpoints:**
  * `GET /api/v1/foods/?search=burger&category=<uuid>&page=1&page_size=10`
  * Response (200 OK):
    ```json
    {
      "count": 45,
      "next": "http://.../?page=2",
      "previous": null,
      "results": [ { "id", "name", "price", ... } ]
    }
    ```

#### 3. Như thế nào
* **Backend Django:** Cài đặt gói `django-filter`.
  Cấu hình `filter_backends` trong `FoodViewSet`:
  ```python
  from rest_framework.filters import SearchFilter
  from django_filters.rest_framework import DjangoFilterBackend

  class FoodViewSet(viewsets.ModelViewSet):
      queryset = Food.objects.filter(is_available=True)
      serializer_class = FoodSerializer
      filter_backends = [DjangoFilterBackend, SearchFilter]
      filterset_fields = ['category']
      search_fields = ['name', 'description']
  ```
* **Frontend Debounce:** Sử dụng hook `useEffect` có timeout (ví dụ: 300ms) để trì hoãn việc gọi API cho tới khi người dùng dừng gõ phím.

---

### FOOD-008 — Menu Page (Public)
* **Nhánh Git:** `feature/FOOD-008-menu-page`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 3 | **Phụ thuộc:** FOOD-007

#### 1. Cần làm gì
* **Frontend:** Tạo trang Menu công khai hiển thị cho cả khách vãng lai (Guest). Có thanh hiển thị tabs Category, vùng tìm kiếm, danh sách món ăn dạng lưới (Grid) hiển thị thẻ món ăn (`FoodCard`). Thiết kế trang chi tiết món ăn khi nhấp vào thẻ.

#### 2. Có cái gì
* **Component UI:**
  * `Menu.jsx`: Trang cha chứa trạng thái chọn category, từ khóa search hiện tại, và trang hiện tại của pagination.
  * `FoodCard.jsx`: Thẻ hiển thị ảnh món, tên, mô tả ngắn, giá tiền định dạng VNĐ và nút "Thêm vào giỏ" (chỉ hiển thị/hoạt động khi đã đăng nhập).
  * `FoodDetail.jsx`: Route `/foods/:id` hiển thị chi tiết mô tả đầy đủ của món ăn, số lượng khả dụng.

#### 3. Như thế nào
* **Trạng thái Tabs Category:** Fetch tất cả categories khi component mount. Render các nút bấm dạng `<Tabs>` của MUI. Khi click một tab, cập nhật giá trị `selectedCategory` và reload dữ liệu món ăn.
* **Responsive Layout:** Sử dụng Grid MUI với thuộc tính `xs={12} sm={6} md={4}` để hiển thị 1 cột trên mobile, 2 cột trên tablet và 3-4 cột trên màn hình desktop máy tính.

---

### FOOD-009 — Swagger API Docs
* **Nhánh Git:** `feature/FOOD-009-swagger-docs`
* **Mức độ ưu tiên:** Must Have (S1) | **Story Points:** 2 | **Phụ thuộc:** FOOD-003, FOOD-006

#### 1. Cần làm gì
* **Backend:** Thiết lập tài liệu đặc tả API tự động sử dụng thư viện `drf-spectacular`.

#### 2. Có cái gì
* **Endpoints tài liệu:**
  * `GET /api/docs/`: Giao diện Swagger UI tương tác thử nghiệm API trực tiếp.
  * `GET /api/redoc/`: Giao diện ReDoc thân thiện cho việc đọc hiểu.
* Cấu hình hỗ trợ JWT Authentication (nhập Token ở ô Authorize dạng: `Bearer <token>`).

#### 3. Như thế nào
* **Cài đặt & Cấu hình:**
  1. Cài đặt `pip install drf-spectacular`.
  2. Thêm vào `INSTALLED_APPS` và khai báo trong `REST_FRAMEWORK` settings:
     ```python
     REST_FRAMEWORK = {
         'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
     }
     ```
  3. Thêm cấu hình bảo mật JWT cho Swagger để nhà phát triển có thể ấn button "Authorize" và nhập token thử nghiệm.
  4. Cấu hình url trỏ tới các view `SpectacularAPIView`, `SpectacularSwaggerView` trong file `urls.py`.

---

## 🛒 SPRINT 2 — GIỎ HÀNG & ĐƠN HÀNG

### FOOD-010 — Cart API
* **Nhánh Git:** `feature/FOOD-010-cart-api`
* **Mức độ ưu tiên:** Must Have (S2) | **Story Points:** 5 | **Phụ thuộc:** FOOD-003, FOOD-006

#### 1. Cần làm gì
* **Backend:** Phát triển hệ thống giỏ hàng của từng khách hàng. Khi người dùng đăng ký tài khoản thành công, hệ thống tự động khởi tạo thực thể giỏ hàng rỗng. Viết API thêm món vào giỏ, cập nhật số lượng, và xóa món khỏi giỏ hàng.
* **QA:** Viết test case đảm bảo không thể thêm số lượng vượt quá số lượng tồn kho của món ăn.

#### 2. Có cái gì
* **Bảng database `carts` & `cart_items`:**
  * `carts`: `id` (UUID), `user_id` (FK User)
  * `cart_items`: `id`, `cart_id` (FK), `food_id` (FK), `quantity` (Int > 0)
* **API Endpoints:**
  * `GET /api/v1/cart/` -> Trả về danh sách chi tiết các món trong giỏ và tổng tiền tạm tính.
  * `POST /api/v1/cart/items/` -> Payload: `{ "food_id": "<uuid>", "quantity": 1 }`
  * `PATCH /api/v1/cart/items/{id}/` -> Payload: `{ "quantity": 3 }`
  * `DELETE /api/v1/cart/items/{id}/` -> Xóa sản phẩm ra khỏi giỏ.

#### 3. Như thế nào
* **Xử lý Logic Backend:**
  * Khi `POST` thêm món ăn, kiểm tra xem bản ghi `CartItem` chứa món này trong giỏ của User đã tồn tại chưa. Nếu có rồi, thực hiện cộng dồn `quantity`.
  * Trước khi lưu, so sánh tổng `quantity` mới với `food.stock`. Nếu vượt quá, trả về mã trạng thái lỗi `400 Bad Request` cùng câu thông báo chi tiết: `"Số lượng yêu cầu vượt quá tồn kho hiện tại"`.

---

### FOOD-011 — Cart UI
* **Nhánh Git:** `feature/FOOD-011-cart-ui`
* **Mức độ ưu tiên:** Must Have (S2) | **Story Points:** 3 | **Phụ thuộc:** FOOD-010, FOOD-008

#### 1. Cần làm gì
* **Frontend:** Tạo Context `CartContext` lưu trữ danh sách giỏ hàng. Thiết kế trang Giỏ hàng `/cart` hiển thị danh sách các món ăn đã chọn, hình ảnh, đơn giá, tổng tiền của từng món, và tổng số tiền của cả đơn hàng. Hỗ trợ nút tăng/giảm nhanh số lượng và xóa món.

#### 2. Có cái gì
* **Giao diện:**
  * Trang `/cart` gồm bảng danh sách mặt hàng, cột số lượng tích hợp nút `+` và `-`, nút "Thanh toán" ở góc phải dưới bảng.
  * Badge thông báo số lượng sản phẩm trên icon Giỏ hàng ở Header của trang web.

#### 3. Như thế nào
* **Đồng bộ hóa Trạng thái:**
  * Khi người dùng nhấp nút `+` hoặc `-`, gọi API tương ứng `PATCH /cart/items/{id}/` với số lượng mới, sau đó cập nhật state cục bộ của `CartContext` để giao diện thay đổi tức thời.
  * Thiết lập trạng thái hiển thị giỏ trống (Empty State) hiển thị nút "Quay lại Menu" nếu giỏ hàng không có sản phẩm nào.

---

### FOOD-012 — Order Creation
* **Nhánh Git:** `feature/FOOD-012-order-create`
* **Mức độ ưu tiên:** Must Have (S2) | **Story Points:** 8 | **Phụ thuộc:** FOOD-010

#### 1. Cần làm gì
* **Backend:** Viết logic đặt hàng. Khi khách hàng nhấn đặt hàng, hệ thống lấy dữ liệu từ giỏ hàng hiện tại tạo bản ghi `Order` và các bản ghi `OrderItem`. Chuyển số lượng tồn kho món ăn tương ứng và xóa sạch giỏ hàng.
* **QA:** Viết test trường hợp nhiều người cùng mua mặt hàng cuối cùng để kiểm tra khả năng khóa chống trùng lặp (Race condition).

#### 2. Có cái gì
* **Bảng database `orders` & `order_items`:**
  * `orders`: `id`, `user_id` (FK), `status` (Enum: pending, confirmed, ...), `subtotal`, `discount`, `total`, `delivery_address`, `payment_method`
  * `order_items`: `id`, `order_id` (FK), `food_id` (FK), `quantity`, `unit_price` (chụp lại giá tại thời điểm mua để tránh thay đổi giá sau này ảnh hưởng đến lịch sử doanh thu)
* **API Endpoint:**
  * `POST /api/v1/orders/` -> Nhận: `{ "delivery_address", "payment_method" }`

#### 3. Như thế nào
* **Sử dụng Transaction và Lock:**
  Sử dụng decorator `@transaction.atomic` và khóa `select_for_update()` của Django ORM để khóa các dòng dữ liệu của thực thể Food khi đang xử lý trừ kho, tránh hiện tượng trừ kho âm khi có nhiều request đồng thời:
  ```python
  @transaction.atomic
  def create_order(user, address, payment_method):
      cart = Cart.objects.get(user=user)
      items = cart.items.select_related('food').all()
      # Khóa các bản ghi food liên quan
      food_ids = [item.food.id for item in items]
      foods = {f.id: f for f in Food.objects.select_for_update().filter(id__in=food_ids)}
      
      # Tạo đơn hàng và trừ kho
      for item in items:
          db_food = foods[item.food.id]
          if db_food.stock < item.quantity:
              raise ValidationError(f"Món {db_food.name} đã hết hàng")
          db_food.stock -= item.quantity
          db_food.save()
      # Tạo Order, OrderItems, clear giỏ và trả về Order
  ```

---

### FOOD-013 — Payment (COD Mock)
* **Nhánh Git:** `feature/FOOD-013-payment-cod`
* **Mức độ ưu tiên:** Must Have (S2) | **Story Points:** 3 | **Phụ thuộc:** FOOD-012

#### 1. Cần làm gì
* **Backend:** Tạo mô hình thanh toán liên kết 1-1 với đơn hàng. Viết API mô phỏng kết quả thanh toán COD (thanh toán khi nhận hàng) và thanh toán Online (Mock Gateway).

#### 2. Có cái gì
* **Bảng database `payments`:**
  * `id`, `order_id` (FK Unique), `status` (Enum: pending, paid, failed, refunded), `amount`, `transaction_id` (mã giao dịch giả lập), `paid_at` (DateTime)
* **API Endpoints:**
  * `POST /api/v1/payments/{order_id}/confirm/` -> Request: `{ "status": "paid" }` -> Đổi trạng thái thanh toán và đổi trạng thái đơn hàng sang `confirmed`.

#### 3. Như thế nào
* **Logic xử lý thanh toán:**
  * Nếu chọn `payment_method = 'cod'`, khi tạo đơn hàng thành công, tạo bản ghi thanh toán ở trạng thái `pending`.
  * Nếu chọn `payment_method = 'online'`, ứng dụng sẽ điều hướng sang một màn hình giả lập cổng thanh toán trên FE. Khi người dùng click nút "Thanh toán thành công" trên giao diện giả lập, frontend gửi request lên API confirm để cập nhật dữ liệu.

---

### FOOD-014 — Checkout Page
* **Nhánh Git:** `feature/FOOD-014-checkout-page`
* **Mức độ ưu tiên:** Must Have (S2) | **Story Points:** 5 | **Phụ thuộc:** FOOD-011, FOOD-012

#### 1. Cần làm gì
* **Frontend:** Thiết kế màn hình Thanh toán (`/checkout`) hiển thị tóm tắt thông tin đơn hàng hiện tại, form nhập thông tin địa chỉ giao hàng và phương thức thanh toán.

#### 2. Có cái gì
* **Giao diện:**
  * Form điền địa chỉ giao hàng có validation bắt buộc nhập, kiểm tra độ dài chuỗi tối thiểu.
  * Tùy chọn radio button chọn phương thức thanh toán: COD hoặc Online Mock.
  * Nút "Xác nhận đặt hàng" kích hoạt vòng xoay loading chặn click đúp khi đang xử lý gửi API.

#### 3. Như thế nào
* **Quy trình xử lý:**
  1. Kiểm tra xem giỏ hàng có rỗng không, nếu rỗng thì redirect về `/menu`.
  2. Khi người dùng click xác nhận, gọi API `POST /api/v1/orders/`.
  3. Nếu thành công, xóa giỏ hàng ở Context trên frontend và điều hướng người dùng tới trang theo dõi đơn hàng `/orders/:id`.

---

### FOOD-015 — Order Tracking
* **Nhánh Git:** `feature/FOOD-015-order-tracking`
* **Mức độ ưu tiên:** Must Have (S2) | **Story Points:** 5 | **Phụ thuộc:** FOOD-012

#### 1. Cần làm gì
* **Backend:** Xây dựng luồng thay đổi trạng thái đơn hàng và các API để khách hàng xem lịch sử đơn hàng của bản thân, quản trị viên cập nhật trạng thái đơn hàng.
* **Frontend:** Thiết kế trang xem danh sách đơn hàng đã mua và trang chi tiết trạng thái đơn hàng có sơ đồ thanh tiến trình (Timeline Stepper).

#### 2. Có cái gì
* **Trạng thái đơn hàng:**
  `pending` (Chờ xử lý) -> `confirmed` (Đã xác nhận) -> `preparing` (Đang chuẩn bị) -> `delivering` (Đang giao) -> `delivered` (Đã giao). Trạng thái có thể chuyển sang `cancelled` (Đã hủy) từ bước chờ xử lý hoặc đã xác nhận.
* **API Endpoints:**
  * `GET /api/v1/orders/` (Lấy danh sách đơn của user hiện tại).
  * `GET /api/v1/orders/{id}/` (Lấy thông tin chi tiết đơn hàng).
  * `PATCH /api/v1/orders/{id}/status/` -> Payload: `{ "status": "preparing" }` (Chỉ cho phép quản lý cửa hàng và người giao hàng thực hiện).

#### 3. Như thế nào
* **Trình bày thanh tiến trình:**
  Sử dụng component `<Stepper>` của MUI để thể hiện trực quan quá trình xử lý đơn hàng. Ánh xạ trạng thái DB với chỉ số Active Step của component để tô màu hoàn thành tương ứng:
  ```javascript
  const statusSteps = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered'];
  const activeStep = statusSteps.indexOf(order.status);
  ```

---

### FOOD-016 — Admin User Management
* **Nhánh Git:** `feature/FOOD-016-admin-users`
* **Mức độ ưu tiên:** Should Have (S2) | **Story Points:** 3 | **Phụ thuộc:** FOOD-003

#### 1. Cần làm gì
* **Backend:** Viết các API cho phép quản trị viên cấp cao (Admin) quản lý thông tin tài khoản người dùng, thay đổi vai trò hoặc vô hiệu hóa tài khoản (khóa tài khoản).
* **Frontend:** Thiết kế trang `/admin/users` hiển thị danh sách người dùng dưới dạng Grid, cho phép lọc theo vai trò và kích hoạt/vô hiệu hóa nhanh qua Switch.

#### 2. Có cái gì
* **API Endpoints:**
  * `GET /api/v1/admin/users/` (Yêu cầu JWT role Admin)
  * `PATCH /api/v1/admin/users/{id}/` -> Payload: `{ "role": "delivery_staff", "is_active": false }`
* Đảm bảo kiểm tra logic nghiệp vụ: Không cho phép Admin tự vô hiệu hóa tài khoản của chính mình hoặc tự tước quyền Admin của chính mình.

#### 3. Như thế nào
* **Ngăn chặn lỗi logic nghiệp vụ trên Backend:**
  ```python
  class AdminUserViewSet(viewsets.ModelViewSet):
      permission_classes = [IsAdminUser] # Lớp phân quyền Admin
      
      def perform_update(self, serializer):
          instance = self.get_object()
          if instance == self.request.user and 'is_active' in serializer.validated_data and not serializer.validated_data['is_active']:
              raise ValidationError("Bạn không được tự khóa tài khoản của chính mình.")
          serializer.save()
  ```

---

### FOOD-017 — Admin Dashboard Layout
* **Nhánh Git:** `feature/FOOD-017-admin-layout`
* **Mức độ ưu tiên:** Should Have (S2) | **Story Points:** 2 | **Phụ thuộc:** FOOD-016

#### 1. Cần làm gì
* **Frontend:** Xây dựng khung giao diện quản trị Admin (`AdminLayout`). Khung này bao gồm thanh trình đơn bên trái (Sidebar) chứa các liên kết quản lý danh mục, món ăn, đơn hàng, tài khoản người dùng, xem báo cáo doanh thu, đi kèm bộ lọc bảo vệ router (Route Guard) chặn truy cập trái phép.

#### 2. Có cái gì
* **Sidebar Links:**
  * `/admin` -> Dashboard tổng quan.
  * `/admin/categories` -> Quản lý danh mục (FOOD-005 UI).
  * `/admin/foods` -> Quản lý món ăn (FOOD-006 UI).
  * `/admin/orders` -> Quản lý đơn hàng toàn hệ thống.
  * `/admin/users` -> Quản lý người dùng.
* **Role Guard:** Đảm bảo khách hàng thường (customer) khi cố tình gõ đường dẫn `/admin` trên URL sẽ lập tức bị đá văng về trang `/menu`.

#### 3. Như thế nào
* **Tạo Component Route Guard:**
  ```javascript
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/menu" replace />;
    }
    return children;
  };
  ```
  Bọc ngoài các Route admin trong `App.jsx` bằng Component trên:
  `<ProtectedRoute allowedRoles={['admin', 'restaurant_manager']}> <AdminLayout /> </ProtectedRoute>`.

---

## 🚀 SPRINT 3 — MỞ RỘNG & CHẤT LƯỢNG

### FOOD-018 — Role-Based Access Control (RBAC)
* **Nhánh Git:** `feature/FOOD-018-rbac-roles`
* **Mức độ ưu tiên:** Must Have (S3) | **Story Points:** 5 | **Phụ thuộc:** FOOD-016

#### 1. Cần làm gì
* **Backend:** Phân định rõ quyền hạn truy cập API cho 4 vai trò người dùng trong hệ thống: `customer`, `restaurant_manager`, `delivery_staff`, và `admin`.
* **DevOps:** Thiết lập script seed dữ liệu khởi tạo tạo sẵn 4 tài khoản mẫu tương ứng 4 vai trò này để phục vụ demo nhanh.

#### 2. Có cái gì
* **Ma trận phân quyền:**
  * Khách hàng (`customer`): Chỉ xem thông tin menu, quản lý giỏ hàng cá nhân, đặt đơn hàng của mình, viết đánh giá cho các đơn hàng đã nhận.
  * Người giao hàng (`delivery_staff`): Chỉ có quyền xem danh sách đơn hàng cần giao, cập nhật trạng thái giao hàng (`delivering` sang `delivered`).
  * Quản lý nhà hàng (`restaurant_manager`): Được CRUD món ăn, danh mục, cập nhật các trạng thái chuẩn bị đơn hàng (`confirmed` sang `preparing`), xem thống kê doanh thu.
  * Quản trị viên (`admin`): Toàn quyền hệ thống, quản lý tài khoản người dùng và tạo mã giảm giá voucher.

#### 3. Như thế nào
* **Định nghĩa các Class Permissions chuyên biệt trong Django:**
  * Tạo file `apps/users/permissions.py`. Định nghĩa các class: `IsCustomer`, `IsDeliveryStaff`, `IsRestaurantManager`, `IsAdminUser`.
  * Áp dụng các permission này vào thuộc tính `permission_classes` của các ViewSet tương ứng. Ví dụ, `OrderViewSet` sẽ ghi đè phương thức `get_permissions()` để trả về permission tùy theo hành động (ví dụ: hành động cập nhật trạng thái đơn hàng yêu cầu quyền là quản lý hoặc giao hàng).

---

### FOOD-019 — Redis Cache
* **Nhánh Git:** `feature/FOOD-019-redis-cache`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-006

#### 1. Cần làm gì
* **Backend:** Cài đặt Redis làm bộ nhớ đệm (Cache) lưu trữ danh sách món ăn, chi tiết món ăn và danh mục để giảm tải truy vấn trực tiếp vào database PostgreSQL.
* **DevOps:** Cấu hình cài đặt môi trường Redis cục bộ.

#### 2. Có cái gì
* **Danh sách Cache Keys & TTL (Thời gian sống):**
  * `categories:all` -> Thời gian sống: 30 phút.
  * `foods:list:page_<num>:search_<term>` -> Thời gian sống: 5 phút.
  * `foods:detail:<id>` -> Thời gian sống: 10 phút.
* **Cơ chế Invalidation (Xóa cache):** Khi admin thực hiện thêm mới, cập nhật hoặc xóa bất cứ món ăn/danh mục nào, hệ thống phải tự động dọn sạch các cache keys cũ để tránh hiển thị dữ liệu sai lệch cho người dùng.

#### 3. Như thế nào
* **Cấu hình Django Cache:**
  Sử dụng thư viện `django-redis` trong cấu hình settings:
  ```python
  CACHES = {
      "default": {
          "BACKEND": "django_redis.cache.RedisCache",
          "LOCATION": "redis://127.0.0.1:6379/1",
          "OPTIONS": {
              "CLIENT_CLASS": "django_redis.client.DefaultClient",
          }
      }
  }
  ```
* **Invalidation bằng Django Signals:**
  Sử dụng decorator `@receiver(post_save, sender=Food)` để lắng nghe sự kiện thay đổi dữ liệu món ăn và gọi hàm `cache.delete_many()` xóa các keys danh sách món ăn đã lưu trước đó.

---

### FOOD-020 — Voucher Management
* **Nhánh Git:** `feature/FOOD-020-voucher-mgmt`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-018

#### 1. Cần làm gì
* **Backend:** Xây dựng module quản lý mã giảm giá (Voucher). Cho phép thiết lập giảm giá theo tỷ lệ phần trăm (percent) kèm theo mức giảm tối đa, hoặc giảm giá trực tiếp một khoản tiền cố định (fixed).
* **Frontend:** Thiết kế trang quản lý mã giảm giá dành cho Admin để tạo mã mới, giới hạn số lượt sử dụng tối đa và thời gian hiệu lực của mã.

#### 2. Có cái gì
* **Bảng database `vouchers`:**
  * `id` (UUID), `code` (Varchar Unique), `discount_type` (Enum: percent, fixed), `discount_value` (Decimal), `min_order` (Decimal), `max_uses` (Int), `used_count` (Int), `start_date`, `end_date`, `is_active`
* **API Endpoints:**
  * `POST /api/v1/vouchers/` (Chỉ Admin)
  * `GET /api/v1/vouchers/` (Xem danh sách voucher khả dụng)

#### 3. Như thế nào
* **Validation Ngày tháng khi tạo:**
  Trong Serializer của Voucher, viết hàm validate kiểm tra ngày kết thúc (`end_date`) phải luôn lớn hơn ngày bắt đầu (`start_date`) và ngày bắt đầu không được nhỏ hơn ngày hiện tại khi tạo mới voucher.

---

### FOOD-021 — Apply Voucher at Checkout
* **Nhánh Git:** `feature/FOOD-021-voucher-checkout`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-020, FOOD-012

#### 1. Cần làm gì
* **Backend:** Viết API kiểm tra tính hợp lệ của mã giảm giá khi khách hàng nhập mã. Cập nhật logic thanh toán đơn hàng để tính toán lại số tiền được giảm giá và tổng tiền thanh toán cuối cùng.
* **Frontend:** Thiết kế ô nhập mã giảm giá tại màn hình checkout, hiển thị số tiền được giảm trừ trực quan trước khi xác nhận.

#### 2. Có cái gì
* **API Validate Voucher:**
  * `POST /api/v1/vouchers/validate/` -> Gửi đi: `{ "code": "FOODIEGO10", "order_amount": 150000 }`
  * Trả về (200 OK - Hợp lệ): `{ "valid": true, "discount": 15000, "message": "Áp dụng thành công" }`
  * Trả về (400 Bad Request - Không hợp lệ): `{ "valid": false, "discount": 0, "message": "Lý do (Voucher hết hạn, chưa đủ điều kiện giá trị tối thiểu...)" }`
* Đơn hàng `Order` lưu thêm thông tin: `voucher_id` (FK), `discount` (Số tiền giảm), `total` (Bằng subtotal - discount).

#### 3. Như thế nào
* **Quy trình kiểm tra tính hợp lệ của Voucher:**
  1. Truy vấn voucher bằng mã code đang hoạt động (`is_active=True`).
  2. Kiểm tra thời gian hiện tại nằm trong khoảng `start_date` và `end_date`.
  3. Kiểm tra số lượt đã dùng `used_count` < `max_uses`.
  4. Kiểm tra xem tổng giá trị của các món ăn trong giỏ hàng có đạt mức tối thiểu `min_order` yêu cầu không.
  5. Nếu tất cả thỏa mãn, tính số tiền giảm dựa trên công thức của `discount_type`. Đối với giảm theo phần trăm, áp dụng giới hạn giảm tối đa (nếu có).

---

### FOOD-022 — Rating & Review
* **Nhánh Git:** `feature/FOOD-022-rating-review`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 5 | **Phụ thuộc:** FOOD-015

#### 1. Cần làm gì
* **Backend:** Cho phép người dùng đánh giá xếp hạng sao (từ 1 đến 5 sao) và ghi nhận xét về món ăn sau khi đơn hàng chuyển sang trạng thái đã giao (`delivered`).
* **Frontend:** Thiết kế form đánh giá tại trang chi tiết đơn hàng cho từng món ăn. Hiển thị điểm số đánh giá trung bình lên thẻ món ăn ở Menu.

#### 2. Có cái gì
* **Bảng database `reviews`:**
  * `id` (UUID), `user_id` (FK), `food_id` (FK), `order_id` (FK), `rating` (Int Check từ 1 đến 5), `comment` (Text), `created_at`
  * Đảm bảo ràng buộc duy nhất (Unique Constraint) cho tổ hợp: `(user_id, food_id, order_id)` để tránh việc một người dùng đánh giá nhiều lần cho cùng một món ăn trong một đơn hàng.
* **API Endpoints:**
  * `POST /api/v1/reviews/` -> Gửi đi: `{ "order_id", "food_id", "rating", "comment" }`
  * `GET /api/v1/foods/{id}/reviews/` (Lấy danh sách các nhận xét của món ăn)

#### 3. Như thế nào
* **Cập nhật điểm đánh giá trung bình:**
  Khi một bản ghi Review được lưu thành công, hệ thống tính toán lại điểm trung bình (`avg_rating`) của món ăn đó bằng cách tính trung bình cộng tất cả cột `rating` của món ăn đó trong bảng reviews và lưu trực tiếp giá trị mới này vào cột `avg_rating` của bảng `foods` để tối ưu hóa hiệu năng truy vấn danh sách món ăn.

---

### FOOD-023 — Notification System
* **Nhánh Git:** `feature/FOOD-023-notification`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-015

#### 1. Cần làm gì
* **Backend:** Tạo mô hình cơ sở dữ liệu lưu trữ các thông báo gửi đến người dùng trong hệ thống (Ví dụ: trạng thái đơn hàng thay đổi).
* **Frontend:** Tạo biểu tượng Chuông thông báo trên thanh tiêu đề Header, hiển thị dấu đỏ báo số lượng tin chưa đọc và hiển thị danh sách dạng popup khi click vào.

#### 2. Có cái gì
* **Bảng database `notifications`:**
  * `id` (UUID), `user_id` (FK), `title` (Varchar), `message` (Text), `is_read` (Boolean), `created_at`
* **API Endpoints:**
  * `GET /api/v1/notifications/` -> Trả về danh sách thông báo của người dùng hiện tại (sắp xếp tin mới nhất lên đầu).
  * `PATCH /api/v1/notifications/{id}/read/` -> Payload: `{ "is_read": true }` -> Đánh dấu thông báo đã đọc.

#### 3. Như thế nào
* **Cơ chế đẩy thông báo đơn giản:**
  * Mỗi khi trạng thái đơn hàng thay đổi (ví dụ: chuyển từ `pending` sang `confirmed`), Backend viết thêm logic tự động insert một dòng thông báo mới vào bảng notifications gán cho user sở hữu đơn hàng đó.
  * Phía Frontend định kỳ gửi yêu cầu GET lấy danh sách thông báo mới (polling) mỗi 30 giây để cập nhật số lượng thông báo chưa đọc.

---

### FOOD-024 — Celery Background Jobs
* **Nhánh Git:** `feature/FOOD-024-celery-jobs`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 5 | **Phụ thuộc:** FOOD-023

#### 1. Cần làm gì
* **Backend:** Cấu hình Celery sử dụng Redis làm Message Broker để thực hiện chạy các tác vụ nền bất đồng bộ (ví dụ: tạo thông báo, gửi email mock xác nhận đơn hàng) nhằm cải thiện tốc độ phản hồi của API.
* **QA / DevOps:** Tạo môi trường chạy celery worker và celery beat (chạy tác vụ định kỳ).

#### 2. Có cái gì
* **Danh sách tác vụ nền:**
  * `send_order_confirmation(order_id)`: Chạy bất đồng bộ ngay sau khi tạo đơn hàng. Giả lập tác vụ gửi email xác nhận đặt hàng thành công (chờ 3 giây giả lập và ghi log).
  * `expire_vouchers()`: Tác vụ định kỳ chạy mỗi giờ 1 lần, quét qua các voucher có hạn dùng nhỏ hơn thời gian hiện tại để cập nhật `is_active = False`.

#### 3. Như thế nào
* **Cài đặt & Khai báo Celery:**
  1. Tạo file `backend/config/celery.py` thiết lập cấu hình kết nối tới Redis: `celery_app = Celery('foodiego', broker='redis://localhost:6379/0')`.
  2. Khai báo các task bằng decorator `@shared_task`.
  3. Tại API đặt hàng, gọi task nền bằng phương thức `.delay()`:
     ```python
     # views.py
     from .tasks import send_order_confirmation
     order = create_order(...)
     send_order_confirmation.delay(order.id)
     ```

---

### FOOD-025 — Revenue Report
* **Nhánh Git:** `feature/FOOD-025-revenue-report`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-018

#### 1. Cần làm gì
* **Backend:** Viết API thống kê dữ liệu doanh thu của cửa hàng trong một khoảng thời gian được chọn.
* **Frontend:** Thiết kế giao diện báo cáo doanh thu trực quan hiển thị biểu đồ dạng cột hoặc đường thẳng sử dụng thư viện biểu đồ.

#### 2. Có cái gì
* **API Endpoint:**
  * `GET /api/v1/reports/revenue/?from=YYYY-MM-DD&to=YYYY-MM-DD`
  * Trả về (200 OK):
    ```json
    {
      "total_revenue": 12500000.00,
      "total_orders": 140,
      "daily_breakdown": [
        { "date": "2026-06-01", "revenue": 1500000.00, "orders": 15 },
        { "date": "2026-06-02", "revenue": 2000000.00, "orders": 20 }
      ]
    }
    ```
* **Giao diện:**
  Trang thống kê doanh thu có bộ lọc ngày (Date Picker) và hiển thị biểu đồ cột của `Recharts` hoặc `Chart.js` để hiển thị doanh thu qua các ngày.

#### 3. Như thế nào
* **Truy vấn Aggregate trong Django:**
  Sử dụng các hàm `Sum`, `Count` và `TruncDate` để gom nhóm dữ liệu hóa đơn có trạng thái đã giao thành công (`status = 'delivered'`) theo từng ngày:
  ```python
  from django.db.models.functions import TruncDate
  from django.db.models import Sum, Count

  orders = Order.objects.filter(status='delivered', created_at__range=[start_date, end_date])
  daily_data = orders.annotate(date=TruncDate('created_at')).values('date').annotate(
      revenue=Sum('total'),
      orders=Count('id')
  ).order_by('date')
  ```

---

### FOOD-026 — Docker Compose
* **Nhánh Git:** `feature/FOOD-026-docker-compose`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-024

#### 1. Cần làm gì
* **DevOps:** Đóng gói toàn bộ mã nguồn hệ thống thành các Docker Image và thiết lập file cấu hình `docker-compose.yml` để khởi chạy đồng thời tất cả các dịch vụ (Database, Redis, Backend, Celery, Frontend) chỉ bằng một câu lệnh duy nhất.

#### 2. Có cái gì
* **Các file cấu hình cấu trúc Docker:**
  * `backend/Dockerfile`: Build môi trường Python và cài đặt Django.
  * `frontend/Dockerfile`: Build code React và cấu hình chạy web server Nginx tĩnh.
  * `docker-compose.yml`: Định nghĩa mạng ảo chung, ánh xạ dữ liệu và môi trường cho 5 services: `db` (Postgres), `redis` (Redis), `web` (Frontend), `api` (Backend), `celery_worker` (Celery).

#### 3. Như thế nào
* **Cấu trúc `docker-compose.yml` tối ưu:**
  ```yaml
  version: '3.8'
  services:
    db:
      image: postgres:15
      volumes:
        - postgres_data:/var/lib/postgresql/data
      environment:
        - POSTGRES_DB=foodiego
        - POSTGRES_USER=postgres
        - POSTGRES_PASSWORD=secret
    redis:
      image: redis:7-alpine
    api:
      build: ./backend
      command: python manage.py runserver 0.0.0.0:8000
      ports:
        - "8000:8000"
      depends_on:
        - db
        - redis
    celery_worker:
      build: ./backend
      command: celery -A config worker --loglevel=info
      depends_on:
        - redis
  volumes:
    postgres_data:
  ```

---

### FOOD-027 — SonarQube Quality Gate
* **Nhánh Git:** `feature/FOOD-027-sonarqube`
* **Mức độ ưu tiên:** Should Have (S3) | **Story Points:** 3 | **Phụ thuộc:** FOOD-002

#### 1. Cần làm gì
* **DevOps:** Tích hợp công cụ SonarQube phân tích chất lượng mã nguồn vào luồng CI (GitHub Actions). Thiết lập bộ tiêu chí vượt qua (Quality Gate) để đảm bảo chất lượng code.

#### 2. Có cái gì
* **File cấu hình:** `sonar-project.properties` tại gốc dự án.
* **Bộ quy tắc Quality Gate yêu cầu:**
  * Độ phủ kiểm thử (Test Coverage): >= 80%.
  * Lỗi tiềm ẩn (Bugs): 0 lỗi.
  * Lỗ hổng bảo mật (Vulnerabilities): 0 lỗi.
  * Dòng code trùng lặp (Duplicated lines): <= 3%.

#### 3. Như thế nào
* **Cấu hình quét code:**
  Khai báo khóa dự án và đường dẫn loại trừ các file thư viện sinh ra tự động trong file `sonar-project.properties`:
  ```ini
  sonar.projectKey=foodiego-system
  sonar.sources=backend,frontend/src
  sonar.exclusions=**/migrations/**, **/node_modules/**, **/tests/**
  sonar.python.coverage.reportPaths=backend/coverage.xml
  sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info
  ```
  Trong workflow CI, sau bước chạy pytest sinh file `coverage.xml`, thêm bước chạy `SonarSource/sonarqube-scan-action` gửi kết quả phân tích lên server SonarQube.

---

## 🌐 SPRINT 4 — MICROSERVICES & NỘP ĐỒ ÁN

### FOOD-028 — User Microservice
* **Nhánh Git:** `feature/FOOD-028-user-service`
* **Mức độ ưu tiên:** Must Have (S4) | **Story Points:** 5 | **Phụ thuộc:** FOOD-003

#### 1. Cần làm gì
* **Backend:** Bóc tách module quản lý người dùng (`users` app) ra khỏi hệ thống Monolith để tạo thành một service độc lập (User Service) hoạt động trên cổng `:8001` sử dụng một Database PostgreSQL riêng biệt (`user_db`).
* **DevOps:** Cấu hình Docker để khởi chạy riêng biệt cơ sở dữ liệu và dịch vụ này.

#### 2. Có cái gì
* **Cấu trúc Dịch vụ:**
  * Port chạy: `8001`
  * Database độc lập: `user_db`
  * Các API đảm nhiệm: Đăng nhập, Đăng ký, Lấy thông tin cá nhân, Thay đổi vai trò người dùng.
  * Cấu hình tạo mã Token JWT sử dụng cùng một khóa ký mật thuật (`SECRET_KEY`) chung với các service khác để các service khác có thể tự xác thực giải mã token mà không cần gọi trực tiếp về User Service.

#### 3. Như thế nào
* **Tách cơ sở dữ liệu:**
  1. Tạo thư mục `services/user_service/` và di chuyển toàn bộ code app `users` và config chạy cơ bản của Django sang đây.
  2. Tạo database mới `user_db` trong PostgreSQL.
  3. Cấu hình biến môi trường database của riêng User Service trỏ tới `user_db`.
  4. Chạy lệnh migrate khởi tạo lại cấu trúc bảng riêng.

---

### FOOD-029 — Food Microservice
* **Nhánh Git:** `feature/FOOD-029-food-service`
* **Mức độ ưu tiên:** Must Have (S4) | **Story Points:** 5 | **Phụ thuộc:** FOOD-006

#### 1. Cần làm gì
* **Backend:** Bóc tách module quản lý món ăn và danh mục (`foods` app) ra thành dịch vụ độc lập (Food Service) hoạt động trên cổng `:8002` sở hữu Database riêng (`food_db`).
* **DevOps:** Thiết lập cài đặt dịch vụ và kết nối database độc lập.

#### 2. Có cái gì
* **Cấu trúc Dịch vụ:**
  * Port chạy: `8002`
  * Database độc lập: `food_db`
  * Các API đảm nhiệm: Xem thực đơn, tìm kiếm món ăn, CRUD danh mục, CRUD món ăn, quản lý kho hàng.
  * Tích hợp cấu hình Redis Cache riêng biệt phục vụ tăng tốc độ đọc danh sách món ăn.

#### 3. Như thế nào
* **Xử lý sự phụ thuộc:**
  Chuyển toàn bộ các model `Category`, `Food` sang thư mục dịch vụ mới `services/food_service/`. Xóa liên kết khóa ngoại trực tiếp tới bảng `users`. Mọi thông tin cần định danh người dùng (như xác thực quyền Admin chỉnh sửa món ăn) sẽ được thực hiện bằng cách đọc thông tin vai trò người dùng giải mã trực tiếp từ Token gửi lên trong request header.

---

### FOOD-030 — Order Microservice
* **Nhánh Git:** `feature/FOOD-030-order-service`
* **Mức độ ưu tiên:** Must Have (S4) | **Story Points:** 8 | **Phụ thuộc:** FOOD-028, FOOD-029

#### 1. Cần làm gì
* **Backend:** Chuyển đổi module đơn hàng, giỏ hàng, thanh toán và voucher thành dịch vụ Order Service chạy trên cổng `:8003` sử dụng database độc lập (`order_db`).
* **QA:** Viết tích hợp kiểm thử việc gọi giao tiếp chéo giữa các microservice bằng HTTP request.

#### 2. Có cái gì
* **Cấu trúc Dịch vụ:**
  * Port chạy: `8003`
  * Database độc lập: `order_db`
  * Các API đảm nhiệm: Quản lý giỏ hàng, Đặt hàng, Áp dụng Voucher, Cập nhật trạng thái đơn hàng.
  * Giao tiếp liên dịch vụ (Inter-service communication): Khi tạo đơn hàng, Order Service cần kiểm tra tồn kho và đơn giá thực tế của món ăn bằng cách gửi HTTP request gọi sang Food Service ở cổng `:8002`.

#### 3. Như thế nào
* **Giao tiếp qua HTTP REST Client:**
  Sử dụng thư viện `requests` trong Python để gọi chéo dữ liệu giữa các dịch vụ:
  ```python
  # services/order_service/services.py
  import requests

  def check_food_stock_and_price(food_id, quantity):
      response = requests.get(f"http://food-service:8002/api/v1/foods/{food_id}/")
      if response.status_code != 200:
          raise ValueError("Món ăn không tồn tại")
      food_data = response.json()
      if food_data['stock'] < quantity:
          raise ValueError(f"Món {food_data['name']} không đủ số lượng tồn kho")
      return food_data['price']
  ```

---

### FOOD-031 — API Gateway
* **Nhánh Git:** `feature/FOOD-031-api-gateway`
* **Mức độ ưu tiên:** Must Have (S4) | **Story Points:** 5 | **Phụ thuộc:** FOOD-028, FOOD-029, FOOD-030

#### 1. Cần làm gì
* **DevOps:** Thiết lập một API Gateway chung hoạt động ở cổng `:8080` sử dụng Nginx làm proxy ngược (Reverse Proxy). Chịu trách nhiệm nhận mọi request từ Frontend gửi đến và điều hướng chính xác về các Microservices chạy ở các cổng nội bộ phía sau.
* **Frontend:** Thay đổi địa chỉ biến môi trường API URL trên client sang địa chỉ duy nhất của API Gateway thay vì gọi lẻ tẻ tới từng service.

#### 2. Có cái gì
* **Cơ chế điều hướng (Routing Rule):**
  * `/api/v1/auth/*` và `/api/v1/users/*` -> Điều hướng tới User Service ở cổng `:8001`.
  * `/api/v1/categories/*` và `/api/v1/foods/*` -> Điều hướng tới Food Service ở cổng `:8002`.
  * `/api/v1/cart/*`, `/api/v1/orders/*`, `/api/v1/payments/*`, `/api/v1/vouchers/*` -> Điều hướng tới Order Service ở cổng `:8003`.

#### 3. Như thế nào
* **Cấu hình file Nginx (`nginx.conf`):**
  ```nginx
  server {
      listen 8080;

      location /api/v1/auth/ {
          proxy_pass http://user-service:8001;
      }
      location /api/v1/users/ {
          proxy_pass http://user-service:8001;
      }
      location /api/v1/categories/ {
          proxy_pass http://food-service:8002;
      }
      location /api/v1/foods/ {
          proxy_pass http://food-service:8002;
      }
      location /api/v1/orders/ {
          proxy_pass http://order-service:8003;
      }
      location /api/v1/cart/ {
          proxy_pass http://order-service:8003;
      }
  }
  ```

---

### FOOD-032 — Prometheus & Grafana
* **Nhánh Git:** `feature/FOOD-032-monitoring`
* **Mức độ ưu tiên:** Should Have (S4) | **Story Points:** 3 | **Phụ thuộc:** FOOD-031

#### 1. Cần làm gì
* **DevOps:** Triển khai hệ thống giám sát hiệu năng (Monitoring). Sử dụng Prometheus để thu thập dữ liệu chỉ số từ các dịch vụ và thiết lập giao diện bảng điều khiển Grafana để biểu diễn số liệu trực quan.

#### 2. Có cái gì
* **Các chỉ số giám sát tối thiểu (Metrics):**
  * `http_requests_total`: Tổng số lượt yêu cầu gửi đến phân chia theo mã HTTP trả về (2xx, 4xx, 5xx).
  * `http_request_duration_seconds`: Thời gian xử lý phản hồi trung bình (độ trễ - Latency).
  * Trạng thái tài nguyên máy chủ: Mức độ tiêu thụ CPU, RAM của từng Docker Container.
* **Giao diện bảng điều khiển:** Grafana dashboard hiển thị biểu đồ tốc độ Request trên giây (RPS) và biểu đồ phân vị độ trễ P95/P99.

#### 3. Như thế nào
* **Tích hợp exporter vào Django:**
  1. Cài đặt thư viện `django-prometheus` cho cả 3 microservices.
  2. Khai báo middleware của thư viện này ở vị trí đầu và cuối danh sách middleware trong settings.
  3. Mở endpoint `/metrics` công khai cho Prometheus quét dữ liệu.
  4. Cấu hình file `prometheus.yml` khai báo danh sách địa chỉ IP của 3 services để định kỳ quét lấy mẫu dữ liệu mỗi 15 giây.

---

### FOOD-033 — k6 Load Testing
* **Nhánh Git:** `feature/FOOD-033-k6-loadtest`
* **Mức độ ưu tiên:** Should Have (S4) | **Story Points:** 3 | **Phụ thuộc:** FOOD-031

#### 1. Cần làm gì
* **QA:** Viết kịch bản kiểm thử tải (Load Test) mô phỏng hành vi của nhiều người dùng cùng truy cập hệ thống đồng thời thông qua công cụ k6. Chạy kiểm thử trực tiếp vào cổng API Gateway.

#### 2. Có cái gì
* **Kịch bản kiểm thử tải (`tests/load/script.js`):**
  * Mô phỏng 50 người dùng ảo truy cập đồng thời (Virtual Users - VUs).
  * Thời gian chạy thử nghiệm liên tục: 5 phút.
  * Các hành động giả lập: Lấy danh sách món ăn -> Xem chi tiết món -> Thêm vào giỏ hàng -> Gọi thanh toán đơn hàng.
* **Tiêu chuẩn KPI đạt yêu cầu:**
  * Tốc độ phản hồi trung bình của API xem món ăn (P95) phải nhỏ hơn 500ms.
  * Tốc độ phản hồi của API đặt hàng (P95) phải nhỏ hơn 1500ms.
  * Tỷ lệ lỗi yêu cầu (Error rate) phải nhỏ hơn 1%.

#### 3. Như thế nào
* **Viết Script k6 bằng Javascript:**
  ```javascript
  import http from 'k6/http';
  import { sleep, check } from 'k6';

  export const options = {
    stages: [
      { duration: '1m', target: 50 }, // Tăng dần lên 50 người dùng trong 1 phút
      { duration: '3m', target: 50 }, // Giữ ổn định 50 người dùng trong 3 phút
      { duration: '1m', target: 0 },  // Giảm dần số lượng về 0
    ],
    thresholds: {
      http_req_duration: ['p(95)<500'], // P95 latency dưới 500ms
      http_req_failed: ['rate<0.01'],    // Lỗi dưới 1%
    },
  };

  export default function () {
    let res = http.get('http://api-gateway:8080/api/v1/foods/');
    check(res, { 'status is 200': (r) => r.status === 200 });
    sleep(1);
  }
  ```
  Chạy lệnh test bằng cách gõ: `k6 run tests/load/script.js` và xuất báo cáo kết quả dạng HTML để đưa vào báo cáo đồ án.

---

### FOOD-034 — AI Chatbot Assistant (RAG với pgvector & Ollama)
* **Nhánh Git:** `feature/FOOD-034-chatbot-rag`
* **Mức độ ưu tiên:** Should Have (S4) | **Story Points:** 5 | **Phụ thuộc:** FOOD-029, FOOD-026

#### 1. Cần làm gì
* **Backend:** Kích hoạt extension `pgvector` trên cơ sở dữ liệu PostgreSQL. Thêm trường `embedding` lưu trữ vector nhúng cho món ăn trong model Food. Kết nối tới service **Ollama** cục bộ để tính toán vector embedding (sử dụng model `nomic-embed-text`) mỗi khi tạo/sửa món ăn và sinh câu trả lời RAG tư vấn món ăn (sử dụng model `llama3` hoặc `phi3`) dựa trên câu hỏi của khách.
* **Frontend:** Thiết kế bong bóng chat (Floating Chat Widget) ở góc dưới bên phải màn hình Khách hàng. Cho phép mở cửa sổ hội thoại, gửi câu hỏi, hiển thị trạng thái đang trả lời (typing indicator) và hiển thị kết quả tư vấn thông minh.
* **DevOps:** Cấu hình file Docker Compose sử dụng image database Postgres hỗ trợ sẵn extension `pgvector` (Ví dụ: `pgvector/pgvector:pg15`) và thêm service `ollama` để chạy offline 100% không tốn phí.

#### 2. Có cái gì
* **Database:** Thêm trường `embedding` kiểu `vector(768)` (do model `nomic-embed-text` của Ollama sinh ra vector 768 chiều) vào bảng `foods`.
* **API Endpoints:**
  * `POST /api/v1/chatbot/ask/` -> Gửi lên: `{ "message": "Gợi ý cho tôi burger bò cay dưới 100k kèm nước uống" }`
  * Trả về (200 OK): `{ "response": "Chào bạn! Tôi đề xuất cho bạn món **Burger Bò Cay** (giá 89,000đ) kết hợp với **Coca-Cola lon** (15,000đ) tổng cộng chỉ 104,000đ rất thích hợp cho khẩu vị của bạn..." }`

#### 3. Như thế nào
* **Triển khai RAG trên Backend (Django):**
  1. Cài đặt thư viện `pgvector` cho Django: `pip install pgvector`.
  2. Tạo migration thêm trường `embedding` vào model `Food` và đăng ký extension:
     ```python
     from pgvector.django import VectorField
     
     class Food(models.Model):
         # ... các trường cũ ...
         embedding = VectorField(dimensions=768, null=True, blank=True) # nomic-embed-text (768 chiều)
     ```
  3. Logic truy vấn tìm món ăn tương tự (Semantic Search) & gọi Ollama local:
     ```python
     import requests
     from pgvector.django import CosineDistance
     from django.conf import settings

     OLLAMA_URL = getattr(settings, "OLLAMA_URL", "http://localhost:11434")

     def get_vector_embedding(text):
         # Gọi API Ollama sinh Vector Embedding cục bộ
         response = requests.post(
             f"{OLLAMA_URL}/api/embeddings",
             json={
                 "model": "nomic-embed-text",
                 "prompt": text
             }
         )
         response.raise_for_status()
         return response.json()['embedding']

     def chat_and_recommend(user_message):
         # 1. Sinh vector nhúng cho câu hỏi của khách bằng nomic-embed-text
         query_vector = get_vector_embedding(user_message)
         
         # 2. Tìm 3 món ăn phù hợp nhất sử dụng Cosine Distance trên pgvector
         matched_foods = Food.objects.annotate(
             distance=CosineDistance('embedding', query_vector)
         ).order_by('distance')[:3]
         
         # 3. Tạo context mô tả thực đơn phù hợp
         context = "\n".join([
             f"- {f.name}: {f.description} (Giá: {f.price}đ, Đánh giá: {f.avg_rating} sao)"
             for f in matched_foods
         ])
         
         # 4. Gửi Prompt hệ thống kèm Context và Câu hỏi lên Ollama để sinh câu trả lời tư vấn
         prompt = f"""
         Bạn là trợ lý ảo AI thông minh của FoodieGo. Nhiệm vụ của bạn là tư vấn món ăn từ danh sách món ăn phù hợp nhất dưới đây để trả lời câu hỏi của khách hàng. Hãy tư vấn ngắn gọn, thuyết phục, nhiệt tình và thân thiện bằng tiếng Việt.
         
         Danh sách món ăn khả dụng làm ngữ cảnh:
         {context}
         
         Câu hỏi của khách hàng: "{user_message}"
         Hãy viết câu trả lời tư vấn:
         """
         
         response = requests.post(
             f"{OLLAMA_URL}/api/generate",
             json={
                 "model": "llama3",
                 "prompt": prompt,
                 "stream": False
             }
         )
         response.raise_for_status()
         return response.json()['response']
     ```
* **Giao diện Widget Chatbot trên Frontend (React):**
  Sử dụng một component floating cố định `position: fixed; bottom: 20px; right: 20px; z-index: 1000`. Dùng state `messages` để lưu trữ lịch sử hội thoại dưới dạng mảng các object `{ sender: 'user' | 'bot', text: '...' }` để render giao diện bong bóng tin nhắn.
