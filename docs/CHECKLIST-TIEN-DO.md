# Checklist Tiến Độ — FoodieGo (4 Sprint / 4 Tuần)

> Tick `[x]` khi hoàn thành. Chi tiết task + tên nhánh: [FOODIEGO-MASTER-TASKS.md](FOODIEGO-MASTER-TASKS.md)

---

## Sprint 1 — Nền tảng & Menu (Tuần 1)

- [ ] `feature/FOOD-001-project-setup` — Django + React + PostgreSQL + Git Flow
- [ ] `feature/FOOD-002-github-ci` — GitHub Actions CI
- [ ] `feature/FOOD-003-jwt-auth` — JWT login / refresh
- [ ] `feature/FOOD-004-user-register` — Register + Login/Register UI
- [ ] `feature/FOOD-005-category-crud` — CRUD Category
- [ ] `feature/FOOD-006-food-crud` — CRUD Food
- [ ] `feature/FOOD-007-food-search` — Search & filter API
- [ ] `feature/FOOD-008-menu-page` — Trang Menu public
- [ ] `feature/FOOD-009-swagger-docs` — Swagger API docs
- [ ] **Demo S1:** Login → Admin thêm món → Xem menu + search

---

## Sprint 2 — Giỏ hàng & Đơn hàng (Tuần 2)

- [ ] `feature/FOOD-010-cart-api` — Cart API
- [ ] `feature/FOOD-011-cart-ui` — Trang giỏ hàng
- [ ] `feature/FOOD-012-order-create` — Tạo đơn từ giỏ
- [ ] `feature/FOOD-013-payment-cod` — Payment COD mock
- [ ] `feature/FOOD-014-checkout-page` — Trang checkout
- [ ] `feature/FOOD-015-order-tracking` — Theo dõi đơn hàng
- [ ] `feature/FOOD-016-admin-users` — Admin quản lý user
- [ ] `feature/FOOD-017-admin-layout` — Admin dashboard layout
- [ ] Coverage ≥ **70%**
- [ ] **Demo S2 / Milestone L1:** Đặt hàng COD end-to-end

---

## Sprint 3 — Mở rộng & Chất lượng (Tuần 3)

- [ ] `feature/FOOD-018-rbac-roles` — 4 roles + permissions
- [ ] `feature/FOOD-019-redis-cache` — Redis cache
- [ ] `feature/FOOD-020-voucher-mgmt` — CRUD voucher
- [ ] `feature/FOOD-021-voucher-checkout` — Áp voucher checkout
- [ ] `feature/FOOD-022-rating-review` — Đánh giá món
- [ ] `feature/FOOD-023-notification` — Thông báo in-app
- [ ] `feature/FOOD-024-celery-jobs` — Celery background jobs
- [ ] `feature/FOOD-025-revenue-report` — Báo cáo doanh thu
- [ ] `feature/FOOD-026-docker-compose` — Docker Compose
- [ ] `feature/FOOD-027-sonarqube` — SonarQube Quality Gate
- [ ] Coverage ≥ **80%**
- [ ] **Demo S3 / Milestone L2:** Voucher + Docker + Sonar pass

---

## Sprint 4 — Microservices & Nộp bài (Tuần 4)

- [ ] `feature/FOOD-028-user-service` — User Service :8001
- [ ] `feature/FOOD-029-food-service` — Food Service :8002
- [ ] `feature/FOOD-030-order-service` — Order Service :8003
- [ ] `feature/FOOD-031-api-gateway` — API Gateway :8080
- [ ] `feature/FOOD-032-monitoring` — Prometheus + Grafana
- [ ] `feature/FOOD-033-k6-loadtest` — k6 load test report
- [ ] SPQM report hoàn chỉnh (SDLC, ETVX, PDCA, CMMI, ODA)
- [ ] Demo video 10–15 phút
- [ ] **Nộp đồ án / Milestone L3**

---

## SPQM (xuyên suốt)

- [ ] SPQM-01: SDLC + Product Vision
- [ ] SPQM-02: ETVX diagram
- [ ] SPQM-03: Product Backlog
- [ ] SPQM-06: Metrics baseline (S2)
- [ ] SPQM-07: PDCA cải tiến (có số liệu trước/sau)
- [ ] SPQM-09: CMMI L1→L3
- [ ] SPQM-10: Metrics trend 4 sprint
- [ ] SPQM-12: ODA tổng kết

---

## Ghi chú Sprint

| Sprint | Tuần | Bắt đầu | Kết thúc | SP hoàn thành | Ghi chú |
|--------|------|---------|----------|---------------|---------|
| S1 | 1 | | | /26 | |
| S2 | 2 | | | /37 | Milestone L1 |
| S3 | 3 | | | /36 | Milestone L2 |
| S4 | 4 | | | /35 | Nộp bài |
