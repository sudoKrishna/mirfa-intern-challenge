# Mirfa Software Engineer Intern Challenge
## Secure Transactions Mini-App (Turbo + Fastify + Vercel)

Welcome 👋

This challenge simulates a **real engineering task**, not a coding test.

You will build a small production-style app using:
- TurboRepo
- Fastify (API)
- Next.js (Web)
- AES-256-GCM encryption
- Vercel deployment

The goal is to evaluate:
- code quality
- system design
- correctness
- debugging ability
- deployment skills
- your ability to explain your work

---

# ⏱ Timebox

Expected effort: **6–10 hours total**

Deadline: **Submit within 2–3 days**

You may use:
- Google
- StackOverflow
- LLMs (ChatGPT/Claude/etc)

But you **must fully understand** and explain your solution.

---

# 🎯 What to Build

Create a **Turbo monorepo** with:



apps/web → Next.js UI
apps/api → Fastify API
packages/crypto → shared encryption module


The app should allow a user to:

1. Enter a JSON payload + partyId
2. Encrypt & store it
3. Retrieve encrypted record
4. Decrypt it back to original

---

# 🧩 Functional Requirements

## API (Fastify)

### POST /tx/encrypt
Input:
```json
{
  "partyId": "party_123",
  "payload": { "amount": 100 }
}


Output:
Encrypted record (see data model)

GET /tx/:id

Return stored encrypted record

POST /tx/:id/decrypt

Return:

{
  "id": "...",
  "partyId": "...",
  "payload": { ...original payload... }
}

Web (Next.js)

Single clean page is enough:

input partyId

textarea JSON

encrypt button

fetch button

decrypt button

show results

Keep UI simple and minimal.

🔐 Encryption Requirements (core)

Implement Envelope Encryption.

Rules:

Step 1

Generate random DEK (32 bytes)

Step 2

Encrypt payload using:
AES-256-GCM

Step 3

Wrap DEK using master key (MK) with AES-256-GCM

Step 4

Store everything

Data Model
type TxSecureRecord = {
  id: string
  partyId: string
  createdAt: string

  payload_nonce: string
  payload_ct: string
  payload_tag: string

  dek_wrap_nonce: string
  dek_wrapped: string
  dek_wrap_tag: string

  alg: "AES-256-GCM"
  mk_version: 1
}

Validation Rules

Must:

nonce = 12 bytes

tag = 16 bytes

reject invalid hex

decrypt must fail if tampered

🧪 Tests (required)

Write tests that verify:

✅ encrypt → decrypt roundtrip works
✅ tampered ciphertext fails
✅ tampered tag fails
✅ wrong nonce length fails

Minimum: ~5 tests

🚀 Deployment (required)

Deploy BOTH:

Web → Vercel

API → Vercel

Provide working URLs.

📝 README Q&A (required)

Add answers:

Why is AES-GCM nonce typically 12 bytes?

What happens if nonce is reused?

What is envelope encryption?

What was the hardest bug you hit?

What would you improve with more time?

🎯 Evaluation Focus

We care about:

clean code

structure

correctness

tests

explanation

We do NOT care about:

fancy UI

frameworks

over-engineering

📤 Submission

See SUBMISSION.md