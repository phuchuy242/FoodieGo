import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const BASE_URL = "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/";
const ADMIN_ORDERS_API = `${BASE_URL}admin/orders/`;
const ORDER_DETAIL_API = (id) => `${BASE_URL}orders/${id}/`;

const styles = {
    idBadge: {
        display: "inline-block",
        backgroundColor: "#1e293b",
        color: "#ffffff",
        fontWeight: 600,
        fontSize: "0.8rem",
        padding: "4px 11px",
        borderRadius: "999px",
    },
    iconActionBtn: {
        width: "34px",
        height: "34px",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
    },
    tableWrapper: {
        borderRadius: "18px",
        overflow: "hidden",
    },
    tableHead: {
        backgroundColor: "#f8f9fb",
        borderBottom: "2px solid #e9ecef",
    },
    tableHeadCell: {
        fontSize: "0.8rem",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "#344054",
        padding: "14px 12px",
        whiteSpace: "nowrap",
    },
    tableRow: {
        transition: "background-color 0.15s ease",
        cursor: "pointer",
    },
    tableCell: {
        padding: "14px 12px",
        verticalAlign: "middle",
        fontSize: "0.9rem",
    },
    actionBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px 12px",
        fontSize: "0.8rem",
        fontWeight: 500,
        borderRadius: "10px",
    },
    modalHeader: {
        borderBottom: "1px solid #eef0f3",
        padding: "18px 22px",
    },
    modalBody: {
        padding: "22px",
    },
    modalFooter: {
        borderTop: "1px solid #eef0f3",
        padding: "14px 22px",
    },
    modalContent: {
        borderRadius: "20px",
        border: "none",
        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
        overflow: "hidden",
    },
    formLabel: {
        fontSize: "0.82rem",
        fontWeight: 600,
        color: "#000000",
        marginBottom: "6px",
    },
    formControl: {
        fontSize: "0.9rem",
        padding: "9px 14px",
        borderRadius: "12px",
    },
    deleteWarnBox: {
        backgroundColor: "#fff5f5",
        border: "1px solid #ffd6d6",
        borderRadius: "14px",
        padding: "12px 14px",
        marginTop: "12px",
    },
    detailPanel: {
        width: "440px",
        flexShrink: 0,
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        border: "1px solid #eef0f3",
        height: "fit-content",
        position: "sticky",
        top: "16px",
        overflow: "hidden",
    },
    detailPanelHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 26px",
        borderBottom: "1px solid #eef0f3",
    },
    detailPanelBody: {
        padding: "26px",
    },
    sectionLabel: {
        fontSize: "0.78rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        color: "#000000",
        marginBottom: "10px",
    },
    stepCircle: (active, done) => ({
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        fontWeight: 700,
        backgroundColor: active ? "#ff7a30" : done ? "#ffe1cc" : "#f1f2f4",
        color: active ? "#ffffff" : done ? "#ff7a30" : "#000000",
        border: active ? "2px solid #ff7a30" : "none",
        flexShrink: 0,
    }),
    stepLine: (done) => ({
        flex: 1,
        height: "2px",
        backgroundColor: done ? "#ffb98a" : "#e9ecef",
        margin: "0 2px",
    }),
    statusBadge: (bg, color, bold) => ({
        display: "inline-block",
        backgroundColor: bg,
        color: color,
        fontWeight: bold ? 700 : 500,
        fontSize: "0.78rem",
        padding: "5px 12px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
    }),
};

const STATUS_ORDER = [
    "awaiting_payment",
    "pending",
    "confirmed",
    "preparing",
    "cooking",
    "ready",
    "delivering",
    "completed",
    "cancelled",
];

const STATUS_LABEL = {
    awaiting_payment: "Chờ thanh toán",
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    cooking: "Đang nấu",
    ready: "Sẵn sàng",
    delivering: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
};

const STATUS_STYLE = {
    awaiting_payment: { bg: "#F1F5F9", color: "#64748B", bold: false },
    pending: { bg: "#E0E7FF", color: "#4338CA", bold: false },
    confirmed: { bg: "#DBEAFE", color: "#1D4ED8", bold: false },
    preparing: { bg: "#FEF3C7", color: "#B45309", bold: false },
    cooking: { bg: "#FFEDD5", color: "#C2410C", bold: true },
    ready: { bg: "#EDE9FE", color: "#6D28D9", bold: true },
    delivering: { bg: "#CFFAFE", color: "#0E7490", bold: false },
    completed: { bg: "#DCFCE7", color: "#15803D", bold: true },
    cancelled: { bg: "#FEE2E2", color: "#B91C1C", bold: true },
};

const STEP_FLOW = ["pending", "confirmed", "preparing", "cooking", "ready", "delivering", "completed"];
const STEP_LABEL = {
    pending: "Mới",
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    cooking: "Đang nấu",
    ready: "Sẵn sàng",
    delivering: "Đang giao",
    completed: "Hoàn thành",
};
const NEXT_ACTION_LABEL = {
    pending: "Xác nhận đơn",
    confirmed: "Bếp tiếp nhận",
    preparing: "Bắt đầu nấu",
    cooking: "Đánh dấu sẵn sàng",
    ready: "Bắt đầu giao",
    delivering: "Đánh dấu hoàn thành",
};

const getHeaders = () => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("access_token");
    const headers = { "ngrok-skip-browser-warning": "true" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
};

const formatCurrency = (value) => {
    const amount = Number(value ?? 0) || 0;
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("vi-VN", { hour12: false });
};

const resolveOrderId = (order) => order?.id;
const resolveCustomerName = (order) => order?.user_name || (order?.user ? `Khách #${order.user}` : "Khách vãng lai");
const resolveStatus = (order) => String(order?.status || "pending").toLowerCase();

const StatusBadge = ({ status, label }) => {
    const cfg = STATUS_STYLE[status] || STATUS_STYLE.pending;
    return (
        <span
            style={{
                display: "inline-block",
                backgroundColor: "#ffffff",
                color: cfg.color,
                fontWeight: 600,
                fontSize: "0.78rem",
                padding: "4px 12px",
                borderRadius: "999px",
                border: `1.5px solid ${cfg.color}`,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </span>
    );
};

/* ============================ MODAL SỬA ĐƠN ============================ */
const EditOrderModal = ({ orderId, onClose, onSaved }) => {
    const MySwal = withReactContent(Swal);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(null);

    useEffect(() => {
        let active = true;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const response = await axios.get(ORDER_DETAIL_API(orderId), { headers: getHeaders() });
                const data = response?.data?.data || response?.data || {};
                if (!active) return;
                setForm({
                    table: data?.table ?? "",
                    status: resolveStatus(data),
                    subtotal: data?.subtotal ?? 0,
                    shipping_fee: data?.shipping_fee ?? 0,
                    discount_amount: data?.discount_amount ?? 0,
                    voucher_code: data?.voucher_code ?? "",
                });
            } catch (error) {
                console.error("Fetch order detail failed", error);
                MySwal.fire({
                    title: "Không thể tải chi tiết đơn hàng",
                    text: error?.response?.data?.message || "Vui lòng thử lại.",
                    icon: "error",
                });
                onClose();
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchDetail();
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                table: form.table === "" ? null : form.table,
                status: form.status,
                subtotal: Number(form.subtotal) || 0,
                shipping_fee: Number(form.shipping_fee) || 0,
                discount_amount: Number(form.discount_amount) || 0,
                voucher_code: form.voucher_code || "",
            };
            await axios.patch(`${ADMIN_ORDERS_API}${orderId}/`, payload, { headers: getHeaders() });
            MySwal.fire({ title: "Cập nhật thành công", icon: "success", timer: 1500, showConfirmButton: false });
            onSaved();
        } catch (error) {
            console.error("Save order failed", error);
            MySwal.fire({
                title: "Cập nhật thất bại",
                text: error?.response?.data?.message || "Không thể lưu đơn hàng.",
                icon: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={styles.modalContent}>
                    <div className="modal-header" style={styles.modalHeader}>
                        <div>
                            <h5 className="modal-title mb-0" style={{ fontWeight: 600 }}>
                                <i className="bi bi-pencil-square me-2 text-warning"></i>
                                Sửa đơn hàng
                            </h5>
                            <small className="text-muted">Đơn #{orderId}</small>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body" style={styles.modalBody}>

                        {loading || !form ? (
                            <div className="text-center py-4">Đang tải dữ liệu...</div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label" style={styles.formLabel}>Mã đơn hàng</label>
                                    <input
                                        className="form-control"
                                        style={{ ...styles.formControl, backgroundColor: "#f1f2f4", color: "#6c757d", cursor: "not-allowed" }}
                                        value={orderId}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={styles.formLabel}>Trạng thái</label>
                                    <select
                                        className="form-select"
                                        style={styles.formControl}
                                        value={form.status}
                                        onChange={handleChange("status")}
                                    >
                                        {STATUS_ORDER.map((s) => (
                                            <option key={s} value={s}>
                                                {STATUS_LABEL[s]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Tạm tính</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.subtotal}
                                            onChange={handleChange("subtotal")}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Phí giao hàng</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.shipping_fee}
                                            onChange={handleChange("shipping_fee")}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Giảm giá</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.discount_amount}
                                            onChange={handleChange("discount_amount")}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Mã giảm giá</label>
                                        <input
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.voucher_code}
                                            onChange={handleChange("voucher_code")}
                                            placeholder="VD: SALE10"
                                        />
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                    <div className="modal-footer" style={styles.modalFooter}>
                        <button type="button" className="btn btn-light rounded-pill px-3" onClick={onClose} disabled={saving}>
                            Hủy
                        </button>
                        <button type="button" className="btn btn-primary rounded-pill px-3" onClick={handleSave} disabled={loading || saving}>
                            {saving ? (
                                <><i className="bi bi-arrow-repeat me-1"></i>Đang lưu...</>
                            ) : (
                                <><i className="bi bi-check2 me-1"></i>Lưu thay đổi</>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* ============================ MODAL XÓA ĐƠN ============================ */
const DeleteOrderModal = ({ order, onClose, onDeleted }) => {
    const MySwal = withReactContent(Swal);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${ADMIN_ORDERS_API}${resolveOrderId(order)}/`, { headers: getHeaders() });
            MySwal.fire({ title: "Đã xóa đơn hàng", icon: "success", timer: 1400, showConfirmButton: false });
            onDeleted();
        } catch (error) {
            console.error("Delete order failed", error);
            MySwal.fire({
                title: "Xóa thất bại",
                text: error?.response?.data?.message || "Không thể xóa đơn hàng.",
                icon: "error",
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={styles.modalContent}>
                    <div className="modal-header" style={styles.modalHeader}>
                        <div>
                            <h5 className="modal-title mb-0" style={{ fontWeight: 600 }}>
                                <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>
                                Xác nhận xóa đơn hàng
                            </h5>
                            <small className="text-muted">Đơn #{resolveOrderId(order)}</small>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body" style={styles.modalBody}>
                        <p className="mb-2" style={{ fontSize: "0.95rem" }}>
                            Bạn có chắc muốn xóa đơn hàng của <strong>{resolveCustomerName(order)}</strong>?
                        </p>
                        <div style={styles.deleteWarnBox}>
                            <small className="text-danger d-flex align-items-center">
                                <i className="bi bi-info-circle me-2"></i>
                                Hành động này <strong className="mx-1">không thể hoàn tác</strong>. Dữ liệu sẽ bị xóa vĩnh viễn.
                            </small>
                        </div>
                    </div>
                    <div className="modal-footer" style={styles.modalFooter}>
                        <button type="button" className="btn btn-light rounded-pill px-3" onClick={onClose} disabled={deleting}>
                            Hủy
                        </button>
                        <button type="button" className="btn btn-danger rounded-pill px-3" onClick={handleDelete} disabled={deleting}>
                            {deleting ? (
                                <><i className="bi bi-arrow-repeat me-1"></i>Đang xóa...</>
                            ) : (
                                <><i className="bi bi-trash me-1"></i>Xóa vĩnh viễn</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ============================ PANEL CHI TIẾT ĐƠN HÀNG ============================ */
const OrderDetailsPanel = ({ orderId, onClose, onStatusChanged, refreshKey }) => {
    const MySwal = withReactContent(Swal);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [order, setOrder] = useState(null);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await axios.get(ORDER_DETAIL_API(orderId), { headers: getHeaders() });
            const data = response?.data?.data || response?.data || {};
            setOrder(data);
        } catch (error) {
            console.error("Fetch order detail failed", error);
            MySwal.fire({
                title: "Không thể tải chi tiết đơn hàng",
                text: error?.response?.data?.message || "Vui lòng thử lại.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, refreshKey]);

    const status = order ? resolveStatus(order) : null;
    const stepIndex = status ? STEP_FLOW.indexOf(status) : -1;
    const isInFlow = stepIndex !== -1;

    const changeStatus = async (nextStatus, { confirmMessage } = {}) => {
        if (confirmMessage) {
            const result = await MySwal.fire({
                title: confirmMessage,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Đồng ý, quay lại",
                cancelButtonText: "Hủy",
                confirmButtonColor: "#dc3545",
            });
            if (!result.isConfirmed) return;
        }
        setUpdating(true);
        try {
            await axios.patch(`${ADMIN_ORDERS_API}${orderId}/`, { status: nextStatus }, { headers: getHeaders() });
            MySwal.fire({ title: "Đã cập nhật trạng thái", icon: "success", timer: 1200, showConfirmButton: false });
            await fetchDetail();
            onStatusChanged();
        } catch (error) {
            console.error("Update status failed", error);
            MySwal.fire({
                title: "Cập nhật thất bại",
                text: error?.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng.",
                icon: "error",
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAdvance = () => {
        if (!isInFlow || stepIndex >= STEP_FLOW.length - 1) return;
        changeStatus(STEP_FLOW[stepIndex + 1]);
    };

    const handleRevert = () => {
        if (!isInFlow || stepIndex <= 0) return;
        changeStatus(STEP_FLOW[stepIndex - 1], {
            confirmMessage: `Chuyển đơn hàng về trạng thái "${STEP_LABEL[STEP_FLOW[stepIndex - 1]]}"?`,
        });
    };

    const items = order?.items || order?.order_items || [];
    const subtotal = order?.subtotal ?? 0;
    const shippingFee = order?.shipping_fee ?? 0;
    const discount = order?.discount_amount ?? 0;
    const total = order?.total_amount ?? (Number(subtotal) + Number(shippingFee) - Number(discount));

    return (
        <div style={styles.detailPanel}>
            <div style={styles.detailPanelHeader}>
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="mb-0" style={{ fontWeight: 700, color: "#ff7a30", fontSize: "1.1rem" }}>
                            Chi tiết đơn hàng
                        </h5>
                    </div>
                </div>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div style={styles.detailPanelBody}>
                {loading || !order ? (
                    <div className="text-center py-4">Đang tải chi tiết đơn hàng...</div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                            <h4 className="mb-0" style={{ fontWeight: 700, color: "#ff7a30", fontSize: "1.5rem" }}>
                                #{order?.pay_code || resolveOrderId(order)}
                            </h4>
                            <StatusBadge status={status} label={order?.status_display || STATUS_LABEL[status] || status} />
                        </div>
                        <small className="text-muted d-block mb-3">
                            Thời gian đặt: {formatDate(order?.created_at)}
                        </small>

                        {/* Thông tin khách hàng */}
                        <div style={styles.sectionLabel}>Thông tin khách hàng</div>
                        <div className="mb-3">
                            <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{resolveCustomerName(order)}</div>
                            {order?.phone && (
                                <small className="text-muted d-flex align-items-center gap-1">
                                    <i className="bi bi-telephone"></i> {order.phone}
                                </small>
                            )}
                            {order?.email && (
                                <small className="text-muted d-flex align-items-center gap-1">
                                    <i className="bi bi-envelope"></i> {order.email}
                                </small>
                            )}
                            <small className="text-muted d-flex align-items-center gap-1">
                                <i className="bi bi-geo-alt"></i> {order?.table ? `Bàn ${order.table}` : (order?.address || "Giao hàng")}
                            </small>
                        </div>

                        {/* Món trong đơn */}
                        <div style={styles.sectionLabel}>Món trong đơn ({items.length})</div>
                        <div className="mb-3">
                            {items.length === 0 ? (
                                <small className="text-muted">Không có chi tiết món.</small>
                            ) : (
                                items.map((item, idx) => (
                                    <div key={item?.id ?? idx} className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            {item?.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item?.name}
                                                    style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover" }}
                                                />
                                            )}
                                            <div>
                                                <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{item?.name || item?.dish_name}</div>
                                                <small className="text-muted">x{item?.quantity ?? 1}</small>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                                            {formatCurrency(item?.price ?? item?.subtotal)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Tổng tiền */}
                        <div className="border-top pt-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Tạm tính</small>
                                <small style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Phí giao hàng</small>
                                <small style={{ fontWeight: 500 }}>{formatCurrency(shippingFee)}</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Giảm giá</small>
                                <small className="text-danger" style={{ fontWeight: 500 }}>-{formatCurrency(discount)}</small>
                            </div>
                            <div
                                className="d-flex justify-content-between align-items-center mt-3 pt-3"
                                style={{ borderTop: "1px dashed #e9ecef" }}
                            >
                                <strong style={{ fontSize: "1.05rem" }}>Tổng cộng</strong>
                                <strong className="text-danger" style={{ fontSize: "1.3rem" }}>{formatCurrency(total)}</strong>
                            </div>
                        </div>

                        {/* Stepper trạng thái */}
                        {isInFlow ? (
                            <>
                                <div style={styles.sectionLabel}>Cập nhật trạng thái đơn hàng</div>
                                <div className="d-flex align-items-center mb-2">
                                    {STEP_FLOW.map((step, idx) => (
                                        <React.Fragment key={step}>
                                            <div style={styles.stepCircle(idx === stepIndex, idx < stepIndex)}>
                                                {idx + 1}
                                            </div>
                                            {idx < STEP_FLOW.length - 1 && <div style={styles.stepLine(idx < stepIndex)} />}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="d-flex mb-3" style={{ fontSize: "0.68rem" }}>
                                    {STEP_FLOW.map((step) => (
                                        <div
                                            key={step}
                                            style={{
                                                flex: 1,
                                                textAlign: "center",
                                                color: step === status ? "#ff7a30" : "#adb5bd",
                                                fontWeight: step === status ? 700 : 400,
                                            }}
                                        >
                                            {STEP_LABEL[step]}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill"
                                    style={{ backgroundColor: "#ff7a30", borderColor: "#ff7a30", color: "#fff", fontWeight: 600, padding: "10px 0" }}
                                    onClick={handleAdvance}
                                    disabled={updating || stepIndex >= STEP_FLOW.length - 1}
                                >
                                    {updating ? "Đang cập nhật..." : (stepIndex >= STEP_FLOW.length - 1 ? "Đã hoàn thành" : NEXT_ACTION_LABEL[status])}
                                    {stepIndex < STEP_FLOW.length - 1 && <i className="bi bi-arrow-right"></i>}
                                </button>

                                {stepIndex > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-1 rounded-pill"
                                        style={{ fontSize: "0.78rem" }}
                                        onClick={handleRevert}
                                        disabled={updating}
                                    >
                                        <i className="bi bi-arrow-left"></i>
                                        Quay lại "{STEP_LABEL[STEP_FLOW[stepIndex - 1]]}"
                                    </button>
                                )}

                                <small className="text-muted d-block mt-2">
                                    Lưu ý: chỉ dùng "Quay lại" để hủy thao tác nhấn nhầm — nó sẽ đưa đơn hàng về trạng thái trước đó.
                                </small>
                            </>
                        ) : (
                            <div className="alert alert-secondary py-2 px-3 mb-0 rounded-4" style={{ fontSize: "0.85rem" }}>
                                Đơn hàng này đang ở trạng thái <strong>{STATUS_LABEL[status] || status}</strong>, nằm ngoài
                                luồng trạng thái thông thường nên không thể tiến/lùi tại đây.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ============================ DANH SÁCH CHÍNH ============================ */
const OrderList = () => {
    const MySwal = withReactContent(Swal);
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [editOrderId, setEditOrderId] = useState(null);
    const [deleteOrder, setDeleteOrder] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [detailRefreshKey, setDetailRefreshKey] = useState(0);

    const loadOrders = async (targetPage = page) => {
        setLoading(true);
        try {
            const response = await axios.get(ADMIN_ORDERS_API, {
                headers: getHeaders(),
                params: { page: targetPage, limit },
            });
            const payload = response?.data?.data || {};
            const results = Array.isArray(payload.results) ? payload.results : [];
            setOrders(results);
            setTotal(Number(payload.total) || 0);
            setPage(Number(payload.page) || targetPage);
        } catch (error) {
            console.error("Order list fetch failed", error);
            MySwal.fire({
                title: "Không thể tải danh sách đơn hàng",
                text: error?.response?.data?.message || "Không thể tải danh sách đơn hàng.",
                icon: "error",
                timer: 2500,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statusCounts = useMemo(() => {
        const counts = { all: orders.length };
        STATUS_ORDER.forEach((status) => {
            counts[status] = 0;
        });
        orders.forEach((order) => {
            const status = resolveStatus(order);
            if (counts[status] !== undefined) counts[status] += 1;
        });
        return counts;
    }, [orders]);

    const visibleStatusCards = useMemo(
        () => STATUS_ORDER.filter((status) => statusCounts[status] > 0),
        [statusCounts]
    );

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const keyword = String(searchText || "").trim().toLowerCase();
            const status = resolveStatus(order);
            const matchText =
                !keyword ||
                String(resolveOrderId(order)).toLowerCase().includes(keyword) ||
                resolveCustomerName(order).toLowerCase().includes(keyword) ||
                String(order?.pay_code || "").toLowerCase().includes(keyword);
            const matchStatus = statusFilter === "all" || status === statusFilter;
            return matchText && matchStatus;
        });
    }, [orders, searchText, statusFilter]);

    const renderOrderRow = (order) => {
        const orderId = resolveOrderId(order);
        const status = resolveStatus(order);
        const isActive = orderId === selectedOrderId;
        return (
            <tr
                key={orderId}
                style={{ ...styles.tableRow, ...(isActive ? styles.tableRowActive : {}) }}
                onClick={() => setSelectedOrderId(orderId)}
            >
                <td style={styles.tableCell}>
                    <span style={styles.idBadge}>#{orderId}</span>
                </td>
                <td style={styles.tableCell}>
                    <div className="d-flex flex-column">
                        <strong style={{ fontSize: "0.9rem" }}>{resolveCustomerName(order)}</strong>
                        <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                            {order?.table ? `Bàn ${order.table}` : "Giao hàng"}
                        </small>
                    </div>
                </td>
                <td style={styles.tableCell}>
                    <code style={{ fontSize: "0.82rem", color: "#6f42c1", backgroundColor: "#f6f3fb", padding: "3px 8px", borderRadius: "8px" }}>
                        {order?.pay_code}
                    </code>
                </td>
                <td style={styles.tableCell}>{order?.items_count ?? 0}</td>
                <td style={styles.tableCell}>{formatCurrency(order?.subtotal)}</td>
                <td style={styles.tableCell}>{formatCurrency(order?.shipping_fee)}</td>
                <td style={styles.tableCell}>{formatCurrency(order?.discount_amount)}</td>
                <td style={styles.tableCell}><strong>{formatCurrency(order?.total_amount)}</strong></td>
                <td style={{ ...styles.tableCell, fontSize: "0.82rem", color: "#000000" }}>{formatDate(order?.created_at)}</td>
                <td style={styles.tableCell}>
                    <StatusBadge status={status} label={order?.status_display || STATUS_LABEL[status] || status} />
                </td>
                <td style={styles.tableCell}>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            style={styles.iconActionBtn}
                            onClick={(e) => { e.stopPropagation(); setDeleteOrder(order); }}
                            title="Xóa đơn hàng"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </button>
                    </div>
                </td>

            </tr>
        );
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="page-wrapper">
            <div className="content container-fluid py-4">
                {/* Toàn bộ layout chia 2 cột NGAY TỪ ĐẦU TRANG */}
                <div className="d-flex align-items-start gap-3">
                    {/* CỘT TRÁI: tiêu đề + thống kê + tìm kiếm + bảng */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
                            <div className="page-title">
                                <h4>Đơn hàng</h4>
                                <h6 className="text-muted">Quản lý đơn hàng và trạng thái.</h6>
                            </div>
                        </div>

                        <div className="row g-2 mb-3">
                            {total > 0 && (
                                <div className="col-6 col-md-4 col-xl-2">
                                    <div className="card shadow-sm border-0 h-100 rounded-4">
                                        <div className="card-body py-2 px-3">
                                            <p className="text-muted mb-1" style={{ fontSize: "0.78rem" }}>Tất cả đơn hàng</p>
                                            <h5 className="mb-0" style={{ fontWeight: 700 }}>{loading ? "..." : total}</h5>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {visibleStatusCards.map((status) => (
                                <div key={status} className="col-6 col-md-4 col-xl-2">
                                    <div className="card shadow-sm border-0 h-100 rounded-4">
                                        <div className="card-body py-2 px-3">
                                            <StatusBadge status={status} label={STATUS_LABEL[status]} />
                                            <h5 className="mb-0 mt-1" style={{ fontWeight: 700 }}>{statusCounts[status]}</h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card mb-4 shadow-sm border-0 rounded-4">
                            <div className="card-body">
                                <div className="row g-3 align-items-center">
                                    <div className="col-md-6">
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                                                <i className="bi bi-search"></i>
                                            </span>
                                            <input
                                                type="search"
                                                className="form-control border-start-0 rounded-end-pill"
                                                placeholder="Tìm theo ID, tên khách hàng, mã thanh toán..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <select className="form-select rounded-pill" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                            <option value="all">Tất cả trạng thái</option>
                                            {STATUS_ORDER.map((status) => (
                                                <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <button className="btn btn-outline-secondary w-100 rounded-pill" onClick={() => loadOrders(page)} disabled={loading}>
                                            Làm mới
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4" style={{ overflow: "hidden" }}>
                            <div className="card-body p-0">
                                <div className="table-responsive" style={styles.tableWrapper}>
                                    <table className="table table-hover align-middle mb-0">
                                        <thead style={styles.tableHead}>
                                            <tr>
                                                <th style={styles.tableHeadCell}>ID</th>
                                                <th style={styles.tableHeadCell}>Khách hàng</th>
                                                <th style={styles.tableHeadCell}>Mã thanh toán</th>
                                                <th style={styles.tableHeadCell}>Món</th>
                                                <th style={styles.tableHeadCell}>Tạm tính</th>
                                                <th style={styles.tableHeadCell}>Phí giao</th>
                                                <th style={styles.tableHeadCell}>Giảm giá</th>
                                                <th style={styles.tableHeadCell}>Tổng</th>
                                                <th style={styles.tableHeadCell}>Thời gian</th>
                                                <th style={styles.tableHeadCell}>Trạng thái</th>
                                                <th style={{ ...styles.tableHeadCell, textAlign: "center" }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={11} className="text-center py-4">Đang tải...</td></tr>
                                            ) : filteredOrders.length === 0 ? (
                                                <tr><td colSpan={11} className="text-center py-4">Không tìm thấy đơn hàng nào.</td></tr>
                                            ) : (
                                                filteredOrders.map((order) => renderOrderRow(order))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                                <small className="text-muted">Tổng {total} đơn hàng</small>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 32, height: 32, border: "1px solid #e9ecef" }}
                                        disabled={page <= 1 || loading}
                                        onClick={() => loadOrders(page - 1)}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 32, height: 32, border: "1.5px solid #f5f5f5", color: "#000000", backgroundColor: "transparent", fontWeight: 700 }}
                                        disabled
                                    >
                                        {page}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 32, height: 32, border: "1px solid #e9ecef" }}
                                        disabled={page >= totalPages || loading}
                                        onClick={() => loadOrders(page + 1)}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: panel chi tiết, bắt đầu ngang tiêu đề trang */}
                    {selectedOrderId !== null && (
                        <OrderDetailsPanel
                            orderId={selectedOrderId}
                            onClose={() => setSelectedOrderId(null)}
                            onStatusChanged={() => loadOrders(page)}
                            refreshKey={detailRefreshKey}
                        />
                    )}
                </div>
            </div>

            {editOrderId !== null && (
                <EditOrderModal
                    orderId={editOrderId}
                    onClose={() => setEditOrderId(null)}
                    onSaved={() => {
                        setEditOrderId(null);
                        loadOrders(page);
                        setDetailRefreshKey((prev) => prev + 1);
                    }}
                />
            )}

            {deleteOrder !== null && (
                <DeleteOrderModal
                    order={deleteOrder}
                    onClose={() => setDeleteOrder(null)}
                    onDeleted={() => {
                        setDeleteOrder(null);
                        if (resolveOrderId(deleteOrder) === selectedOrderId) setSelectedOrderId(null);
                        loadOrders(page);
                    }}
                />
            )}
        </div>
    );
};

export default OrderList;