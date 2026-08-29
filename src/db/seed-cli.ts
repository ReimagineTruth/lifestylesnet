import { ensureDbReady } from "./index";

await ensureDbReady();
console.log("Database ready and seeded.");
