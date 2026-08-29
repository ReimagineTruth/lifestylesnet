import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { ensureDbReady } from "@/db/index";
import * as schema from "@/db/schema";
import { requireAdmin } from "@/lib/auth.server";
import { TEST_PRODUCT_SETTING_KEY } from "@/lib/test-product";

export { TEST_PRODUCT_SETTING_KEY };

export async function readTestProductVisible() {
  const db = await ensureDbReady();
  const [row] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
  if (!row) return true;
  return row.value === "true";
}

async function writeTestProductVisible(visible: boolean) {
  const db = await ensureDbReady();
  const value = visible ? "true" : "false";
  const [existing] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
  if (!existing) {
    await db.insert(schema.appSettings).values({ key: TEST_PRODUCT_SETTING_KEY, value });
    return;
  }
  await db
    .update(schema.appSettings)
    .set({ value })
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
}

export const getTestProductVisibleFn = createServerFn({ method: "GET" }).handler(async () => {
  return { visible: await readTestProductVisible() };
});

export const setTestProductVisibleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = data as { token?: string; visible?: boolean };
    if (typeof parsed.token !== "string" || typeof parsed.visible !== "boolean") {
      throw new Error("Invalid input");
    }
    return parsed as { token: string; visible: boolean };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    await writeTestProductVisible(data.visible);
    return { visible: data.visible };
  });
