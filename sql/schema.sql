-- Lifestyles Philippines store schema (SQLite)
-- Auto-applied on server start via src/db/index.ts

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
  total INTEGER NOT NULL
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
