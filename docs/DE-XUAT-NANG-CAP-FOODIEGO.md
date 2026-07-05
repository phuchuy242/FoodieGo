# ĐỀ XUẤT NÂNG CẤP HỆ THỐNG — FOODIEGO
### Dự án phát triển trong 4 tuần (4 Sprints) bởi Đội ngũ 6 thành viên

Để đáp ứng tối đa năng lực làm việc của một **đội ngũ 6 người** trong vòng **4 tuần**, đồng thời tối ưu hóa chiều sâu công nghệ và độ phong phú chức năng nhằm đạt điểm đánh giá tối đa (Điểm A+), hệ thống FoodieGo được nâng cấp mở rộng các chức năng thực tế dưới đây, đặc biệt tích hợp **AI Chatbot tư vấn món sử dụng RAG (Retrieval-Augmented Generation) & pgvector**.

---

## I. CƠ CẤU ĐỘI NGŨ PHÁT TRIỂN (6 THÀNH VIÊN)

Phân bổ vai trò chuyên biệt cho 6 thành viên để tối ưu hóa năng suất và kiểm soát chất lượng:
1. **Thành viên 1 — Team Lead & QA (Kiểm thử):** Đảm nhận vai trò quản lý tiến độ, thiết lập kịch bản kiểm thử, kiểm thử thủ công và viết kịch bản Load Test (k6).
2. **Thành viên 2 — Backend Dev 1 (BE Core):** Phụ trách cơ sở dữ liệu quan hệ, API nghiệp vụ cốt lõi (Auth, Food, Cart, Order, Vouchers).
3. **Thành viên 3 — Backend Dev 2 (BE Adv & AI Integration):** Phụ trách tích hợp **AI Chatbot (RAG + pgvector)**, WebSockets (Chat Khách-Shipper), Cache (Redis) và Tác vụ nền (Celery).
4. **Thành viên 4 — Frontend Dev 1 (FE Customer):** Thiết kế giao diện cho khách hàng (Menu, Giỏ hàng, Đặt hàng, Theo dõi đơn, Đánh giá, và Floating Chatbot Widget).
5. **Thành viên 5 — Frontend Dev 2 (FE Portals):** Thiết kế giao diện dành cho Admin/Manager và đặc biệt là **Phân hệ dành riêng cho Shipper**.
6. **Thành viên 6 — DevOps Engineer:** Thiết lập CI/CD (GitHub Actions), Docker hóa dự án (bao gồm cấu hình cơ sở dữ liệu Postgres có hỗ trợ extension `vector`), cài đặt SonarQube, Prometheus & Grafana.

---

## II. DANH SÁCH CÁC TÍNH NĂNG NÂNG CẤP ĐỀ XUẤT

Dưới đây là 7 đề xuất nâng cấp đáng giá, vừa sức và phù hợp cho đội ngũ 6 người trong 4 tuần:

### 1. AI Chatbot tư vấn món ăn sử dụng RAG & pgvector (AI Recommendation Chatbot)
* **Lý do đề xuất:** Giúp khách hàng tìm và chọn món theo sở thích cá nhân thông qua hội thoại tự nhiên (Ví dụ: *"Gợi ý cho tôi vài món burger cay kèm nước uống dưới 150k"*).
* **Mô tả chức năng:**
  * Kích hoạt extension `vector` trong PostgreSQL.
  * Khi tạo/cập nhật món ăn, Backend tự động sinh mã vector nhúng (Vector Embedding) từ mô tả món và lưu vào cột `embedding` trên database.
  * Khi khách hỏi chatbot, Backend chuyển câu hỏi thành vector, thực hiện tìm kiếm tương đồng (Cosine Similarity) trên database để lấy ra các món ăn phù hợp nhất làm ngữ cảnh (Context).
  * Backend gửi câu hỏi kèm ngữ cảnh tới Ollama chạy cục bộ (sử dụng mô hình miễn phí như `llama3` hoặc `phi3` và mô hình embedding `nomic-embed-text`) để sinh câu trả lời tư vấn thuyết phục khách đặt món, đảm bảo chạy offline 100% và hoàn toàn miễn phí.

### 2. Phân hệ Web riêng biệt cho Shipper (Shipper Portal)
* **Lý do đề xuất:** Shipper có một không gian làm việc độc lập thay vì dùng chung giao diện với Admin hay xem chung với Khách.
* **Mô tả chức năng:**
  * **Kho đơn hàng (Order Pool):** Hiển thị các đơn chuẩn bị xong (`preparing`) chờ shipper bấm "Nhận đơn".
  * **Màn hình giao hàng:** Hiển thị thông tin khách hàng, số điện thoại, địa chỉ, và nút "Giao thành công" / "Giao thất bại".
  * **Lịch sử giao:** Lưu vết và tính tổng tiền ship shipper tích lũy được.

### 3. Tùy biến món ăn & Lựa chọn Topping (Food Customization)
* **Lý do đề xuất:** Cho phép khách chọn size hoặc thêm topping (Ví dụ: Thêm phô mai cho pizza, thêm trân châu cho trà sữa, chọn mức đường/đá).
* **Mô tả chức năng:** Giá món ăn sẽ tự động cộng thêm dựa trên topping đã tích chọn.

### 4. Sổ địa chỉ giao hàng (Saved Address Book)
* **Lý do đề xuất:** Giúp khách hàng thân thiết không phải nhập lại địa chỉ thủ công mỗi lần thanh toán.
* **Mô tả chức năng:** Khách hàng lưu nhiều địa chỉ nhận hàng (Ví dụ: Nhà riêng, Công ty) và click chọn nhanh địa chỉ khi checkout.

### 5. Tích điểm thưởng & Ví thành viên (Loyalty Points & Wallet)
* **Lý do đề xuất:** Tăng tính giữ chân khách hàng (Retention), mô phỏng các ứng dụng giao đồ ăn hiện đại.
* **Mô tả chức năng:** Tích điểm thưởng bằng 10% giá trị đơn hàng khi giao thành công. Sử dụng điểm để quy đổi thành tiền mặt giảm trừ trực tiếp cho đơn hàng tiếp theo (1 điểm = 1.000đ).

### 6. Trò chuyện thời gian thực giữa Khách và Shipper (Realtime Chat)
* **Lý do đề xuất:** Tối ưu hóa giao tiếp thời gian thực, là điểm nhấn công nghệ cực lớn trong đồ án sử dụng WebSockets (Django Channels).

### 7. Xuất báo cáo doanh thu ra file Excel/PDF (Export Reports via Celery)
* **Lý do đề xuất:** Manager nhấn nút "Xuất báo cáo", một Celery Task chạy ngầm sinh file Excel `.xlsx` và gửi link tải về qua thông báo in-app.

---

## III. KẾ HOẠCH PHÂN BỔ CÔNG VIỆC TRONG 4 SPRINT (CHO 6 THÀNH VIÊN)

Dưới đây là kế hoạch phân chia công việc chi tiết theo từng tuần (Sprint):

### SPRINT 1 (Tuần 1): Nền tảng & Cấu trúc Dữ liệu
* **Mục tiêu:** Khởi chạy dự án, xây dựng cơ sở dữ liệu hoàn chỉnh có chứa các tính năng nâng cấp (Topping, Địa chỉ, Ví tích điểm, và cột vector cho Chatbot).
* **Phân chia công việc:**
  * **BE 1:** Thiết kế cơ sở dữ liệu `users`, `foods`, `categories`, `addresses`, `toppings` (FOOD-001, 005, 006).
  * **BE 2:** Cấu hình JWT Auth & phân quyền RBAC (FOOD-003, 018).
  * **FE 1:** Setup React, cài MUI, Router, Axios (FOOD-001) và làm trang Đăng nhập/Đăng ký (FOOD-004).
  * **FE 2:** Làm trang Menu public, FoodCard có hỗ trợ hiển thị Topping (FOOD-008).
  * **DevOps:** Setup GitHub Actions CI ban đầu, cấu hình Postgres DB hỗ trợ extension `pgvector` (FOOD-002, 009).
  * **QA/Lead:** Thiết lập Product Backlog nâng cấp, viết bộ test skeleton.

### SPRINT 2 (Tuần 2): Tính năng Giỏ hàng, Đặt hàng & Phân hệ Shipper
* **Mục tiêu:** Hoàn thiện luồng đặt hàng kèm địa chỉ đã lưu, topping, và xây dựng giao diện Shipper nhận đơn giao.
* **Phân chia công việc:**
  * **BE 1:** API Giỏ hàng & API đặt hàng trừ kho có hỗ trợ Topping, Địa chỉ đã lưu (FOOD-010, 012).
  * **BE 2:** API giao việc cho Shipper: Nhận đơn (`claim`), cập nhật trạng thái đơn (FOOD-013, 015).
  * **FE 1:** Làm trang Giỏ hàng & Checkout chọn Địa chỉ, Topping (FOOD-011, 014).
  * **FE 2:** Xây dựng **Giao diện Shipper**: Màn hình nhận đơn (Order Pool), Màn hình đi giao (Active Deliveries) (NÂNG CẤP).
  * **DevOps:** Bổ sung test tự động trong CI, đo lường độ phủ đạt >= 70%.
  * **QA/Lead:** Viết testcase cho luồng đặt hàng và kiểm thử phân quyền các trang Shipper/Admin.

### SPRINT 3 (Tuần 3): Mở rộng, Ví tích điểm, Voucher & AI RAG Chatbot
* **Mục tiêu:** Triển khai Ví tích điểm, Voucher, tính năng Đánh giá, chạy tác vụ nền Celery và **tích hợp AI RAG Chatbot**.
* **Phân chia công việc:**
  * **BE 1:** API quản lý và áp dụng Voucher, API Đánh giá món (FOOD-020, 021, 022).
  * **BE 2:** Phát triển API AI Chatbot RAG: Viết logic sinh vector nhúng cho món ăn và tìm kiếm tương đồng trên pgvector Postgres (NÂNG CẤP).
  * **FE 1:** Làm trang Đánh giá đơn hàng (Customer), và tích hợp **Floating Chatbot Widget** ở góc phải màn hình (FE NÂNG CẤP).
  * **FE 2:** Trang thống kê doanh thu có nút "Xuất báo cáo Excel/PDF" (FE NÂNG CẤP).
  * **DevOps:** Đóng gói Docker Compose toàn bộ hệ thống; cấu hình SonarQube Quality Gate (FOOD-026, 027).
  * **QA/Lead:** Viết test coverage cho các hàm dịch vụ ví và voucher, nâng coverage tổng thể >= 80%.

### SPRINT 4 (Tuần 4): Microservices, Chat Shipper WebSocket & Vận hành
* **Mục tiêu:** Tách 3 services, cấu hình API Gateway Nginx, hoàn thiện tính năng Chat Shipper realtime và Load Test.
* **Phân chia công việc:**
  * **BE 1:** Tách dự án thành 3 Microservices (User, Food, Order Services) (FOOD-028, 029, 030).
  * **BE 2:** Triển khai WebSockets bằng Django Channels tạo kênh Chat realtime giữa Khách và Shipper (NÂNG CẤP).
  * **FE 1 & FE 2:** Tích hợp ô Chat mini vào trang theo dõi đơn hàng của Khách hàng và trang đang đi giao của Shipper.
  * **DevOps:** Thiết lập API Gateway, cấu hình Prometheus & Grafana Dashboard (FOOD-031, 032).
  * **QA/Lead:** Chạy kiểm thử tải hệ thống bằng k6, xuất báo cáo tải và hoàn thiện báo cáo SPQM tổng kết (FOOD-033).
