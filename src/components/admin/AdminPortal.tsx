import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import type { AdminDashboardStats, Order, OrderStatus } from "@/lib/orders";
import { useAllFeedback } from "@/hooks/use-feedback";
import { tl } from "@/lib/tagalog";
import { Switch } from "@/components/ui/switch";
import { allVariants, isTestProductSlug, peso } from "@/lib/products";
import {
  getAdminDashboardFn,
  listAllOrdersFn,
  updateOrderAdminFn,
} from "@/lib/orders.server";
import { getTestProductVisibleFn, setTestProductVisibleFn } from "@/lib/settings.server";
import { listFeedbackThreadsFn, sendFeedbackMessageFn } from "@/lib/feedback.server";

const ADMIN_TOKEN_KEY = "lifestyles-ph-admin-token";
const statuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];
const paymentMethods = [
  "cod",
  "qr_ph",
  "gcash",
  "maya",
  "grab_pay",
  "shopee_pay",
  "billease",
  "bank",
  "card",
  "paypal",
] as const;

const paymentMethodLabels: Record<(typeof paymentMethods)[number], string> = {
  cod: "COD",
  qr_ph: "QR Ph",
  gcash: "GCash",
  maya: "Maya",
  grab_pay: "GrabPay",
  shopee_pay: "ShopeePay",
  billease: "BillEase",
  bank: "Online banking",
  card: "Card",
  paypal: "PayPal",
};

type Tab = "overview" | "orders" | "customers" | "feedback" | "catalogue";

type FeedbackThreadSummary = {
  threadId: string;
  lastMessage: { text: string; createdAt: string; name?: string };
  count: number;
};

type Props = {
  token: string;
  onSignOut: () => void;
};

export function AdminPortal({ token, onSignOut }: Props) {
  const listOrders = useServerFn(listAllOrdersFn);
  const getDashboard = useServerFn(getAdminDashboardFn);
  const updateOrder = useServerFn(updateOrderAdminFn);
  const listThreads = useServerFn(listFeedbackThreadsFn);
  const sendReply = useServerFn(sendFeedbackMessageFn);

  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [threads, setThreads] = useState<FeedbackThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<(typeof paymentMethods)[number] | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");
  const [editReference, setEditReference] = useState("");
  const [feedbackThread, setFeedbackThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const { data: allFeedback = [], refetch: refetchFeedback } = useAllFeedback(token);

  const refresh = async () => {
    setLoading(true);
    try {
      const [nextOrders, nextStats, nextThreads] = await Promise.all([
        listOrders({ data: token }),
        getDashboard({ data: token }),
        listThreads({ data: token }),
      ]);
      setOrders(nextOrders);
      setStats(nextStats);
      setThreads(
        nextThreads.map((thread) => ({
          threadId: thread.threadId,
          count: thread.count,
          lastMessage: {
            text: thread.lastMessage.text,
            createdAt: thread.lastMessage.createdAt,
            ...(thread.lastMessage.name ? { name: thread.lastMessage.name } : {}),
          },
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 10000);
    return () => clearInterval(interval);
  }, [token, listOrders, getDashboard, listThreads]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (paymentFilter !== "all" && o.paymentMethod !== paymentFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { email: string; name: string; phone: string; orders: number; spent: number; lastOrder: string }
    >();
    for (const o of orders) {
      const key = o.customer.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
        if (o.status !== "cancelled") existing.spent += o.total;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        map.set(key, {
          email: o.customer.email,
          name: o.customer.name,
          phone: o.customer.phone,
          orders: 1,
          spent: o.status !== "cancelled" ? o.total : 0,
          lastOrder: o.createdAt,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.lastOrder.localeCompare(a.lastOrder));
  }, [orders]);

  const threadMessages = feedbackThread
    ? allFeedback
        .filter((m) => m.threadId === feedbackThread)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditReference(order.reference ?? "");
  };

  const saveOrder = async () => {
    if (!selectedOrder) return;
    const updated = await updateOrder({
      data: {
        token,
        id: selectedOrder.id,
        status: editStatus,
        reference: editReference,
      },
    });
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
    toast.success(`Order ${updated.id} updated`);
    void refresh();
  };

  const exportCsv = () => {
    const header = "Order ID,Date,Customer,Email,Phone,Status,Payment,Total,City,Province";
    const rows = filteredOrders.map((o) =>
      [
        o.id,
        o.createdAt,
        `"${o.customer.name}"`,
        o.customer.email,
        o.customer.phone,
        o.status,
        o.paymentMethod,
        o.total,
        `"${o.customer.city}"`,
        `"${o.customer.province}"`,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifestyles-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "catalogue", label: "Catalogue", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b border-border bg-background">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-brand">
              Lifestyles PH
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Admin Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === id ? "bg-brand text-brand-foreground" : "hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "orders" && stats && stats.pending > 0 && (
                <span className="ml-auto rounded-full bg-background/20 px-2 py-0.5 text-xs lg:ml-0">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        <main className="min-w-0">
          {tab === "overview" && stats && (
            <OverviewTab stats={stats} orders={orders.slice(0, 8)} onViewOrder={openOrder} />
          )}

          {tab === "orders" && (
            <OrdersTab
              orders={filteredOrders}
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              paymentFilter={paymentFilter}
              onPaymentFilterChange={setPaymentFilter}
              onSelectOrder={openOrder}
              onExport={exportCsv}
            />
          )}

          {tab === "customers" && <CustomersTab customers={customers} onSelectEmail={(email) => {
            setTab("orders");
            setSearch(email);
          }} />}

          {tab === "feedback" && (
            <FeedbackTab
              threads={threads}
              feedbackThread={feedbackThread}
              onSelectThread={setFeedbackThread}
              threadMessages={threadMessages}
              reply={reply}
              onReplyChange={setReply}
              onSendReply={() => {
                if (!reply.trim() || !feedbackThread) return;
                void sendReply({
                  data: { threadId: feedbackThread, text: reply.trim(), from: "support" },
                }).then(async () => {
                  setReply("");
                  toast.success(tl.toast.replySent);
                  await refetchFeedback();
                  await refresh();
                });
              }}
            />
          )}

          {tab === "catalogue" && <CatalogueTab orders={orders} token={token} />}
        </main>
      </div>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          editStatus={editStatus}
          editReference={editReference}
          onStatusChange={setEditStatus}
          onReferenceChange={setEditReference}
          onClose={() => setSelectedOrder(null)}
          onSave={() => void saveOrder()}
        />
      )}
    </div>
  );
}

export { ADMIN_TOKEN_KEY };

function OverviewTab({
  stats,
  orders,
  onViewOrder,
}: {
  stats: AdminDashboardStats;
  orders: Order[];
  onViewOrder: (o: Order) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Overview</h1>
        <p className="mt-1 text-muted-foreground">Real-time store performance from SQL database.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Gross revenue" value={peso(stats.revenue)} highlight />
        <StatCard label="Orders today" value={String(stats.ordersToday)} />
        <StatCard label="Feedback threads" value={String(stats.feedbackThreads)} />
        <StatCard label="Pending" value={String(stats.pending)} />
        <StatCard label="Paid" value={String(stats.paid)} />
        <StatCard label="Shipped" value={String(stats.shipped)} />
        <StatCard label="Delivered" value={String(stats.delivered)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Payment methods</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>COD</dt><dd>{stats.byPayment.cod}</dd></div>
            <div className="flex justify-between"><dt>QR Ph</dt><dd>{stats.byPayment.qr_ph}</dd></div>
            <div className="flex justify-between"><dt>GCash</dt><dd>{stats.byPayment.gcash}</dd></div>
            <div className="flex justify-between"><dt>Maya</dt><dd>{stats.byPayment.maya}</dd></div>
            <div className="flex justify-between"><dt>Online banking</dt><dd>{stats.byPayment.bank}</dd></div>
            <div className="flex justify-between"><dt>Card</dt><dd>{stats.byPayment.card}</dd></div>
            <div className="flex justify-between"><dt>PayPal</dt><dd>{stats.byPayment.paypal}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt>Cancelled</dt><dd>{stats.cancelled}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Recent orders</h2>
          <ul className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <li className="text-sm text-muted-foreground">No orders yet.</li>
            ) : (
              orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                  <button type="button" onClick={() => onViewOrder(o)} className="font-medium hover:underline">
                    {o.id}
                  </button>
                  <span className="capitalize text-muted-foreground">{o.status}</span>
                  <span className="font-semibold">{peso(o.total)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  onSelectOrder,
  onExport,
}: {
  orders: Order[];
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: OrderStatus | "all";
  onStatusFilterChange: (v: OrderStatus | "all") => void;
  paymentFilter: (typeof paymentMethods)[number] | "all";
  onPaymentFilterChange: (v: (typeof paymentMethods)[number] | "all") => void;
  onSelectOrder: (o: Order) => void;
  onExport: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="mt-1 text-muted-foreground">{orders.length} order(s) matching filters</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-55 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order ID, name, email, phone…"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as OrderStatus | "all")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => onPaymentFilterChange(e.target.value as typeof paymentFilter)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
        >
          <option value="all">All payments</option>
          {paymentMethods.map((p) => (
            <option key={p} value={p}>{paymentMethodLabels[p]}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-200 text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => onSelectOrder(o)}
                >
                  <td className="px-4 py-3 font-medium">{o.id}</td>
                  <td className="px-4 py-3">
                    {o.customer.name}
                    <span className="block text-xs text-muted-foreground">
                      {o.customer.city}, {o.customer.province}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.customer.email}
                    <span className="block">{o.customer.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString("en-PH")}
                  </td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">
                    {o.paymentMethod}
                    {o.reference && (
                      <span className="block text-[10px] normal-case">Ref: {o.reference}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">{peso(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersTab({
  customers,
  onSelectEmail,
}: {
  customers: {
    email: string;
    name: string;
    phone: string;
    orders: number;
    spent: number;
    lastOrder: string;
  }[];
  onSelectEmail: (email: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="mt-1 text-muted-foreground">{customers.length} unique customer(s) from orders.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spent</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.email}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => onSelectEmail(c.email)}
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3 font-semibold">{peso(c.spent)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.lastOrder).toLocaleDateString("en-PH")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackTab({
  threads,
  feedbackThread,
  onSelectThread,
  threadMessages,
  reply,
  onReplyChange,
  onSendReply,
}: {
  threads: FeedbackThreadSummary[];
  feedbackThread: string | null;
  onSelectThread: (id: string) => void;
  threadMessages: { id: string; text: string; from: string; createdAt: string }[];
  reply: string;
  onReplyChange: (v: string) => void;
  onSendReply: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Feedback</h1>
        <p className="mt-1 text-muted-foreground">Tagalog customer messages — synced from database.</p>
      </div>
      {threads.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Wala pang feedback.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2 rounded-xl border border-border bg-card p-3">
            {threads.map((t) => (
              <button
                key={t.threadId}
                type="button"
                onClick={() => onSelectThread(t.threadId)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  feedbackThread === t.threadId ? "bg-brand-soft" : "hover:bg-muted"
                }`}
              >
                <p className="font-medium truncate">
                  {t.lastMessage.name ?? `Thread ${t.threadId.slice(0, 8)}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">{t.lastMessage.text}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(t.lastMessage.createdAt).toLocaleString("fil-PH")} · {t.count} msg
                </p>
              </button>
            ))}
          </div>
          {feedbackThread ? (
            <div className="flex flex-col rounded-xl border border-border bg-card">
              <div className="max-h-96 flex-1 space-y-2 overflow-y-auto p-4">
                {threadMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.from === "user" ? "ml-auto bg-brand text-brand-foreground" : "mr-auto bg-muted"
                    }`}
                  >
                    <p>{m.text}</p>
                    <p className="mt-1 text-[10px] opacity-70">
                      {new Date(m.createdAt).toLocaleTimeString("fil-PH")}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2 border-t border-border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSendReply();
                }}
              >
                <input
                  value={reply}
                  onChange={(e) => onReplyChange(e.target.value)}
                  placeholder="Sumagot sa Tagalog…"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  disabled={!reply.trim()}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50"
                >
                  Ipadala
                </button>
              </form>
            </div>
          ) : (
            <p className="flex items-center justify-center rounded-xl border border-border bg-card p-10 text-muted-foreground">
              Select a thread to view messages.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CatalogueTab({ orders, token }: { orders: Order[]; token: string }) {
  const catalogue = allVariants();
  const fetchTestVisible = useServerFn(getTestProductVisibleFn);
  const saveTestVisible = useServerFn(setTestProductVisibleFn);
  const [testProductVisible, setTestProductVisible] = useState(true);
  const [savingTestToggle, setSavingTestToggle] = useState(false);

  useEffect(() => {
    void fetchTestVisible()
      .then(({ visible }) => setTestProductVisible(visible))
      .catch(() => {});
  }, [fetchTestVisible]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Catalogue</h1>
        <p className="mt-1 text-muted-foreground">All product bundles and sales from SQL.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">₱10 test product on shop</p>
          <p className="text-xs text-muted-foreground">
            Shows &quot;Test Checkout (₱10)&quot; on the storefront for payment testing. Turn off
            when you are done.
          </p>
        </div>
        <Switch
          checked={testProductVisible}
          disabled={savingTestToggle}
          onCheckedChange={(checked) => {
            setSavingTestToggle(true);
            void saveTestVisible({ data: { token, visible: checked } })
              .then(({ visible }) => {
                setTestProductVisible(visible);
                toast.success(
                  visible ? "Test product is visible on the shop." : "Test product hidden from shop.",
                );
              })
              .catch((err: Error) => toast.error(err.message || "Could not update setting."))
              .finally(() => setSavingTestToggle(false));
          }}
          aria-label="Show test product on shop"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Units sold</th>
              <th className="px-4 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {catalogue.map(({ product, variant }) => {
              const soldLines = orders
                .filter((o) => o.status !== "cancelled")
                .flatMap((o) => o.lines)
                .filter((l) => l.variantId === variant.id);
              const units = soldLines.reduce((n, l) => n + l.qty, 0);
              const rev = soldLines.reduce((n, l) => n + l.qty * l.price, 0);
              return (
                <tr key={variant.id} className={isTestProductSlug(product.slug) ? "bg-amber-50/50" : ""}>
                  <td className="px-4 py-3 font-medium">
                    {product.name}
                    {isTestProductSlug(product.slug) && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                        Test
                      </span>
                    )}
                    <span className="block text-xs font-normal text-muted-foreground">{variant.label}</span>
                  </td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">{variant.code}</td>
                  <td className="px-4 py-3">{variant.points}</td>
                  <td className="px-4 py-3">{peso(variant.price)}</td>
                  <td className="px-4 py-3">{units}</td>
                  <td className="px-4 py-3 font-semibold">{peso(rev)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderDrawer({
  order,
  editStatus,
  editReference,
  onStatusChange,
  onReferenceChange,
  onClose,
  onSave,
}: {
  order: Order;
  editStatus: OrderStatus;
  editReference: string;
  onStatusChange: (s: OrderStatus) => void;
  onReferenceChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const methodLabel: Record<string, string> = {
    cod: "Cash on delivery",
    qr_ph: "QR Ph (PayMongo)",
    gcash: "GCash (PayMongo)",
    maya: "Maya (PayMongo)",
    grab_pay: "GrabPay (PayMongo)",
    shopee_pay: "ShopeePay (PayMongo)",
    billease: "BillEase (PayMongo)",
    bank: "Online banking (PayMongo)",
    card: "Card (PayMongo)",
    paypal: "PayPal or card",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-lg flex-col bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{order.id}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("en-PH")}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Customer</h3>
            <p className="mt-2 text-sm">
              {order.customer.name}
              <br />
              {order.customer.email} · {order.customer.phone}
              <br />
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.province} {order.customer.postal}
            </p>
            {order.customer.notes && (
              <p className="mt-2 text-sm text-muted-foreground">Notes: {order.customer.notes}</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {order.lines.map((l) => (
                <li key={`${l.variantId}-${l.name}`} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {l.name} × {l.qty}
                    {l.code && <span className="block text-xs">SKU {l.code}</span>}
                  </span>
                  <span className="font-medium">{peso(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{peso(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : peso(order.shipping)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{peso(order.total)}</dd></div>
            </dl>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="font-semibold">Admin controls</h3>
            <p className="text-sm text-muted-foreground">
              Payment: {methodLabel[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <label className="block text-sm">
              <span className="font-medium">Order status</span>
              <select
                value={editStatus}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            {order.paymentMethod !== "cod" && (
              <label className="block text-sm">
                <span className="font-medium">Payment reference</span>
                <input
                  value={editReference}
                  onChange={(e) => onReferenceChange(e.target.value)}
                  placeholder="Bank/GCash reference number"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </label>
            )}
          </section>
        </div>

        <div className="flex gap-3 border-t border-border px-6 py-4">
          <Link
            to="/order/$id"
            params={{ id: order.id }}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View receipt
          </Link>
          <button
            type="button"
            onClick={onSave}
            className="ml-auto rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border border-border p-5 ${highlight ? "bg-brand-soft" : "bg-card"}`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colors[status]}`}>
      {status}
    </span>
  );
}
