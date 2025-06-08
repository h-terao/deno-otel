import { Hono } from "hono";
import { context, trace } from "@opentelemetry/api";

const app = new Hono();

app.use("*", (c, next) => {
  const tracer = trace.getTracer("dice-roller");
  const span = tracer.startSpan(
    `HTTP ${c.req.method} ${c.req.path}`,
    { kind: 1 },
  );

  return context.with(
    trace.setSpan(context.active(), span),
    async () => {
      try {
        await next();
      } finally {
        span.end();
      }
    },
  );
});

app.get("/dice", (c) => {
  const span = trace.getSpan(context.active());
  const { traceId, spanId } = span
    ? span.spanContext()
    : { traceId: "unknown", spanId: "unknown" };

  const numRolls = parseInt(c.req.query("rolls") || "6");
  const numSides = parseInt(c.req.query("sides") || "1");

  const rolls = Array.from({ length: numRolls }, () => {
    return Math.floor(Math.random() * numSides) + 1;
  });
  const total = rolls.reduce((sum, roll) => sum + roll, 0);
  console.log(
    `Trace ID: ${traceId}, Span ID: ${spanId}, `,
    `Rolled ${numRolls} dice with ${numSides} sides: ${rolls}, Total: ${total}`,
  );

  return c.json({ rolls, total });
});

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "8000", 10);
  console.log(`Server running on http://localhost:${port}`);
  Deno.serve({ port }, app.fetch);
}
