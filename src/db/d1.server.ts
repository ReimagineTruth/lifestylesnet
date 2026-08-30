import { drizzle } from "drizzle-orm/d1";
import { BASE_SCHEMA_SQL, ORDER_COLUMN_MIGRATIONS } from "./migrations-sql";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
};

type D1Database = {
  prepare(query: string): D1Statement;
  exec(query: string): Promise<unknown>;
};

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
let ready = false;
let migrated = false;

async function ensureColumn(d1: D1Database, table: string, column: string, type: string) {
  const result = await d1.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  const cols: { name: string }[] = Array.isArray(result)
    ? (result as { name: string }[])
    : (result.results ?? []);
  if (!cols.some((c: { name: string }) => c.name === column)) {
    await d1.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
  }
}

async function runMigrations(d1: D1Database) {
  if (migrated) return;
  await d1.exec(BASE_SCHEMA_SQL);
  for (const migration of ORDER_COLUMN_MIGRATIONS) {
    await ensureColumn(d1, migration.table, migration.column, migration.type);
  }
  migrated = true;
}

export async function ensureD1DbReady(d1: D1Database) {
  await runMigrations(d1);
  if (!dbInstance) {
    dbInstance = drizzle(d1, { schema });
  }
  if (!ready) {
    await seedIfEmpty(dbInstance);
    ready = true;
  }
  return dbInstance;
}
