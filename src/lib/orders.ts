export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type OrderLine = { slug: string; name: string; qty: number; price: number };

export type Order = {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postal: string;
    notes?: string;
  };
  paymentMethod: "cod" | "bank" | "gcash";
  reference?: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
};

const KEY = "lifestyles-ph-orders";

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  window.localStorage.setItem(KEY, JSON.stringify(orders));
}

export function addOrder(order: Order) {
  const all = loadOrders();
  saveOrders([order, ...all]);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const all = loadOrders().map((o) => (o.id === id ? { ...o, status } : o));
  saveOrders(all);
  return all;
}

export function newOrderId() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `LS-${new Date().getFullYear()}-${n}`;
}

export const SHIPPING_FLAT = 150;
export const FREE_SHIPPING_THRESHOLD = 3000;
