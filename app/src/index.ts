import { Hono } from "hono";
import { serveStatic } from "hono/serve-static.bun";
import { WebhookEvent } from "@line/bot-sdk";

import { EventHandler } from "./handler/eventHandler";

const port = parseInt(process.env.PORT) || 8000;
const app = new Hono();
const handler = new EventHandler()

app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
app.get("/", (c) => {
  return c.json({ message: "Hello linebot" });
});
app.post("/webhook", async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as any).events;
  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await handler.handleTextEvent(event);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }
        return c.json({
          status: "error",
        });
      }
    })
  );
  return c.json({ message: "ok" });
});

console.log(`Running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};