import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  slug: text("slug").primaryKey(),
  cateId: integer("cate_id").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  image: text("image").notNull(),
  short: text("short").notNull(),
  description: text("description").notNull(),
  benefits: text("benefits").notNull(),
  ingredients: text("ingredients").notNull(),
  directions: text("directions").notNull(),
});

export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productSlug: text("product_slug")
    .notNull()
    .references(() => products.slug),
  code: text("code").notNull(),
  label: text("label").notNull(),
  points: integer("points").notNull(),
  price: integer("price").notNull(),
  size: text("size").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentReference: text("payment_reference"),
  paymongoIntentId: text("paymongo_intent_id"),
  paypalOrderId: text("paypal_order_id"),
  bankCode: text("bank_code"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerCity: text("customer_city").notNull(),
  customerProvince: text("customer_province").notNull(),
  customerPostal: text("customer_postal").notNull(),
  customerNotes: text("customer_notes"),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
});

export const orderLines = sqliteTable("order_lines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  variantId: text("variant_id").notNull(),
  productSlug: text("product_slug").notNull(),
  skuCode: text("sku_code").notNull(),
  name: text("name").notNull(),
  qty: integer("qty").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

export const feedbackThreads = sqliteTable("feedback_threads", {
  id: text("id").primaryKey(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const feedbackMessages = sqliteTable("feedback_messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => feedbackThreads.id),
  text: text("text").notNull(),
  sender: text("sender").notNull(),
  senderName: text("sender_name"),
  createdAt: text("created_at").notNull(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  token: text("token").primaryKey(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});
