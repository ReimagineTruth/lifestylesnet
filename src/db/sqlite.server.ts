import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { BASE_SCHEMA_SQL, ORDER_COLUMN_MIGRATIONS } from "./migrations-sql";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH =
  process.env["DATABASE_URL"]?.replace(/^file:/, "") ?? path.join(DB_DIR, "lifestyles.db");

let sqlite: Database.Database | undefined;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
let ready = false;

function ensureColumn(database: Database.Database, table: string, column: string, type: string) {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

function runMigrations(database: Database.Database) {
  database.exec(BASE_SCHEMA_SQL);
  for (const migration of ORDER_COLUMN_MIGRATIONS) {
    ensureColumn(database, migration.table, migration.column, migration.type);
  }
}

export function getSqliteDb() {
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

export async function ensureSqliteDbReady() {
  if (ready) return getSqliteDb();
  const db = getSqliteDb();
  await seedIfEmpty(db);
  ready = true;
  return db;
}
