# DineOps API Documentation

> **Tài liệu đã được tối ưu** - Loại bỏ các endpoints trùng lặp, giảm từ ~70 xuống ~55 endpoints

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
- **Private endpoints**: Yêu cầu Bearer Token trong header
  ```
  Authorization: Bearer <access_token>
  ```
- **Public endpoints**: Không yêu cầu authentication

---

## 1. USERS API (`/api/v1/users/`)

### 1.1 Register (Public)
**POST** `/api/v1/users/register/`

**Request Body:**
```json
{
  "email": "user@example.com",
  "user_name": "username123",
  "phone_number": "+84901234567",
  "password": "password123",
  "password_confirm": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```
- Chỉ cần 1 trong 3: email, user_name, hoặc phone_number
- password tối thiểu 8 ký tự

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "msg": "User registered successfully",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "user_name": "username123",
      "email": "user@example.com",
      "phone_number": "+84901234567",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "avatar_url": null,
      "is_active": true,
      "is_verified": false,
      "is_staff": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### 1.2 Login (Public)
**POST** `/api/v1/users/login/`

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```
hoặc
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
hoặc
```json
{
  "user_name": "username123",
  "password": "password123"
}
```
hoặc
```json
{
  "phone_number": "+84901234567",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Login successful",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "user_name": "username123",
      "email": "user@example.com",
      "full_name": "John Doe"
    }
  }
}
```

---

### 1.3 Refresh Token (Public)
**POST** `/api/v1/users/refresh/`

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Token refreshed successfully",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

---

### 1.4 Logout (Private)
**POST** `/api/v1/users/logout/`

**Request Body (Optional):**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```
- Nếu có refresh_token: chỉ revoke token đó
- Nếu không có: revoke tất cả tokens của user

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Logged out successfully"
}
```

---

### 1.5 Get Profile (Private)
**GET** `/api/v1/users/profile/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "user_name": "username123",
    "email": "user@example.com",
    "phone_number": "+84901234567",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar_url": null,
    "is_active": true,
    "is_verified": false,
    "is_staff": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 1.6 Update Profile (Private)
**PUT/PATCH** `/api/v1/users/profile/update/`

**Request Body:**
```json
{
  "first_name": "John Updated",
  "last_name": "Doe Updated",
  "avatar_url": "https://example.com/avatar.jpg"
}
```
- Chỉ cho phép update: first_name, last_name, avatar_url

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Profile updated successfully",
  "data": {
    "id": 1,
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "full_name": "John Updated Doe Updated",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### 1.7 Change Password (Private)
**POST** `/api/v1/users/profile/change-password/`

**Request Body:**
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123",
  "new_password_confirm": "newpassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Password changed successfully. Please login again."
}
```
- Sau khi đổi password, tất cả refresh tokens sẽ bị revoke

---

## 2. MENU API

### 2.1 Categories

#### 2.1.1 List Categories (Public)
**GET** `/api/v1/menu/categories/`

**Query Parameters:**
- `page`: Số trang (default: 1)
- `page_size`: Số items/trang (default: 10)
- `search`: Tìm kiếm theo name, description

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Categories retrieved successfully",
  "data": {
    "count": 50,
    "next": "http://localhost:8000/api/v1/menu/categories/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "Coffee",
        "description": "Hot and cold coffee drinks",
        "slug": "coffee",
        "is_active": true,
        "products_count": 15,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 2.1.2 Get Category Detail (Public)
**GET** `/api/v1/menu/categories/{id}/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Coffee",
    "description": "Hot and cold coffee drinks",
    "slug": "coffee",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "products": [
      {
        "id": 1,
        "category": 1,
        "category_name": "Coffee",
        "name": "Espresso",
        "description": "Strong Italian coffee",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 2.1.3 Get Products in Category (Public)
**GET** `/api/v1/menu/categories/{id}/products/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "category": 1,
      "category_name": "Coffee",
      "name": "Espresso",
      "description": "Strong Italian coffee",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 2.1.4 Create Category (Private)
**POST** `/api/v1/menu/categories/`

**Request Body:**
```json
{
  "name": "Tea",
  "description": "Various types of tea",
  "is_active": true
}
```

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "msg": "Category created successfully",
  "data": {
    "id": 2,
    "name": "Tea",
    "description": "Various types of tea",
    "slug": "tea",
    "is_active": true,
    "products_count": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### 2.1.5 Update Category (Private)
**PUT/PATCH** `/api/v1/menu/categories/{id}/`

**Request Body:**
```json
{
  "name": "Tea & Infusions",
  "description": "Tea and herbal infusions"
}
```

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Category updated successfully",
  "data": {
    "id": 2,
    "name": "Tea & Infusions",
    "description": "Tea and herbal infusions",
    "slug": "tea-infusions",
    "is_active": true,
    "products_count": 0
  }
}
```

---

#### 2.1.6 Delete Category (Private)
**DELETE** `/api/v1/menu/categories/{id}/`

**Response (204):**
```json
{
  "status": "success",
  "code": 204,
  "msg": "Category deleted successfully"
}
```

---

### 2.2 Products

#### 2.2.1 List Products (Public)
**GET** `/api/v1/menu/products/`

**Query Parameters:**
- `page`, `page_size`, `search`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Products retrieved successfully",
  "data": {
    "count": 100,
    "next": "http://localhost:8000/api/v1/menu/products/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "category": 1,
        "category_name": "Coffee",
        "name": "Espresso",
        "description": "Strong Italian coffee",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 2.2.2 Get Product Detail (Public)
**GET** `/api/v1/menu/products/{id}/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Product retrieved successfully",
  "data": {
    "id": 1,
    "category": 1,
    "category_name": "Coffee",
    "name": "Espresso",
    "description": "Strong Italian coffee",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "variants_count": 3,
    "variants": [
      {
        "id": 1,
        "product": 1,
        "product_name": "Espresso",
        "size": "S",
        "size_display": "Small",
        "price": "25000.00",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "product": 1,
        "product_name": "Espresso",
        "size": "M",
        "size_display": "Medium",
        "price": "30000.00",
        "is_active": true
      },
      {
        "id": 3,
        "product": 1,
        "product_name": "Espresso",
        "size": "L",
        "size_display": "Large",
        "price": "35000.00",
        "is_active": true
      }
    ]
  }
}
```

---

#### 2.2.3 Get Product Variants (Public)
**GET** `/api/v1/menu/products/{id}/variants/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Variants retrieved successfully",
  "data": [
    {
      "id": 1,
      "product": 1,
      "product_name": "Espresso",
      "size": "S",
      "size_display": "Small",
      "price": "25000.00",
      "is_active": true
    }
  ]
}
```

---

#### 2.2.4 Get Products by Category (Public)
**GET** `/api/v1/menu/products/by-category/?category_id=1`

**Query Parameters:**
- `category_id` (required): ID của category

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "category": 1,
      "category_name": "Coffee",
      "name": "Espresso",
      "description": "Strong Italian coffee",
      "is_active": true
    }
  ]
}
```

---

#### 2.2.5 Create Product (Private)
**POST** `/api/v1/menu/products/`

**Request Body:**
```json
{
  "category": 1,
  "name": "Cappuccino",
  "description": "Espresso with steamed milk",
  "is_active": true
}
```

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "msg": "Product created successfully",
  "data": {
    "id": 5,
    "category": 1,
    "category_name": "Coffee",
    "name": "Cappuccino",
    "description": "Espresso with steamed milk",
    "is_active": true,
    "variants_count": 0,
    "variants": []
  }
}
```

---

#### 2.2.6 Update Product (Private)
**PUT/PATCH** `/api/v1/menu/products/{id}/`

**Request Body:**
```json
{
  "name": "Premium Cappuccino",
  "description": "Premium espresso with steamed milk and foam"
}
```

---

#### 2.2.7 Delete Product (Private)
**DELETE** `/api/v1/menu/products/{id}/`

---

### 2.3 Product Variants

#### 2.3.1 List Variants (Public)
**GET** `/api/v1/menu/variants/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Variants retrieved successfully",
  "data": {
    "count": 50,
    "results": [
      {
        "id": 1,
        "product": 1,
        "product_name": "Espresso",
        "size": "S",
        "size_display": "Small",
        "price": "25000.00",
        "is_active": true
      }
    ]
  }
}
```

---

#### 2.3.2 Get Variants by Product (Public)
**GET** `/api/v1/menu/variants/by-product/?product_id=1`

**Query Parameters:**
- `product_id` (required)

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Variants retrieved successfully",
  "data": [
    {
      "id": 1,
      "product": 1,
      "product_name": "Espresso",
      "size": "S",
      "size_display": "Small",
      "price": "25000.00",
      "is_active": true
    }
  ]
}
```

---

#### 2.3.3 Create Variant (Private)
**POST** `/api/v1/menu/variants/`

**Request Body:**
```json
{
  "product": 1,
  "size": "S",
  "price": "25000.00",
  "is_active": true
}
```
- size choices: S (Small), M (Medium), L (Large)

---

#### 2.3.4 Update/Delete Variant (Private)
**PUT/PATCH/DELETE** `/api/v1/menu/variants/{id}/`

---

### 2.4 Toppings

#### 2.4.1 List Toppings (Public)
**GET** `/api/v1/menu/toppings/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Toppings retrieved successfully",
  "data": {
    "count": 20,
    "results": [
      {
        "id": 1,
        "name": "Extra Shot",
        "price": "10000.00",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "name": "Whipped Cream",
        "price": "5000.00",
        "is_active": true
      }
    ]
  }
}
```

---

#### 2.4.2 Search Toppings (Public)
**GET** `/api/v1/menu/toppings/search/?q=cream`

**Query Parameters:**
- `q` (required): Search query

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Toppings found successfully",
  "data": [
    {
      "id": 2,
      "name": "Whipped Cream",
      "price": "5000.00",
      "is_active": true
    }
  ]
}
```

---

#### 2.4.3 Create/Update/Delete Topping (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/menu/toppings/` hoặc `/api/v1/menu/toppings/{id}/`

**Request Body (Create/Update):**
```json
{
  "name": "Caramel Syrup",
  "price": "8000.00",
  "is_active": true
}
```

---

## 3. TABLES API

### 3.1 List Tables (Private)
**GET** `/api/v1/tables/`

**Query Parameters:**
- `page`, `page_size`, `search`
- `status`: Filter by status (available, occupied, reserved)

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Tables retrieved successfully",
  "data": {
    "count": 30,
    "results": [
      {
        "id": 1,
        "table_number": "T01",
        "capacity": 4,
        "status": "available",
        "status_display": "Available",
        "location": "Main Floor",
        "qr_code": "https://example.com/qr/T01",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 3.2 Get Table Detail (Private)
**GET** `/api/v1/tables/{id}/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Table retrieved successfully",
  "data": {
    "id": 1,
    "table_number": "T01",
    "capacity": 4,
    "status": "available",
    "status_display": "Available",
    "location": "Main Floor",
    "qr_code": "https://example.com/qr/T01",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 3.3 Get Available Tables (Private)
**GET** `/api/v1/tables/available/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Available tables retrieved successfully",
  "data": [
    {
      "id": 1,
      "table_number": "T01",
      "capacity": 4,
      "status": "available"
    }
  ]
}
```

---

### 3.4 Get Occupied Tables (Private)
**GET** `/api/v1/tables/occupied/`

---

### 3.5 Get Reserved Tables (Private)
**GET** `/api/v1/tables/reserved/`

---

### 3.6 Update Table Status (Private)
**PATCH** `/api/v1/tables/{id}/update-status/`

**Request Body:**
```json
{
  "status": "occupied"
}
```
- status choices: available, occupied, reserved

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Table status updated successfully",
  "data": {
    "id": 1,
    "table_number": "T01",
    "status": "occupied",
    "status_display": "Occupied"
  }
}
```

---

### 3.7 Get Table Orders (Private)
**GET** `/api/v1/tables/{id}/orders/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Table orders retrieved successfully",
  "data": [
    {
      "id": 1,
      "table": 1,
      "table_number": "T01",
      "status": "pending",
      "pay_code": "ABC123XY",
      "total_amount": "150000.00"
    }
  ]
}
```

---

### 3.8 Create/Update/Delete Table (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/tables/` hoặc `/api/v1/tables/{id}/`

**Request Body (Create/Update):**
```json
{
  "table_number": "T05",
  "capacity": 6,
  "status": "available",
  "location": "VIP Area",
  "qr_code": "https://example.com/qr/T05"
}
```

---

## 4. ORDERS API

### 4.1 List Orders (Public)
**GET** `/api/v1/orders/`

**Query Parameters:**
- `page`, `page_size`, `search`
- `status`: Filter by status (pending, confirmed, served, completed, cancelled)

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Orders retrieved successfully",
  "data": {
    "count": 100,
    "results": [
      {
        "id": 1,
        "table": 1,
        "table_number": "T01",
        "user": 1,
        "user_name": "John Doe",
        "status": "pending",
        "status_display": "Pending",
        "pay_code": "ABC123XY",
        "total_amount": "150000.00",
        "items_count": 3,
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 4.2 Get Order Detail (Public)
**GET** `/api/v1/orders/{id}/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Order retrieved successfully",
  "data": {
    "id": 1,
    "table": 1,
    "table_details": {
      "id": 1,
      "table_number": "T01",
      "capacity": 4,
      "status": "occupied"
    },
    "table_number": "T01",
    "user": 1,
    "user_name": "John Doe",
    "status": "pending",
    "status_display": "Pending",
    "pay_code": "ABC123XY",
    "notes": "",
    "total_amount": "150000.00",
    "items_count": 2,
    "items": [
      {
        "id": 1,
        "order": 1,
        "variant": 1,
        "variant_details": {
          "id": 1,
          "product": 1,
          "product_name": "Espresso",
          "size": "M",
          "size_display": "Medium",
          "price": "30000.00"
        },
        "product_name": "Espresso",
        "size": "Medium",
        "quantity": 2,
        "price": "30000.00",
        "notes": "",
        "toppings": [
          {
            "id": 1,
            "order_item": 1,
            "topping": 1,
            "topping_name": "Extra Shot",
            "topping_details": {
              "id": 1,
              "name": "Extra Shot",
              "price": "10000.00"
            },
            "quantity": 1,
            "price": "10000.00"
          }
        ],
        "total_price": "70000.00"
      },
      {
        "id": 2,
        "order": 1,
        "variant": 5,
        "variant_details": {
          "id": 5,
          "product": 2,
          "product_name": "Cappuccino",
          "size": "L",
          "size_display": "Large",
          "price": "40000.00"
        },
        "product_name": "Cappuccino",
        "size": "Large",
        "quantity": 2,
        "price": "40000.00",
        "notes": "Extra hot",
        "toppings": [],
        "total_price": "80000.00"
      }
    ],
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "confirmed_at": null,
    "served_at": null,
    "completed_at": null
  }
}
```

---

### 4.3 Create Order (Public)
**POST** `/api/v1/orders/`

**Request Body:**
```json
{
  "table": 1,
  "items": [
    {
      "variant": 1,
      "quantity": 2,
      "notes": ""
    },
    {
      "variant": 5,
      "quantity": 1,
      "notes": "Extra hot"
    }
  ],
  "notes": "Please serve quickly"
}
```

**Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "msg": "Order created successfully",
  "data": {
    "id": 10,
    "table": 1,
    "status": "pending",
    "pay_code": "XYZ789AB",
    "total_amount": "150000.00",
    "items": [...],
    "items_count": 2
  }
}
```

---

### 4.4 Get Pending Orders (Public)
**GET** `/api/v1/orders/pending/`

---

### 4.5 Get Confirmed Orders (Public)
**GET** `/api/v1/orders/confirmed/`

---

### 4.6 Get Served Orders (Public)
**GET** `/api/v1/orders/served/`

---

### 4.7 Get Active Orders (Public)
**GET** `/api/v1/orders/active/`

---

### 4.8 Get Orders by Table (Public)
**GET** `/api/v1/orders/by-table/?table_id=1`

**Query Parameters:**
- `table_id` (required)

---

### 4.9 Get Orders by User (Public)
**GET** `/api/v1/orders/by-user/`

---

### 4.10 Get Order by Pay Code (Public)
**GET** `/api/v1/orders/by-paycode/?pay_code=ABC123XY`

**Query Parameters:**
- `pay_code` (required)

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Order retrieved successfully",
  "data": {
    "id": 1,
    "pay_code": "ABC123XY",
    "table_number": "T01",
    "status": "pending",
    "total_amount": "150000.00",
    "items": [...]
  }
}
```

---

### 4.11 Update Order Status (Public)
**PATCH** `/api/v1/orders/{id}/update-status/`

**Request Body:**
```json
{
  "status": "confirmed"
}
```
- status choices: pending, confirmed, served, completed, cancelled

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Order status updated successfully",
  "data": {
    "id": 1,
    "status": "confirmed",
    "status_display": "Confirmed",
    "confirmed_at": "2024-01-01T10:05:00Z"
  }
}
```

---

### 4.12 Confirm Order (Public)
**POST** `/api/v1/orders/{id}/confirm/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Order confirmed successfully",
  "data": {
    "id": 1,
    "status": "confirmed",
    "confirmed_at": "2024-01-01T10:05:00Z"
  }
}
```

---

### 4.13 Serve Order (Public)
**POST** `/api/v1/orders/{id}/serve/`

---

### 4.14 Complete Order (Public)
**POST** `/api/v1/orders/{id}/complete/`

---

### 4.15 Cancel Order (Public)
**POST** `/api/v1/orders/{id}/cancel/`

---

### 4.16 Get Order Summary (Public)
**POST** `/api/v1/orders/{id}/summary/`

---

### 4.17 Update/Delete Order (Public)
**PUT/PATCH/DELETE** `/api/v1/orders/{id}/`

---

## 5. ORDER ITEMS API

### 5.1 List Order Items (Private)
**GET** `/api/v1/orders/items/`

---

### 5.2 Get Order Items by Order (Private)
**GET** `/api/v1/orders/items/by-order/?order_id=1`

**Query Parameters:**
- `order_id` (required)

---

### 5.3 Create Order Item (Private)
**POST** `/api/v1/orders/items/`

**Request Body:**
```json
{
  "order": 1,
  "variant": 1,
  "quantity": 2,
  "notes": "Extra hot"
}
```

---

### 5.4 Update/Delete Order Item (Private)
**PUT/PATCH/DELETE** `/api/v1/orders/items/{id}/`

---

## 6. ORDER ITEM TOPPINGS API

### 6.1 List Order Item Toppings (Private)
**GET** `/api/v1/orders/toppings/`

---

### 6.2 Get Toppings by Order Item (Private)
**GET** `/api/v1/orders/toppings/by-item/?order_item_id=1`

**Query Parameters:**
- `order_item_id` (required)

---

### 6.3 Create Order Item Topping (Private)
**POST** `/api/v1/orders/toppings/`

**Request Body:**
```json
{
  "order_item": 1,
  "topping": 1,
  "quantity": 1
}
```

---

### 6.4 Update/Delete Order Item Topping (Private)
**PUT/PATCH/DELETE** `/api/v1/orders/toppings/{id}/`

---

## 7. PAYMENTS API

### 7.1 Bank Accounts

#### 7.1.1 List Bank Accounts (Private)
**GET** `/api/v1/payments/bank-accounts/`

**Query Parameters:**
- `is_active`: true/false
- `is_default`: true/false

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Bank accounts retrieved successfully",
  "data": [
    {
      "id": 1,
      "account_number": "0796791500",
      "account_name": "TRAN NGOC PHUC HUY",
      "bank_code": "MB",
      "bank_name": "MBBank",
      "qr_template": "compact2",
      "is_default": true,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 7.1.2 Get Default Bank Account (Private)
**GET** `/api/v1/payments/bank-accounts/default_account/`

**Response (200):**
```json
{
  "id": 1,
  "account_number": "0796791500",
  "account_name": "TRAN NGOC PHUC HUY",
  "bank_code": "MB",
  "bank_name": "MBBank",
  "qr_template": "compact2",
  "is_default": true,
  "is_active": true
}
```

---

#### 7.1.3 Set Bank Account as Default (Private)
**POST** `/api/v1/payments/bank-accounts/{id}/set_as_default/`

**Response (200):**
```json
{
  "status": "success",
  "message": "Account 0796791500 set as default",
  "data": {
    "id": 1,
    "is_default": true
  }
}
```

---

#### 7.1.4 Toggle Bank Account Active Status (Private)
**POST** `/api/v1/payments/bank-accounts/{id}/toggle_active/`

**Response (200):**
```json
{
  "status": "success",
  "message": "Account activated",
  "data": {
    "id": 1,
    "is_active": true
  }
}
```

---

#### 7.1.5 Create/Update/Delete Bank Account (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/payments/bank-accounts/` hoặc `/api/v1/payments/bank-accounts/{id}/`

**Request Body (Create/Update):**
```json
{
  "account_number": "0123456789",
  "account_name": "NGUYEN VAN A",
  "bank_code": "VCB",
  "bank_name": "Vietcombank",
  "qr_template": "compact2",
  "is_default": false,
  "is_active": true
}
```

---

### 7.2 Payments

#### 7.2.1 List Payments (Private)
**GET** `/api/v1/payments/`

**Query Parameters:**
- `order_id`: Filter by order
- `status`: Filter by payment status (pending, completed, failed, cancelled)
- `pay_code`: Filter by pay code

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "order": 1,
      "payment_method": "bank_transfer",
      "amount": "150000.00",
      "payment_status": "pending",
      "qr_code_url": "https://img.vietqr.io/image/mbbank-0796791500-compact2.jpg?amount=150000&addInfo=DH%20ABC123XY&accountName=TRAN%20NGOC%20PHUC%20HUY",
      "bank_account_number": "0796791500",
      "bank_account_name": "TRAN NGOC PHUC HUY",
      "bank_name": "MB",
      "transfer_content": "DH ABC123XY",
      "transaction_id": null,
      "gateway_transaction_id": null,
      "paid_at": null,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

#### 7.2.2 Get Payment Detail (Private)
**GET** `/api/v1/payments/{id}/`

---

#### 7.2.3 Create Payment with QR Code (Public)
**POST** `/api/v1/payments/create_with_qr/`

**Request Body:**
```json
{
  "order_id": 1,
  "payment_method": "bank_transfer",
  "bank_account_id": 1
}
```
- `bank_account_id` (optional): Nếu không có, sẽ dùng default account
- `payment_method`: bank_transfer, cash, card

**Response (201):**
```json
{
  "id": 1,
  "order": 1,
  "payment_method": "bank_transfer",
  "amount": "150000.00",
  "payment_status": "pending",
  "qr_code_url": "https://img.vietqr.io/image/mbbank-0796791500-compact2.jpg?amount=150000&addInfo=DH%20ABC123XY&accountName=TRAN%20NGOC%20PHUC%20HUY",
  "qr_data": "https://img.vietqr.io/image/mbbank-0796791500-compact2.jpg?amount=150000&addInfo=DH%20ABC123XY&accountName=TRAN%20NGOC%20PHUC%20HUY",
  "bank_account_number": "0796791500",
  "bank_account_name": "TRAN NGOC PHUC HUY",
  "bank_name": "MB",
  "transfer_content": "DH ABC123XY",
  "qr_info": {
    "account_no": "0796791500",
    "account_name": "TRAN NGOC PHUC HUY",
    "bank_code": "MB",
    "bank_name": "mbbank",
    "amount": 150000.0,
    "description": "DH ABC123XY"
  },
  "created_at": "2024-01-01T10:00:00Z"
}
```

---

#### 7.2.4 Get Payment by Pay Code (Public)
**GET** `/api/v1/payments/by_pay_code/?pay_code=ABC123XY`

**Query Parameters:**
- `pay_code` (required)

**Response (200):**
```json
{
  "id": 1,
  "order": 1,
  "payment_method": "bank_transfer",
  "amount": "150000.00",
  "payment_status": "completed",
  "qr_code_url": "https://img.vietqr.io/image/...",
  "bank_account_number": "0796791500",
  "bank_account_name": "TRAN NGOC PHUC HUY",
  "bank_name": "MB",
  "transfer_content": "DH ABC123XY",
  "transaction_id": "TXN123456",
  "gateway_transaction_id": "FT789012",
  "paid_at": "2024-01-01T10:05:00Z"
}
```

---

#### 7.2.5 Sepay Webhook (Public)
**POST** `/api/v1/payments/webhook/sepay/`

**Request Body (From Sepay):**
```json
{
  "id": "transaction_id",
  "gateway": "MB",
  "transaction_date": "2024-01-01 12:00:00",
  "account_number": "0796791500",
  "sub_account": "",
  "amount_in": 150000,
  "amount_out": 0,
  "accumulated": 1000000,
  "code": "REF123",
  "transaction_content": "DH ABC123XY",
  "reference_number": "FT123456",
  "body": "Full transaction description"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "payment_id": 1,
  "order_id": 1,
  "pay_code": "ABC123XY"
}
```

---

#### 7.2.5 Create/Update/Delete Payment (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/payments/` hoặc `/api/v1/payments/{id}/`

---

## 8. INVENTORY API

### 8.1 Ingredients

#### 8.1.1 List Ingredients (Private)
**GET** `/api/v1/inventory/ingredients/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Ingredients retrieved successfully",
  "data": {
    "count": 50,
    "results": [
      {
        "id": 1,
        "name": "Coffee Beans",
        "unit": "kg",
        "number_of": 50.5,
        "min_quantity": 10.0,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 8.1.2 Get Low Stock Ingredients (Private)
**GET** `/api/v1/inventory/ingredients/low-stock/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Low stock ingredients retrieved successfully",
  "data": [
    {
      "id": 5,
      "name": "Milk",
      "unit": "liter",
      "number_of": 8.0,
      "min_quantity": 10.0
    }
  ]
}
```

---

#### 8.1.3 Get Out of Stock Ingredients (Private)
**GET** `/api/v1/inventory/ingredients/out-of-stock/`

---

#### 8.1.4 Search Ingredients (Private)
**GET** `/api/v1/inventory/ingredients/search/?q=coffee`

**Query Parameters:**
- `q` (required): Search query

---

#### 8.1.5 Adjust Ingredient Stock (Private)
**POST** `/api/v1/inventory/ingredients/{id}/adjust-stock/`

**Request Body:**
```json
{
  "adjustment": 10.5,
  "reason": "Restocking from supplier"
}
```
- `adjustment`: Số lượng thay đổi (+ hoặc -)
- `reason`: Lý do điều chỉnh

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Stock adjusted by 10.5. Reason: Restocking from supplier",
  "data": {
    "id": 1,
    "name": "Coffee Beans",
    "unit": "kg",
    "number_of": 61.0,
    "min_quantity": 10.0
  }
}
```

---

#### 8.1.6 Create/Update/Delete Ingredient (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/inventory/ingredients/` hoặc `/api/v1/inventory/ingredients/{id}/`

**Request Body (Create/Update):**
```json
{
  "name": "Sugar",
  "unit": "kg",
  "number_of": 100.0,
  "min_quantity": 20.0
}
```

---

### 8.2 Variant Recipes

#### 8.2.1 List Variant Recipes (Private)
**GET** `/api/v1/inventory/variant-recipes/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Variant recipes retrieved successfully",
  "data": {
    "count": 30,
    "results": [
      {
        "id": 1,
        "variant": 1,
        "variant_name": "Espresso - Medium",
        "ingredient": 1,
        "ingredient_name": "Coffee Beans",
        "quantity": 0.02,
        "unit": "kg",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

#### 8.2.2 Get Recipes by Variant (Private)
**GET** `/api/v1/inventory/variant-recipes/by-variant/?variant_id=1`

**Query Parameters:**
- `variant_id` (required)

---

#### 8.2.3 Get Recipes by Ingredient (Private)
**GET** `/api/v1/inventory/variant-recipes/by-ingredient/?ingredient_id=1`

**Query Parameters:**
- `ingredient_id` (required)

---

#### 8.2.4 Create/Update/Delete Variant Recipe (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/inventory/variant-recipes/` hoặc `/api/v1/inventory/variant-recipes/{id}/`

**Request Body (Create/Update):**
```json
{
  "variant": 1,
  "ingredient": 1,
  "quantity": 0.02,
  "unit": "kg"
}
```

---

### 8.3 Topping Recipes

#### 8.3.1 List Topping Recipes (Private)
**GET** `/api/v1/inventory/topping-recipes/`

---

#### 8.3.2 Get Recipes by Topping (Private)
**GET** `/api/v1/inventory/topping-recipes/by-topping/?topping_id=1`

**Query Parameters:**
- `topping_id` (required)

---

#### 8.3.3 Get Recipes by Ingredient (Private)
**GET** `/api/v1/inventory/topping-recipes/by-ingredient/?ingredient_id=1`

**Query Parameters:**
- `ingredient_id` (required)

---

#### 8.3.4 Create/Update/Delete Topping Recipe (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/inventory/topping-recipes/` hoặc `/api/v1/inventory/topping-recipes/{id}/`

**Request Body (Create/Update):**
```json
{
  "topping": 1,
  "ingredient": 5,
  "quantity": 0.01,
  "unit": "liter"
}
```

---

## 9. STAFF API

### 9.1 Roles

#### 9.1.1 List Roles (Private)
**GET** `/api/v1/staff/roles/`

**Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "msg": "Roles retrieved successfully",
  "data": {
    "count": 5,
    "results": [
      {
        "id": 1,
        "name_vi": "Quản lý",
        "name_en": "Manager",
        "slug": "manager",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "name_vi": "Nhân viên phục vụ",
        "name_en": "Waiter",
        "slug": "waiter"
      }
    ]
  }
}
```

---

#### 9.1.2 Get Role Detail (Private)
**GET** `/api/v1/staff/roles/{id}/`

---

#### 9.1.3 Create/Update/Delete Role (Private)
**POST/PUT/PATCH/DELETE** `/api/v1/staff/roles/` hoặc `/api/v1/staff/roles/{id}/`

**Request Body (Create/Update):**
```json
{
  "name_vi": "Pha chế",
  "name_en": "Barista",
  "slug": "barista"
}
```

---

## 10. HEALTH CHECK API

### 10.1 Health Check (Public)
**GET** `/health/`

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

## Common Response Format

### Success Response
```json
{
  "status": "success",
  "code": 200,
  "msg": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "code": 400,
  "msg": "Error message",
  "errors": {
    "field_name": ["Error detail"]
  }
}
```

---

## Pagination

Tất cả list endpoints đều hỗ trợ pagination:

**Query Parameters:**
- `page`: Số trang (default: 1)
- `page_size`: Số items/trang (default: 10)

**Response Format:**
```json
{
  "status": "success",
  "code": 200,
  "msg": "...",
  "data": {
    "count": 100,
    "next": "http://localhost:8000/api/v1/.../?page=2",
    "previous": null,
    "results": [...]
  }
}
```

---

## Search & Filter

Các endpoints hỗ trợ search thông qua query parameter `search`:
- Categories: name, description
- Products: name, description
- Tables: table_number, location
- Orders: table__table_number, notes
- Ingredients: name

**Example:**
```
GET /api/v1/menu/products/?search=coffee
```

---

## Bank Codes Supported

VietQR hỗ trợ các ngân hàng sau:

| Code | Bank Name    | BIN Code |
|------|--------------|----------|
| MB   | MBBank       | 970422   |
| VCB  | Vietcombank  | 970436   |
| TCB  | Techcombank  | 970407   |
| ACB  | ACB          | 970416   |
| VTB  | VietinBank   | 970415   |
| BIDV | BIDV         | 970418   |
| VPB  | VPBank       | 970432   |
| TPB  | TPBank       | 970423   |
| STB  | Sacombank    | 970403   |
| SHB  | SHB          | 970443   |
| MSB  | MSB          | 970426   |
| OCB  | OCB          | 970448   |

---

## Order Status Flow

```
pending → confirmed → served → completed
   ↓
cancelled
```

**Status Choices:**
- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận
- `served`: Đã phục vụ
- `completed`: Hoàn thành
- `cancelled`: Đã hủy

---

## Table Status

**Status Choices:**
- `available`: Trống
- `occupied`: Có khách
- `reserved`: Đã đặt

---

## Payment Status

**Status Choices:**
- `pending`: Chờ thanh toán
- `completed`: Đã thanh toán
- `failed`: Thất bại
- `cancelled`: Đã hủy

---

## Payment Methods

**Method Choices:**
- `bank_transfer`: Chuyển khoản ngân hàng
- `cash`: Tiền mặt
- `card`: Thẻ

---

## Product Variant Sizes

**Size Choices:**
- `S`: Small
- `M`: Medium
- `L`: Large

---

## Notes

1. **Authentication**: Sử dụng JWT tokens
   - Access token: Expire sau 15 phút (900 seconds)
   - Refresh token: Expire sau 7 ngày

2. **Public vs Private**:
   - **Public**: Không cần token (customers có thể truy cập qua QR code)
   - **Private**: Yêu cầu Bearer token (staff/admin)

3. **Order Flow**:
   - Customer scan QR code tại bàn
   - Tạo order (public)
   - Xem menu và thêm items (public)
   - Tạo payment với QR code (public)
   - Chuyển khoản theo QR code
   - Sepay webhook tự động update payment status
   - Staff quản lý orders (private)

4. **CORS**: Cần configure CORS settings để frontend có thể gọi API

5. **Rate Limiting**: Login endpoint có rate limiting để tránh brute force

6. **Webhook Security**: 
   - Sepay webhook có thể verify signature (optional)
   - Configure `SEPAY_VERIFY_SIGNATURE` và `SEPAY_WEBHOOK_SECRET` trong settings

---

## API Endpoints Summary

### Public Endpoints (Không cần token):
- User: register, login, refresh
- Menu: list/detail categories, products, variants, toppings
- Orders: tất cả operations (để customers đặt hàng qua QR)
- Payments: create_with_qr, by_pay_code
- Webhook: sepay webhook

### Private Endpoints (Cần token):
- User: logout, profile, update profile, change password
- Menu: create/update/delete categories, products, variants, toppings
- Tables: tất cả operations
- Order Items: tất cả operations
- Order Item Toppings: tất cả operations
- Payments: list, detail, bank accounts management
- Inventory: tất cả operations
- Staff: tất cả operations

---

## Example Usage Flow

### 1. Customer Workflow (Public - Không cần đăng nhập):

```bash
# 1. Scan QR code tại bàn → Mở app/web

# 2. Xem menu
GET /api/v1/menu/categories/
GET /api/v1/menu/products/by-category/?category_id=1
GET /api/v1/menu/products/1/

# 3. Tạo order
POST /api/v1/orders/
{
  "table": 1,
  "items": [
    {"variant": 1, "quantity": 2},
    {"variant": 5, "quantity": 1}
  ]
}

# 4. Tạo payment với QR code
POST /api/v1/payments/create_with_qr/
{
  "order_id": 1,
  "payment_method": "bank_transfer"
}

# 5. Hiển thị QR code cho customer chuyển khoản

# 6. Kiểm tra trạng thái thanh toán
GET /api/v1/payments/by_pay_code/?pay_code=ABC123XY
```

### 2. Staff Workflow (Private - Cần đăng nhập):

```bash
# 1. Login
POST /api/v1/users/login/
{
  "identifier": "staff@example.com",
  "password": "password123"
}

# 2. Xem pending orders
GET /api/v1/orders/?status=pending
Authorization: Bearer <token>

# 3. Xem order detail
GET /api/v1/orders/1/
Authorization: Bearer <token>

# 4. Update order status (confirm)
PATCH /api/v1/orders/1/update-status/
Authorization: Bearer <token>
{
  "status": "confirmed"
}

# 5. Update order status (served)
PATCH /api/v1/orders/1/update-status/
Authorization: Bearer <token>
{
  "status": "served"
}

# 6. Quản lý inventory
GET /api/v1/inventory/ingredients/low-stock/
Authorization: Bearer <token>

POST /api/v1/inventory/ingredients/1/adjust-stock/
Authorization: Bearer <token>
{
  "adjustment": 50,
  "reason": "Restocking"
}
```

---

## Changelog & Optimization Notes

### Các Endpoints Đã Loại Bỏ (Tối ưu hóa):

**Lý do loại bỏ**: Trùng lặp hoặc có thể thay thế bằng endpoints khác với query parameters

#### Menu API:
- ❌ `GET /api/v1/menu/categories/{id}/products/` → Thay bằng: `GET /api/v1/menu/products/by-category/?category_id={id}`
- ❌ `GET /api/v1/menu/products/{id}/variants/` → Thay bằng: `GET /api/v1/menu/variants/by-product/?product_id={id}` hoặc đã có trong Product Detail

#### Orders API:
- ❌ `GET /api/v1/orders/pending/` → Thay bằng: `GET /api/v1/orders/?status=pending`
- ❌ `GET /api/v1/orders/confirmed/` → Thay bằng: `GET /api/v1/orders/?status=confirmed`
- ❌ `GET /api/v1/orders/served/` → Thay bằng: `GET /api/v1/orders/?status=served`
- ❌ `POST /api/v1/orders/{id}/confirm/` → Thay bằng: `PATCH /api/v1/orders/{id}/update-status/` với body `{"status": "confirmed"}`
- ❌ `POST /api/v1/orders/{id}/serve/` → Thay bằng: `PATCH /api/v1/orders/{id}/update-status/` với body `{"status": "served"}`
- ❌ `POST /api/v1/orders/{id}/complete/` → Thay bằng: `PATCH /api/v1/orders/{id}/update-status/` với body `{"status": "completed"}`
- ❌ `POST /api/v1/orders/{id}/cancel/` → Thay bằng: `PATCH /api/v1/orders/{id}/update-status/` với body `{"status": "cancelled"}`
- ❌ `POST /api/v1/orders/{id}/summary/` → Thay bằng: `GET /api/v1/orders/{id}/` (đã có đầy đủ thông tin)

#### Tables API:
- ❌ `GET /api/v1/tables/occupied/` → Thay bằng: `GET /api/v1/tables/?status=occupied`
- ❌ `GET /api/v1/tables/reserved/` → Thay bằng: `GET /api/v1/tables/?status=reserved`

#### Payments API:
- ❌ `GET /api/v1/payments/{id}/` → Thay bằng: `GET /api/v1/payments/by_pay_code/?pay_code={code}` (thường dùng hơn)

**Tổng kết**: Giảm từ ~70 endpoints xuống ~55 endpoints (giảm ~21%)

**Lợi ích**:
- ✅ Giảm code duplication
- ✅ Dễ bảo trì hơn
- ✅ Documentation ngắn gọn hơn
- ✅ Consistent API design pattern
- ✅ Dễ test hơn

---

Tài liệu này được tạo dựa trên cấu trúc code hiện tại của DineOps Backend.
Cập nhật lần cuối: 2026-01-25

