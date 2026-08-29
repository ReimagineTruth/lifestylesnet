import { Link, createFileRoute } from "@tanstack/react-router";
import { Loader2, LogOut, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { WalletTopupSection } from "@/components/account/WalletTopupSection";
import {
  clearCustomerToken,
  loadCustomerToken,
  saveCustomerToken,
  type CustomerProfile,
} from "@/lib/customer-auth";
import {
  customerLoginFn,
  customerLogoutFn,
  customerRegisterFn,
  verifyCustomerFn,
} from "@/lib/customer-auth.server";
import { saveCustomerEmail, type Order } from "@/lib/orders";
import { peso } from "@/lib/products";
import { getWalletSummaryFn, confirmWalletTopupFn } from "@/lib/wallet.server";
import type { WalletTransactionView } from "@/lib/wallet";
import { listOrdersByEmailFn } from "@/lib/orders.server";

const searchSchema = z.object({
  topup: z.string().optional(),
  status: z.enum(["success", "cancel"]).optional(),
});

export const Route = createFileRoute("/account")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "My Account | Lifestyles Philippines" },
      {
        name: "description",
        content: "Manage your Lifestyles account, wallet balance, and orders.",
      },
      { property: "og:title", content: "My Account | Lifestyles Philippines" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

type AuthMode = "login" | "register";

function AccountPage() {
  const search = Route.useSearch();
  const register = useServerFn(customerRegisterFn);
  const login = useServerFn(customerLoginFn);
  const logout = useServerFn(customerLogoutFn);
  const verify = useServerFn(verifyCustomerFn);
  const walletSummary = useServerFn(getWalletSummaryFn);
  const confirmTopup = useServerFn(confirmWalletTopupFn);
  const listOrders = useServerFn(listOrdersByEmailFn);

  const [token, setToken] = useState("");
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionView[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [showTopup, setShowTopup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const refreshWallet = useCallback(
    (sessionToken: string) => {
      void walletSummary({ data: sessionToken }).then(({ balance, transactions: txs }) => {
        setTransactions(txs);
        setCustomer((prev) => (prev ? { ...prev, balance } : prev));
      });
    },
    [walletSummary],
  );

  useEffect(() => {
    const saved = loadCustomerToken();
    if (!saved) {
      setLoading(false);
      return;
    }
    setToken(saved);
    void verify({ data: saved })
      .then((profile) => {
        if (!profile) {
          clearCustomerToken();
          return;
        }
        setCustomer(profile);
        saveCustomerEmail(profile.email);
        refreshWallet(saved);
        void listOrders({ data: profile.email }).then(setOrders);
      })
      .finally(() => setLoading(false));
  }, [verify, refreshWallet, listOrders]);

  useEffect(() => {
    if (!search.topup || !token || !customer) return;
    if (search.status === "cancel") {
      toast.error("Top-up was cancelled.");
      return;
    }
    void confirmTopup({ data: { token, topupId: search.topup } })
      .then((result) => {
        if (result.paid) {
          toast.success("Top-up confirmed! Na-credit na ang wallet mo.");
          setCustomer((prev) => (prev ? { ...prev, balance: result.balance } : prev));
          refreshWallet(token);
        } else {
          toast.message("Checking payment… refresh in a moment if balance has not updated.");
        }
      })
      .catch(() => {});
  }, [search.topup, search.status, token, customer, confirmTopup, refreshWallet]);

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    const action =
      authMode === "register"
        ? register({
            data: {
              name,
              email,
              password,
              ...(phone ? { phone } : {}),
            },
          })
        : login({ data: { email, password } });

    void action
      .then((result) => {
        saveCustomerToken(result.token);
        setToken(result.token);
        setCustomer(result.customer);
        saveCustomerEmail(result.customer.email);
        refreshWallet(result.token);
        void listOrders({ data: result.customer.email }).then(setOrders);
        toast.success(authMode === "register" ? "Account created!" : "Welcome back!");
      })
      .catch((err: Error) => toast.error(err.message || "Could not sign in."))
      .finally(() => setAuthBusy(false));
  }

  function signOut() {
    if (token) void logout({ data: token }).catch(() => {});
    clearCustomerToken();
    setToken("");
    setCustomer(null);
    setOrders([]);
    setTransactions([]);
  }

  if (loading) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container-page py-16 md:py-20">
        <h1 className="text-4xl font-semibold">My account</h1>
        <p className="lead mt-4 max-w-xl">
          Gumawa ng account para mag-top up ng wallet at magbayad gamit ang balance mo sa checkout.
        </p>

        <div className="mt-8 flex gap-2">
          {(["login", "register"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                authMode === mode ? "bg-brand text-brand-foreground" : "border border-border"
              }`}
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleAuthSubmit}
          className="mt-8 max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
        >
          {authMode === "register" && (
            <>
              <label className="block text-sm font-semibold">
                Full name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-semibold">
                Phone (optional)
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
            </>
          )}
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              required
              minLength={authMode === "register" ? 8 : 1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={authBusy}
            className="w-full rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            {authMode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container-page py-16 md:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2">Kumusta, {customer.name}</h1>
          <p className="mt-2 text-muted-foreground">{customer.email}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet balance</p>
              <p className="text-3xl font-semibold tabular-nums">{peso(customer.balance)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTopup((v) => !v)}
            className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            {showTopup ? "Hide top-up" : "Top up wallet"}
          </button>
          <p className="mt-3 text-sm text-muted-foreground">
            Gamitin ang balance mo sa checkout — piliin ang &quot;Wallet balance&quot;.
          </p>
        </div>

        <div>
          {showTopup && (
            <WalletTopupSection
              token={token}
              onComplete={(balance) => {
                setCustomer((prev) => (prev ? { ...prev, balance } : prev));
                refreshWallet(token);
                setShowTopup(false);
              }}
            />
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Recent wallet activity</h2>
        {transactions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No wallet transactions yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium capitalize">
                    {tx.type} · {tx.status}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString("en-PH")}
                    {tx.reference ? ` · ${tx.reference}` : ""}
                  </p>
                </div>
                <p className={`font-semibold ${tx.amount >= 0 ? "text-brand" : "text-foreground"}`}>
                  {tx.amount >= 0 ? "+" : ""}
                  {peso(Math.abs(tx.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">My orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div>
                  <p className="font-semibold">{o.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-PH")} · {o.paymentMethod}
                  </p>
                </div>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold capitalize text-brand">
                  {o.status}
                </span>
                <p className="font-semibold">{peso(o.total)}</p>
                <Link
                  to="/order/$id"
                  params={{ id: o.id }}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
