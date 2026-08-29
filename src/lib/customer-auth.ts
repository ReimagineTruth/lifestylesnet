export const CUSTOMER_TOKEN_KEY = "lifestyles-ph-customer-token";

export type CustomerProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  balance: number;
};

export function saveCustomerToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function loadCustomerToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CUSTOMER_TOKEN_KEY) ?? "";
}

export function clearCustomerToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}
