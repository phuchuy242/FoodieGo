# MÔ TẢ CÁC CHỨC NĂNG HIỆN TẠI — FOODIEGO

Tài liệu này tổng hợp toàn bộ các chức năng hiện tại của hệ thống FoodieGo (Level 1 + Level 2) và phân loại chi tiết theo từng đối tượng người dùng (Actors).

---

## I. CÁC ĐỐI TƯỢNG SỬ DỤNG (ACTORS)

Hệ thống phân định rõ 5 đối tượng người dùng với quyền hạn tăng dần:
1. **Khách vãng lai (Guest):** Người dùng chưa đăng nhập, chỉ có quyền xem thông tin cơ bản.
2. **Khách hàng (Customer):** Người dùng đã đăng ký tài khoản, thực hiện các hành động đặt món, thanh toán và đánh giá.
3. **Nhân viên giao hàng (Delivery Staff / Shipper):** Người phụ trách nhận đơn và đi giao hàng, cập nhật trạng thái đơn.
4. **Quản lý cửa hàng (Restaurant Manager):** Người quản lý thực đơn (món ăn, danh mục), xử lý đơn hàng và xem báo cáo doanh số.
5. **Quản trị viên hệ thống (Admin):** Người có quyền cao nhất, quản lý tài khoản người dùng, phân quyền và quản lý mã giảm giá (Voucher).

---

## II. MA TRẬN CHỨC NĂNG THEO ĐỐI TƯỢNG (ACTOR-FEATURE MATRIX)

| Mã | Tên chức năng con | Guest | Customer | Shipper | Manager | Admin |
|----|--------------------|:---:|:---:|:---:|:---:|:---:|
| **F-01** | Đăng ký & Đăng nhập (JWT) | ✔ | ✔ | ✔ | ✔ | ✔ |
| **F-02** | Xem & Lọc Menu theo danh mục | ✔ | ✔ | ✔ | ✔ | ✔ |
| **F-03** | Tìm kiếm món ăn (Debounce) | ✔ | ✔ | ✔ | ✔ | ✔ |
| **F-04** | Xem chi tiết món ăn & Đánh giá | ✔ | ✔ | ✔ | ✔ | ✔ |
| **F-05** | Quản lý Giỏ hàng cá nhân | | ✔ | | | |
| **F-06** | Áp dụng Voucher giảm giá | | ✔ | | | |
| **F-07** | Đặt hàng & chọn Phương thức thanh toán | | ✔ | | | |
| **F-08** | Theo dõi trạng thái đơn hàng (Stepper) | | ✔ | | | |
| **F-09** | Viết đánh giá (Rating & Comment) | | ✔ | | | |
| **F-10** | Nhận thông báo in-app (Chuông) | | ✔ | ✔ | ✔ | ✔ |
| **F-11** | Nhận giao đơn (Claim Order) | | | ✔ | | |
| **F-12** | Cập nhật trạng thái giao đơn | | | ✔ | | |
| **F-13** | Quản lý danh mục món (Category CRUD) | | | | ✔ | ✔ |
| **F-14** | Quản lý món ăn (Food CRUD & Stock) | | | | ✔ | ✔ |
| **F-15** | Cập nhật trạng thái chuẩn bị đơn | | | | ✔ | ✔ |
| **F-16** | Xem biểu đồ doanh thu theo ngày | | | | ✔ | ✔ |
| **F-17** | Quản lý người dùng (Khóa/Mở khóa) | | | | | ✔ |
| **F-18** | Thay đổi vai trò người dùng (Gán Role) | | | | | ✔ |
| **F-19** | Quản lý mã giảm giá (Voucher CRUD) | | | | | ✔ |

---

## III. MÔ TẢ CHI TIẾT TỪNG CHỨC NĂNG

### 1. Dành cho Khách vãng lai (Guest)
* **Đăng ký & Đăng nhập:** Cho phép tạo tài khoản mới bằng Email độc nhất. Hệ thống cấp mã token JWT để thực hiện đăng nhập.
* **Xem Menu công khai:** Đọc danh sách món ăn từ database, lọc hiển thị nhanh theo các danh mục như Pizza, Burger, Đồ uống.
* **Tìm kiếm món:** Nhập từ khóa để lọc các món ăn đang hoạt động. Có tích hợp cơ chế hoãn gửi API request (debounce 300ms) để tối ưu hóa hiệu năng máy chủ.
* **Xem chi tiết món:** Xem thông tin giá, mô tả món ăn, điểm đánh giá trung bình từ các khách hàng trước.

### 2. Dành cho Khách hàng (Customer)
* **Quản lý giỏ hàng:** Thêm món ăn vào giỏ, tăng giảm số lượng trực tiếp trong giỏ hàng. Thông tin giỏ hàng được đồng bộ liên tục với database.
* **Áp dụng Voucher:** Nhập mã giảm giá khi thanh toán để được trừ tiền tự động. Hệ thống kiểm tra điều kiện áp dụng (hạn dùng, số lượt dùng còn lại, giá trị đơn tối thiểu).
* **Đặt hàng & Chọn thanh toán:** Tạo đơn hàng từ giỏ. Lựa chọn trả tiền mặt khi nhận hàng (COD) hoặc thanh toán online giả lập qua cổng thanh toán mock.
* **Theo dõi đơn hàng:** Xem lịch sử mua hàng và tiến độ xử lý đơn hàng thời gian thực qua giao diện thanh tiến trình (Stepper): *Đang chờ duyệt -> Đã xác nhận -> Đang chuẩn bị -> Đang giao -> Đã giao*.
* **Đánh giá món ăn:** Sau khi đơn hàng chuyển sang trạng thái "Đã giao thành công" (`delivered`), khách hàng được quyền chấm điểm xếp hạng sao (1-5★) và viết nhận xét cho từng món trong đơn.
* **Nhận thông báo:** Nhận tin nhắn trong app mỗi khi đơn hàng thay đổi trạng thái hoặc có voucher mới phát hành.

### 3. Dành cho Nhân viên giao hàng (Shipper)
* **Nhận đơn giao:** Shipper xem danh sách các đơn hàng đã chuẩn bị xong của cửa hàng và bấm nhận giao đơn (đơn hàng chuyển sang trạng thái `delivering` và gán ID của shipper này).
* **Cập nhật trạng thái:** Khi đi giao hàng, Shipper cập nhật trạng thái đơn thành "Đã giao thành công" (`delivered`) hoặc báo cáo giao thất bại/khách hủy đơn (`cancelled`).
* **Xem lịch sử giao hàng:** Xem thống kê các đơn hàng shipper đó đã hoàn thành.

### 4. Dành cho Quản lý cửa hàng (Restaurant Manager)
* **Quản lý danh mục & Món ăn:** Thêm, sửa, xóa danh mục món và món ăn. Cập nhật giá bán và điều chỉnh số lượng tồn kho của món ăn.
* **Xử lý đơn hàng:** Tiếp nhận đơn hàng mới đặt từ khách, nhấn xác nhận đơn (`confirmed`) và chuyển sang trạng thái chuẩn bị món (`preparing`).
* **Xem thống kê doanh thu:** Lọc doanh thu theo thời gian, xem biểu đồ doanh số bán ra theo ngày để kiểm soát hoạt động kinh doanh.

### 5. Dành cho Quản trị viên (Admin)
* **Quản lý tài khoản:** Xem danh sách toàn bộ người dùng, thực hiện khóa (vô hiệu hóa) tài khoản vi phạm hoặc mở khóa hoạt động.
* **Phân quyền người dùng:** Thay đổi vai trò người dùng (Ví dụ: Thăng cấp khách hàng thành nhân viên giao hàng hoặc quản lý cửa hàng).
* **Quản lý Voucher:** Tạo mã giảm giá mới, cấu hình hạn dùng và số lượt sử dụng tối đa của mã.
