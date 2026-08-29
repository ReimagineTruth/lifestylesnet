import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH =
  process.env["DATABASE_URL"]?.replace(/^file:/, "") ?? path.join(DB_DIR, "lifestyles.db");

let sqlite: Database.Database | undefined;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
let ready = false;

function runMigrations(database: Database.Database) {
  database.exec(`
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

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

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
      balance_after INTEGER NOT NULL,
      status TEXT NOT NULL,
      reference TEXT,
      paymongo_intent_id TEXT,
      paypal_order_id TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_wallet_tx_customer ON wallet_transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_wallet_tx_intent ON wallet_transactions(paymongo_intent_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_order_lines_order ON order_lines(order_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_messages_thread ON feedback_messages(thread_id);
  `);
  ensureColumn(database, "orders", "paymongo_intent_id", "TEXT");
  ensureColumn(database, "orders", "paypal_order_id", "TEXT");
  ensureColumn(database, "orders", "bank_code", "TEXT");
  ensureColumn(database, "orders", "customer_id", "TEXT");
  ensureColumn(database, "orders", "wallet_applied", "INTEGER NOT NULL DEFAULT 0");
}

function ensureColumn(database: Database.Database, table: string, column: string, type: string) {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

export function getDb() {
  if (!dbInstance) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    runMigrations(sqlite);
    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

export async function ensureDbReady() {
  if (ready) return getDb();
  const db = getDb();
  await seedIfEmpty(db);
  ready = true;
  return db;
}

export { schema };
