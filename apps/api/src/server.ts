import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { ok: true };
});

app.listen({ port: 4000 });
