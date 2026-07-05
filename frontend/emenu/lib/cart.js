/**
 * Cart utility – thin wrapper around localStorage so components
 * don't duplicate read/write logic.
 */

const CART_KEY = 'cart';

function read() {
    try {
        const raw = localStorage.getItem(CART_KEY) || '[]';
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function write(items) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        window.dispatchEvent(new Event('cart-updated'));
    } catch { /* ignore quota errors */ }
}

function summary(items) {
    const list = items || read();
    const count = list.reduce((s, it) => s + (Number(it?.quantity) || 0), 0);
    const total = list.reduce((s, it) => s + (Number(it?.subtotal ?? it?.price) || 0), 0);
    return { count, total };
}

/**
 * Add an item or merge with an existing matching line.
 * Returns { count, total } after the operation.
 */
function addItem(item) {
    const items = read();
    const idx = items.findIndex(
        (it) =>
            String(it.id) === String(item.id) &&
            (item.variant_id
                ? String(it.variant_id) === String(item.variant_id)
                : !it.variant_id) &&
            JSON.stringify(it.extras || []) === JSON.stringify(item.extras || []) &&
            (it.note || '') === (item.note || '')
    );

    if (idx >= 0) {
        items[idx].quantity = (Number(items[idx].quantity) || 0) + (Number(item.quantity) || 1);
        items[idx].subtotal = items[idx].quantity * (Number(items[idx].price) || 0);
    } else {
        items.push({ ...item });
    }

    write(items);
    return summary(items);
}

/**
 * Remove all cart lines that match the given item id.
 * Returns { count, total } after the operation.
 */
function removeItem(id) {
    const items = read().filter((it) => String(it.id) !== String(id));
    write(items);
    return summary(items);
}

/** Clear entire cart. */
function clear() {
    write([]);
    return { count: 0, total: 0 };
}

const Cart = { read, write, summary, addItem, removeItem, clear };
export default Cart;
