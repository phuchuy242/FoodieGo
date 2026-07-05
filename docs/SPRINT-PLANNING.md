# Sprint Planning — FoodieGo (4 Sprint / 4 Tuần)

> Chi tiết task, API, acceptance criteria: [FOODIEGO-MASTER-TASKS.md](FOODIEGO-MASTER-TASKS.md)

---

## Tổng quan

| Sprint | Tuần | Theme | Level | SP |
|--------|------|-------|-------|-----|
| S1 | 1 | Nền tảng & Menu | L1 | 26 |
| S2 | 2 | Giỏ hàng & Đơn hàng | L1 | 37 |
| S3 | 3 | Mở rộng & Quality | L2 | 36 |
| S4 | 4 | Microservices & Nộp bài | L3 | 35 |

---

## Sprint 1 — Nền tảng & Menu

**Mục tiêu:** Setup, Auth, Category, Food, Menu UI, Swagger

| Branch | Feature | SP |
|--------|---------|-----|
| `feature/FOOD-001-project-setup` | Project setup | 3 |
| `feature/FOOD-002-github-ci` | GitHub CI | 2 |
| `feature/FOOD-003-jwt-auth` | JWT Auth | 5 |
| `feature/FOOD-004-user-register` | Register + UI | 3 |
| `feature/FOOD-005-category-crud` | Category CRUD | 3 |
| `feature/FOOD-006-food-crud` | Food CRUD | 3 |
| `feature/FOOD-007-food-search` | Search API | 2 |
| `feature/FOOD-008-menu-page` | Menu page | 3 |
| `feature/FOOD-009-swagger-docs` | Swagger | 2 |

**SMART-Q S1:** Login OK; menu ≥10 món; Swagger có auth + food endpoints.

---

## Sprint 2 — Giỏ hàng & Đơn hàng

**Mục tiêu:** Cart, Order, Payment, Tracking, Admin — **Coverage ≥70%**

| Branch | Feature | SP |
|--------|---------|-----|
| `feature/FOOD-010-cart-api` | Cart API | 5 |
| `feature/FOOD-011-cart-ui` | Cart UI | 3 |
| `feature/FOOD-012-order-create` | Order create | 8 |
| `feature/FOOD-013-payment-cod` | Payment COD | 3 |
| `feature/FOOD-014-checkout-page` | Checkout | 5 |
| `feature/FOOD-015-order-tracking` | Order tracking | 5 |
| `feature/FOOD-016-admin-users` | Admin users | 3 |
| `feature/FOOD-017-admin-layout` | Admin layout | 2 |
| `test/FOOD-coverage-70` | Coverage 70% | 3 |

**SMART-Q S2:** Flow đặt hàng end-to-end; CI pass; coverage ≥70%.

---

## Sprint 3 — Mở rộng & Chất lượng

**Mục tiêu:** Level 2 — Roles, Voucher, Review, Celery, Docker, Sonar — **Coverage ≥80%**

| Branch | Feature | SP |
|--------|---------|-----|
| `feature/FOOD-018-rbac-roles` | RBAC 4 roles | 5 |
| `feature/FOOD-019-redis-cache` | Redis cache | 3 |
| `feature/FOOD-020-voucher-mgmt` | Voucher CRUD | 3 |
| `feature/FOOD-021-voucher-checkout` | Voucher checkout | 3 |
| `feature/FOOD-022-rating-review` | Rating & review | 5 |
| `feature/FOOD-023-notification` | Notifications | 3 |
| `feature/FOOD-024-celery-jobs` | Celery jobs | 5 |
| `feature/FOOD-025-revenue-report` | Revenue report | 3 |
| `feature/FOOD-026-docker-compose` | Docker Compose | 3 |
| `feature/FOOD-027-sonarqube` | SonarQube | 3 |

**SMART-Q S3:** Docker 1 lệnh; Sonar Quality Gate pass; coverage ≥80%.

---

## Sprint 4 — Microservices & Nộp bài

**Mục tiêu:** 3 services, Gateway, Monitoring, k6, SPQM, demo

| Branch | Feature | SP |
|--------|---------|-----|
| `feature/FOOD-028-user-service` | User service | 5 |
| `feature/FOOD-029-food-service` | Food service | 5 |
| `feature/FOOD-030-order-service` | Order service | 8 |
| `feature/FOOD-031-api-gateway` | API Gateway | 5 |
| `feature/FOOD-032-monitoring` | Prometheus/Grafana | 3 |
| `feature/FOOD-033-k6-loadtest` | k6 load test | 3 |
| `docs/FOOD-spqm-final-report` | SPQM final | 3 |
| `chore/FOOD-final-polish` | Polish + demo video | 3 |

**SMART-Q S4:** 3 services + Gateway; k6 P95 <500ms; nộp đầy đủ tài liệu.

---

## Burndown (điền khi làm)

| Sprint | Planned SP | Done SP |
|--------|------------|---------|
| S1 | 26 | |
| S2 | 37 | |
| S3 | 36 | |
| S4 | 35 | |
