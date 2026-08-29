import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AdminPortal, ADMIN_TOKEN_KEY } from "@/components/admin/AdminPortal";
import { adminLoginFn, verifyAdminFn } from "@/lib/orders.server";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Lifestyles Philippines" },
      { name: "description", content: "Manage orders, payments, customers and inventory." },
      { property: "og:title", content: "Admin Portal | Lifestyles Philippines" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const login = useServerFn(adminLoginFn);
  const verifyAdmin = useServerFn(verifyAdminFn);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (!saved) {
      setAuthReady(true);
      return;
    }
    void verifyAdmin({ data: saved }).then((ok) => {
      if (ok) setToken(saved);
      else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setAuthReady(true);
    });
  }, [verifyAdmin]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <form
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            void login({ data: password })
              .then((session) => {
                sessionStorage.setItem(ADMIN_TOKEN_KEY, session.token);
                setToken(session.token);
                toast.success("Welcome to the admin portal");
              })
              .catch(() => toast.error("Invalid admin password"));
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Lifestyles Philippines</p>
          <h1 className="mt-2 text-3xl font-semibold">Admin Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Full control over orders, payments, customers, feedback and catalogue.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="mt-8 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            Sign in
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Default password: lifestyles-admin (set ADMIN_PASSWORD in .env)
          </p>
        </form>
      </div>
    );
  }

  return (
    <AdminPortal
      token={token}
      onSignOut={() => {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
      }}
    />
  );
}
