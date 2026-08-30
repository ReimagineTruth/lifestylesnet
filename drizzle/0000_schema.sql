-- Lifestyles Philippines store schema (SQLite / D1)
-- Applied by wrangler d1 migrations; runtime also migrates via d1.server.ts

CREATE TABLE IF NOT EXISTS products (
  slug TEXT PRIMARY KEY,
  cate_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  image TEXT NOT NULL,
  short TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  directions TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL REFERENCES products(slug),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  points INTEGER NOT NULL,
  price INTEGER NOT NULL,
  size TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_province TEXT NOT NULL,
  customer_postal TEXT NOT NULL,
  customer_notes TEXT,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  total INTEGER NOT NULL,
  wallet_applied INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  variant_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback_threads (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES feedback_threads(id),
  text TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_name TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_lines_order ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_thread ON feedback_messages(thread_id);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_sessions (
  token TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
  customer_id TEXT PRIMARY KEY REFERENCES customers(id),
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER,
  status TEXT NOT NULL,
  payment_method TEXT,
  paymongo_intent_id TEXT,
  paypal_order_id TEXT,
  reference TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_customer ON wallet_transactions(customer_id);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
