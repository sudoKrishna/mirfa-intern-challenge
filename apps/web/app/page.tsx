"use client"; // needed for hooks in App Router

import { useState } from "react";

export default function Page() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState("{}");
  const [recordId, setRecordId] = useState("");
  const [encrypted, setEncrypted] = useState<any>(null);
  const [decrypted, setDecrypted] = useState<any>(null);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:4000";

  // Encrypt & Save
  const handleEncrypt = async () => {
    try {
      setError("");
      const payloadObj = JSON.parse(payload);
      const res = await fetch(`${API_BASE}/tx/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload: payloadObj }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed");
        return;
      }

      const data = await res.json();
      setEncrypted(data);
      setRecordId(data.id);
      setDecrypted(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Fetch Encrypted
  const handleFetch = async () => {
    try {
      setError("");
      if (!recordId) return;
      const res = await fetch(`${API_BASE}/tx/${recordId}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed");
        return;
      }
      const data = await res.json();
      setEncrypted(data);
      setDecrypted(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Decrypt
  const handleDecrypt = async () => {
    try {
      setError("");
      if (!recordId) return;
      const res = await fetch(`${API_BASE}/tx/${recordId}/decrypt`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed");
        return;
      }
      const data = await res.json();
      setDecrypted(data.decrypted);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Secure Transaction Mini-App</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>Party ID:</label>
        <input
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Payload (JSON):</label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleEncrypt} style={{ marginRight: "1rem" }}>Encrypt & Save</button>
        <button onClick={handleFetch} style={{ marginRight: "1rem" }}>Fetch Encrypted</button>
        <button onClick={handleDecrypt}>Decrypt</button>
      </div>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {encrypted && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Encrypted Record</h2>
          <pre style={{ background: "#f0f0f0", padding: "1rem" }}>
            {JSON.stringify(encrypted, null, 2)}
          </pre>
        </div>
      )}

      {decrypted && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Decrypted Payload</h2>
          <pre style={{ background: "#e0ffe0", padding: "1rem" }}>
            {JSON.stringify(decrypted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
