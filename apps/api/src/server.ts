import dotenv from "dotenv";
dotenv.config();
import Fastify from "fastify";
import cors from "@fastify/cors";  
import { encrypt, decrypt } from "@repo/crypto";
import { TxSecureRecord } from "@repo/crypto/src/types";

const app = Fastify({ logger: true });


app.register(cors, {
  origin: "http://localhost:3000", 
  methods: ["GET", "POST", "OPTIONS"],
});

const store = new Map<string, TxSecureRecord>();


app.get("/health", async () => {
  return { ok: true };
});

console.log("Loaded MASTER_KEY:", process.env.MASTER_KEY?.slice(0, 8) + "...");


app.post("/tx/encrypt", async (request, reply) => {
  try {
    const body = request.body as {
      partyId: string;
      payload: any;
    };

    if (!body.partyId || !body.payload) {
      return reply.status(400).send({ error: "Invalid input" });
    }

    const record = encrypt(body.partyId, body.payload);
    store.set(record.id, record);

    return record;
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

// Get Encrypted Record
app.get("/tx/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  const record = store.get(id);
  if (!record) {
    return reply.status(404).send({ error: "Not found" });
  }

  return record;
});

// Decrypt Record
app.post("/tx/:id/decrypt", async (request, reply) => {
  try {
    const { id } = request.params as { id: string };

    const record = store.get(id);
    if (!record) {
      return reply.status(404).send({ error: "Not found" });
    }

    const original = decrypt(record);
    return { decrypted: original };
  } catch (err: any) {
    return reply.status(400).send({ error: err.message });
  }
});

app.listen({ port: 4000 }, (err) => {
  if (err) throw err;
  console.log("API running at http://localhost:4000");
});
