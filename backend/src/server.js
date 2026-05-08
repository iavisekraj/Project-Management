import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

(async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
})();

process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  process.exit(1);
});
