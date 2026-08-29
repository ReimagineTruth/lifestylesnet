export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type OrderLine = {
  slug: string;
  variantId?: string;
  code?: string;
  name: string;
  qty: number;
  price: number;
};

export type PaymentMethod =
  | "cod"
  | "qr_ph"
  | "gcash"
  | "maya"
  | "grab_pay"
  | "shopee_pay"
  | "billease"
  | "bank"
  | "card"
  | "paypal"
  | "wallet";

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
  paymentMethod: PaymentMethod;
  reference?: string;
  paymongoIntentId?: string;
  paypalOrderId?: string;
  bankCode?: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
};

export type AdminDashboardStats = {
  totalOrders: number;
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
  ordersToday: number;
  feedbackThreads: number;
  byPayment: {
    cod: number;
    qr_ph: number;
    gcash: number;
    maya: number;
    grab_pay: number;
    shopee_pay: number;
    billease: number;
    bank: number;
    card: number;
    paypal: number;
    wallet: number;
  };
};

export function newOrderId() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `LS-${new Date().getFullYear()}-${n}`;
}

export const SHIPPING_FLAT = 150;
export const FREE_SHIPPING_THRESHOLD = 3000;

export const CUSTOMER_EMAIL_KEY = "lifestyles-ph-customer-email";

export function saveCustomerEmail(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_EMAIL_KEY, email.trim().toLowerCase());
}

export function loadCustomerEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CUSTOMER_EMAIL_KEY) ?? "";
}
