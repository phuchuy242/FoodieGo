# FoodieGo - Hệ thống Đặt món ăn Điện tử (E-Menu) & Quản lý Nhà hàng

Dự án này bao gồm 2 phần chính:
- **Backend:** Xây dựng bằng Django REST Framework (DRF).
- **Frontend:** Bao gồm ứng dụng `admin` (Dành cho Quản lý) và `emenu` (Dành cho Khách hàng), được xây dựng bằng React/Node.js.

Do Frontend được cấu hình gọi API thông qua một public URL, hệ thống bắt buộc phải sử dụng **ngrok** để forward port của Backend. Dưới đây là hướng dẫn chi tiết cách chạy hệ thống.

---

## 🛠 Yêu cầu hệ thống (Prerequisites)
1. **Python 3.10+**
2. **Node.js (v16+)** & **npm** hoặc **yarn**
3. **Ngrok** (Cài đặt sẵn và đã đăng nhập tài khoản ngrok để không bị giới hạn session).

---

## 🚀 Hướng dẫn Khởi chạy (Dành cho Giảng viên kiểm tra)

Vui lòng mở **3 cửa sổ Terminal** độc lập để chạy đồng thời Backend, Ngrok, và Frontend.

### Bước 1: Khởi chạy Backend (Terminal 1)
Mở cửa sổ Terminal đầu tiên và đi vào thư mục `backend`:
```bash
cd backend

# 1. (Tùy chọn) Kích hoạt môi trường ảo (Virtual Environment)
# Windows:
env\Scripts\activate
# Mac/Linux:
source env/bin/activate

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Chạy server ở cổng 8000
python manage.py runserver 8000
```
*Lưu ý: Không tắt Terminal này.*

### Bước 2: Khởi chạy Ngrok (Terminal 2) - BẮT BUỘC
Frontend của dự án được cấu hình (hard-code base URL) gọi API qua domain của ngrok. Do đó, phải dùng ngrok để forward cổng 8000 của backend lên public URL.

Mở cửa sổ Terminal thứ 2:
```bash
# Chạy lệnh ngrok để forward port 8000 của backend
ngrok http 8000
```
> **Lưu ý Quan Trọng:** Ngrok sẽ cung cấp một URL dạng `https://<chuỗi-ngẫu-nhiên>.ngrok-free.app`. Bạn bắt buộc phải copy URL này và dán đè vào biến Base URL trong mã nguồn Frontend để ứng dụng có thể gọi đúng API. Cụ thể, hãy sửa URL tại các file sau:
> 
> 1. **Dự án E-Menu:**
>    - Mở file: `frontend/emenu/config.js`
>    - Sửa biến: `const defaultApiBase = "URL_NGROK_CỦA_BẠN";`
> 
> 2. **Dự án Admin:**
>    - Mở file: `frontend/admin/src/environment.jsx`
>    - Sửa biến: `export const API_BASE = "URL_NGROK_CỦA_BẠN";`
>    - *Chú ý:* Do một số API chưa được đưa vào biến môi trường, có thể bạn sẽ cần tìm kiếm (Ctrl+Shift+F) chuỗi `https://untaut-wickedly-amina.ngrok-free.dev` trong thư mục `frontend/admin/src` và thay thế toàn bộ (Replace All) bằng URL ngrok mới của bạn.

### Bước 3: Khởi chạy Frontend (Terminal 3)
Hệ thống Frontend chia làm 2 phân hệ. Bạn có thể chọn chạy 1 trong 2 hoặc chạy cả 2 (cần mở thêm Terminal).

**Chạy trang Admin (Quản trị viên):**
```bash
cd frontend/admin

# Cài đặt thư viện (Chỉ cần chạy lần đầu)
npm install

# Khởi chạy frontend
npm start 
# hoặc: npm run dev
```

**Chạy trang E-menu (Dành cho khách hàng xem thực đơn):**
```bash
cd frontend/emenu

# Cài đặt thư viện (Chỉ cần chạy lần đầu)
npm install

# Khởi chạy frontend
npm start 
# hoặc: npm run dev
```

---

## 📊 Hướng dẫn kiểm tra Độ phủ Code (Test Coverage)

Dự án đã được viết bộ Unit Test rất kỹ lưỡng để đảm bảo độ tin cậy của các API nghiệp vụ. Độ phủ (Coverage) đạt mức **> 80%**.

Để Giảng viên tự kiểm chứng, vui lòng vào thư mục `backend` và chạy các lệnh sau:

```bash
cd backend

# Chạy toàn bộ các test case kèm bộ đo lường coverage
coverage run --source='apps' manage.py test

# Xuất báo cáo tỷ lệ % bao phủ trên Terminal
coverage report -m
```
*Lưu ý: Bộ test sử dụng `.coveragerc` để tập trung đánh giá chất lượng của các khối code lõi (Core Models, Serializers, và một số Views chính).*

Để xem giao diện HTML trực quan màu sắc từng dòng code đã test:
```bash
coverage html
# Sau đó mở file backend/htmlcov/index.html bằng trình duyệt web.
```

---
*Cảm ơn Thầy/Cô đã dành thời gian kiểm tra đồ án!*
