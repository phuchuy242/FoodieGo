import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const BASE_URL = "https://untaut-wickedly-amina.ngrok-free.dev/api/v1/";
const ADMIN_ORDERS_API = `${BASE_URL}admin/orders/`;
const ORDER_DETAIL_API = (id) => `${BASE_URL}orders/${id}/`;

/* ============================================================
   STYLE TOKENS
   - Rounded corners bumped up across the board (cards, modals,
     inputs, badges) for a softer, friendlier look.
   - Status colors redesigned below (see STATUS_STYLE) so each
     stage is visually distinct; "needs attention" / final states
     are bold, routine in-progress states stay regular weight.
   ============================================================ */
const styles = {
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
    fontWeight: 900,
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
    tableRowActive: {
    backgroundColor: "#fff0e6",
    boxShadow: "inset 9px 0 0 #ff7a30, 0 2px 8px rgb(211, 97, 36)",
    fontWeight: 600,
    position: "relative",
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
    /* ------------------- Order Details panel ------------------- */
    detailPanel: {
        width: "380px",
        flexShrink: 0,
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
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
        padding: "18px 22px",
        borderBottom: "1px solid #eef0f3",
    },
    detailPanelBody: {
        padding: "22px",
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
    // Pill-shaped status badge, colors/weight supplied per-status below.
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
    awaiting_payment: "Awaiting Payment",
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    cooking: "Cooking",
    ready: "Ready",
    delivering: "Delivering",
    completed: "Completed",
    cancelled: "Cancelled",
};

/* ------------------------------------------------------------
   Status color system — each stage gets its own hue so the list
   is scannable at a glance. Statuses that need attention or mark
   an end state (Cooking, Ready, Completed, Cancelled) are bold;
   routine in-progress statuses stay regular weight so they don't
   compete visually.
   ------------------------------------------------------------ */
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

// The linear progress flow shown in the "Update Order Status" stepper.
// awaiting_payment / cancelled sit outside this normal flow so they are excluded.
const STEP_FLOW = ["pending", "confirmed", "preparing", "cooking", "ready", "delivering", "completed"];
const STEP_LABEL = {
    pending: "New",
    confirmed: "Confirmed",
    preparing: "Preparing",
    cooking: "Cooking",
    ready: "Ready",
    delivering: "Delivering",
    completed: "Completed",
};
// Label shown on the primary "advance" button for the CURRENT status
// (i.e. the action that moves the order out of this status).
const NEXT_ACTION_LABEL = {
    pending: "Confirm Order",
    confirmed: "Kitchen Receive",
    preparing: "Start Cooking",
    cooking: "Mark as Ready",
    ready: "Start Delivery",
    delivering: "Mark as Completed",
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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "VND" }).format(amount);
};

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-US", { hour12: true });
};

const resolveOrderId = (order) => order?.id;
const resolveCustomerName = (order) => order?.user_name || (order?.user ? `User #${order.user}` : "Guest");
const resolveStatus = (order) => String(order?.status || "pending").toLowerCase();

// Small helper so every badge in the file renders the same pill style.
const StatusBadge = ({ status, label }) => {
    const cfg = STATUS_STYLE[status] || STATUS_STYLE.pending;
    return <span style={styles.statusBadge(cfg.bg, cfg.color, cfg.bold)}>{label}</span>;
};

/* ============================ EDIT MODAL ============================ */
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
                    title: "Failed to load order details",
                    text: error?.response?.data?.message || "Please try again.",
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
            MySwal.fire({ title: "Updated successfully", icon: "success", timer: 1500, showConfirmButton: false });
            onSaved();
        } catch (error) {
            console.error("Save order failed", error);
            MySwal.fire({
                title: "Update failed",
                text: error?.response?.data?.message || "Could not save the order.",
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
                                Edit Order
                            </h5>
                            <small className="text-muted">Order #{orderId}</small>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body" style={styles.modalBody}>

                        {loading || !form ? (
                            <div className="text-center py-4">Loading data...</div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <label className="form-label" style={styles.formLabel}>Table (leave blank for delivery)</label>
                                    <input
                                        className="form-control"
                                        style={styles.formControl}
                                        value={form.table ?? ""}
                                        onChange={handleChange("table")}
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={styles.formLabel}>Status</label>
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
                                        <label className="form-label" style={styles.formLabel}>Subtotal</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.subtotal}
                                            onChange={handleChange("subtotal")}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Shipping Fee</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.shipping_fee}
                                            onChange={handleChange("shipping_fee")}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Discount</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.discount_amount}
                                            onChange={handleChange("discount_amount")}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="form-label" style={styles.formLabel}>Voucher Code</label>
                                        <input
                                            className="form-control"
                                            style={styles.formControl}
                                            value={form.voucher_code}
                                            onChange={handleChange("voucher_code")}
                                            placeholder="e.g. SALE10"
                                        />
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                    <div className="modal-footer" style={styles.modalFooter}>
                        <button type="button" className="btn btn-light rounded-pill px-3" onClick={onClose} disabled={saving}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-primary rounded-pill px-3" onClick={handleSave} disabled={loading || saving}>
                            {saving ? (
                                <><i className="bi bi-arrow-repeat me-1"></i>Saving...</>
                            ) : (
                                <><i className="bi bi-check2 me-1"></i>Save Changes</>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* ============================ DELETE MODAL ============================ */
const DeleteOrderModal = ({ order, onClose, onDeleted }) => {
    const MySwal = withReactContent(Swal);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${ADMIN_ORDERS_API}${resolveOrderId(order)}/`, { headers: getHeaders() });
            MySwal.fire({ title: "Order deleted", icon: "success", timer: 1400, showConfirmButton: false });
            onDeleted();
        } catch (error) {
            console.error("Delete order failed", error);
            MySwal.fire({
                title: "Delete failed",
                text: error?.response?.data?.message || "Could not delete the order.",
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
                                Confirm Delete Order
                            </h5>
                            <small className="text-muted">Order #{resolveOrderId(order)}</small>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body" style={styles.modalBody}>
                        <p className="mb-2" style={{ fontSize: "0.95rem" }}>
                            Are you sure you want to delete the order from <strong>{resolveCustomerName(order)}</strong>?
                        </p>
                        <div style={styles.deleteWarnBox}>
                            <small className="text-danger d-flex align-items-center">
                                <i className="bi bi-info-circle me-2"></i>
                                This action <strong className="mx-1">cannot be undone</strong>. The data will be permanently deleted.
                            </small>
                        </div>
                    </div>
                    <div className="modal-footer" style={styles.modalFooter}>
                        <button type="button" className="btn btn-light rounded-pill px-3" onClick={onClose} disabled={deleting}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-danger rounded-pill px-3" onClick={handleDelete} disabled={deleting}>
                            {deleting ? (
                                <><i className="bi bi-arrow-repeat me-1"></i>Deleting...</>
                            ) : (
                                <><i className="bi bi-trash me-1"></i>Delete Permanently</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ============================ ORDER DETAILS PANEL ============================ */
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
                title: "Failed to load order details",
                text: error?.response?.data?.message || "Please try again.",
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
                confirmButtonText: "Yes, go back",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc3545",
            });
            if (!result.isConfirmed) return;
        }
        setUpdating(true);
        try {
            await axios.patch(`${ADMIN_ORDERS_API}${orderId}/`, { status: nextStatus }, { headers: getHeaders() });
            MySwal.fire({ title: "Status updated", icon: "success", timer: 1200, showConfirmButton: false });
            await fetchDetail();
            onStatusChanged();
        } catch (error) {
            console.error("Update status failed", error);
            MySwal.fire({
                title: "Update failed",
                text: error?.response?.data?.message || "Could not update order status.",
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
            confirmMessage: `Move this order back to "${STEP_LABEL[STEP_FLOW[stepIndex - 1]]}"?`,
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
                        <h5 className="mb-0" style={{ fontWeight: 700, color: "#ff7a30" }}>
                            Order Details
                        </h5>
                    </div>
                </div>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div style={styles.detailPanelBody}>
                {loading || !order ? (
                    <div className="text-center py-4">Loading order details...</div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                            <h4 className="mb-0" style={{ fontWeight: 700, color: "#ff7a30" }}>
                                #{order?.pay_code || resolveOrderId(order)}
                            </h4>
                            <StatusBadge status={status} label={order?.status_display || STATUS_LABEL[status] || status} />
                        </div>
                        <small className="text-muted d-block mb-3">
                            Order time: {formatDate(order?.created_at)}
                        </small>

                        {/* Customer Information */}
                        <div style={styles.sectionLabel}>Customer Information</div>
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
                                <i className="bi bi-geo-alt"></i> {order?.table ? `Table ${order.table}` : (order?.address || "Delivery")}
                            </small>
                        </div>

                        {/* Order Items */}
                        <div style={styles.sectionLabel}>Order Items ({items.length})</div>
                        <div className="mb-3">
                            {items.length === 0 ? (
                                <small className="text-muted">No item details available.</small>
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

                        {/* Totals */}
                        {/* Totals */}
                        <div className="border-top pt-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Subtotal</small>
                                <small style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Delivery Fee</small>
                                <small style={{ fontWeight: 500 }}>{formatCurrency(shippingFee)}</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Discount</small>
                                <small className="text-danger" style={{ fontWeight: 500 }}>-{formatCurrency(discount)}</small>
                            </div>
                            <div
                                className="d-flex justify-content-between align-items-center mt-3 pt-3"
                                style={{ borderTop: "1px dashed #e9ecef" }}
                            >
                                <strong style={{ fontSize: "0.95rem" }}>Total Amount</strong>
                                <strong className="text-danger" style={{ fontSize: "1.05rem" }}>{formatCurrency(total)}</strong>
                            </div>
                        </div>

                        {/* Status stepper */}
                        {isInFlow ? (
                            <>
                                <div style={styles.sectionLabel}>Update Order Status</div>
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
                                    {updating ? "Updating..." : (stepIndex >= STEP_FLOW.length - 1 ? "Completed" : NEXT_ACTION_LABEL[status])}
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
                                        Back to "{STEP_LABEL[STEP_FLOW[stepIndex - 1]]}"
                                    </button>
                                )}

                                <small className="text-muted d-block mt-2">
                                    Note: use "Back" only to undo a wrong click — it will revert to the previous status.
                                </small>
                            </>
                        ) : (
                            <div className="alert alert-secondary py-2 px-3 mb-0 rounded-4" style={{ fontSize: "0.85rem" }}>
                                This order is <strong>{STATUS_LABEL[status] || status}</strong> and is outside the normal
                                status flow, so it can't be advanced or reverted here.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* ============================ MAIN LIST ============================ */
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
                title: "Failed to load orders",
                text: error?.response?.data?.message || "Could not load the order list.",
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

    // Only show cards with a value > 0
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
                <td style={{ ...styles.tableCell, fontWeight: 600, color: "#000000" }}>#{orderId}</td>
                <td style={styles.tableCell}>
                    <div className="d-flex flex-column">
                        <strong style={{ fontSize: "0.9rem" }}>{resolveCustomerName(order)}</strong>
                        <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                            {order?.table ? `Table ${order.table}` : "Delivery"}
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
                            className="btn btn-sm btn-outline-warning rounded-pill"
                            style={styles.actionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditOrderId(orderId);
                            }}
                            title="Edit order"
                        >
                            <i className="bi bi-pencil-square"></i>
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            style={styles.actionBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteOrder(order);
                            }}
                            title="Delete order"
                        >
                            <i className="bi bi-trash"></i>
                            <span>Delete</span>
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
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
                    <div className="page-title">
                        <h4>Orders</h4>
                        <h6 className="text-muted">Manage orders and their statuses.</h6>
                    </div>
                </div>

                {/* Only render cards with a value > 0 (All Orders always shown) */}
                <div className="row g-3 mb-4">
                    {total > 0 && (
                        <div className="col-6 col-md-4 col-xl-2">
                            <div className="card shadow-sm border-0 h-100 rounded-4">
                                <div className="card-body">
                                    <p className="text-muted mb-2">All Orders</p>
                                    <h3 className="mb-0">{loading ? "..." : total}</h3>
                                </div>
                            </div>
                        </div>
                    )}
                    {visibleStatusCards.map((status) => (
                        <div key={status} className="col-6 col-md-4 col-xl-2">
                            <div className="card shadow-sm border-0 h-100 rounded-4">
                                <div className="card-body">
                                    <StatusBadge status={status} label={STATUS_LABEL[status]} />
                                    <h3 className="mb-0 mt-2">{statusCounts[status]}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main content: order list + order details side panel */}
                <div className="d-flex align-items-start gap-3">
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                                                placeholder="Search by ID, customer name, payment code..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <select className="form-select rounded-pill" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                            <option value="all">All Status</option>
                                            {STATUS_ORDER.map((status) => (
                                                <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2 text-end">
                                        <button className="btn btn-outline-secondary w-100 rounded-pill" onClick={() => loadOrders(page)} disabled={loading}>
                                            Refresh
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
                                                <th style={styles.tableHeadCell}>Customer</th>
                                                <th style={styles.tableHeadCell}>Pay Code</th>
                                                <th style={styles.tableHeadCell}>Items</th>
                                                <th style={styles.tableHeadCell}>Subtotal</th>
                                                <th style={styles.tableHeadCell}>Shipping</th>
                                                <th style={styles.tableHeadCell}>Discount</th>
                                                <th style={styles.tableHeadCell}>Total</th>
                                                <th style={styles.tableHeadCell}>Time</th>
                                                <th style={styles.tableHeadCell}>Status</th>
                                                <th style={{ ...styles.tableHeadCell, textAlign: "center" }}>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan={11} className="text-center py-4">Loading...</td></tr>
                                            ) : filteredOrders.length === 0 ? (
                                                <tr><td colSpan={11} className="text-center py-4">No orders found.</td></tr>
                                            ) : (
                                                filteredOrders.map((order) => renderOrderRow(order))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                                <small className="text-muted">Page {page}/{totalPages} — {total} orders total</small>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-secondary rounded-pill" disabled={page <= 1 || loading} onClick={() => loadOrders(page - 1)}>
                                        Previous
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary rounded-pill" disabled={page >= totalPages || loading} onClick={() => loadOrders(page + 1)}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

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
