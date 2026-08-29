import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import type { FeedbackMessage } from "@/lib/feedback";
import { isAdmin } from "./auth.server";
import { newId } from "@/lib/id";
import { withDb } from "@/lib/server-db.server";

function mapMessage(
  row: Awaited<ReturnType<typeof withDb>>["schema"]["feedbackMessages"]["$inferSelect"],
): FeedbackMessage {
  return {
    id: row.id,
    threadId: row.threadId,
    text: row.text,
    from: row.sender as "user" | "support",
    createdAt: row.createdAt,
    ...(row.senderName ? { name: row.senderName } : {}),
  };
}

async function ensureThread(threadId: string, name?: string, email?: string) {
  const { db, schema } = await withDb();
  const [existing] = await db
    .select()
    .from(schema.feedbackThreads)
    .where(eq(schema.feedbackThreads.id, threadId));
  if (existing) return existing;
  const now = new Date().toISOString();
  await db.insert(schema.feedbackThreads).values({
    id: threadId,
    customerName: name ?? null,
    customerEmail: email ?? null,
    createdAt: now,
    updatedAt: now,
  });
  return {
    id: threadId,
    customerName: name ?? null,
    customerEmail: email ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export const getThreadMessagesFn = createServerFn({ method: "GET" })
  .validator((threadId: string) => threadId)
  .handler(async ({ data: threadId }) => {
    const { db, schema } = await withDb();
    const rows = await db
      .select()
      .from(schema.feedbackMessages)
      .where(eq(schema.feedbackMessages.threadId, threadId))
      .orderBy(asc(schema.feedbackMessages.createdAt));
    return rows.map(mapMessage);
  });

const sendMessageInput = z.object({
  threadId: z.string(),
  text: z.string().min(1),
  from: z.enum(["user", "support"]),
  name: z.string().optional(),
  email: z.string().optional(),
});

export const sendFeedbackMessageFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => sendMessageInput.parse(data))
  .handler(async ({ data }) => {
    const { db, schema } = await withDb();
    await ensureThread(data.threadId, data.name, data.email);
    const now = new Date().toISOString();
    const id = newId();
    await db.insert(schema.feedbackMessages).values({
      id,
      threadId: data.threadId,
      text: data.text.trim(),
      sender: data.from,
      senderName: data.name ?? null,
      createdAt: now,
    });
    await db
      .update(schema.feedbackThreads)
      .set({
        updatedAt: now,
        ...(data.name ? { customerName: data.name } : {}),
        ...(data.email ? { customerEmail: data.email } : {}),
      })
      .where(eq(schema.feedbackThreads.id, data.threadId));
    const [row] = await db
      .select()
      .from(schema.feedbackMessages)
      .where(eq(schema.feedbackMessages.id, id));
    return mapMessage(row!);
  });

export const listFeedbackThreadsFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    if (!(await isAdmin(token))) throw new Error("Unauthorized");
    const { dbListFeedbackThreads } = await import("./db-mapper.server");
    return dbListFeedbackThreads();
  });

export const listAllFeedbackMessagesFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    if (!(await isAdmin(token))) throw new Error("Unauthorized");
    const { db, schema } = await withDb();
    const rows = await db
      .select()
      .from(schema.feedbackMessages)
      .orderBy(asc(schema.feedbackMessages.createdAt));
    return rows.map(mapMessage);
  });
