"use client";

import { useState } from "react";

export default function Page() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState("{}");
  const [recordId, setRecordId] = useState("");
  const [encrypted, setEncrypted] = useState<any>(null);
  const [decrypted, setDecrypted] = useState<any>(null);
  const [error, setError] = useState("");

  const API_BASE = "http://127.0.0.1:4000";


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
    <div className="min-h-screen bg-[#F5F5F7] py-16 px-6 font-[system-ui] text-[#1D1D1F] antialiased">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <header className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            Secure Vault
          </h1>
          <p className="text-gray-500 text-lg">
            End-to-end encryption for your transaction payloads.
          </p>
        </header>

        {/* Main Card */}
        <section className="bg-white rounded-[20px] border border-gray-200 shadow-sm p-10 space-y-6">

          {/* Party ID */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 ml-1">
              Party Identifier
            </label>
            <input
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              placeholder="e.g. USER_99"
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/80 transition-all"
            />
          </div>

          {/* Payload */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 ml-1">
              Payload (JSON)
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black/80 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">

            {/* Primary */}
            <button
              onClick={handleEncrypt}
              className="px-6 py-3 rounded-full bg-black text-white font-medium transition-all duration-200 hover:bg-[#2c2c2e] active:scale-95"
            >
              Encrypt & Save
            </button>

            {/* Secondary */}
            <button
              onClick={handleFetch}
              className="px-6 py-3 rounded-full border border-gray-200 bg-white text-[#1D1D1F] font-medium hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              Fetch
            </button>

            <button
              onClick={handleDecrypt}
              className="px-6 py-3 rounded-full border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] font-medium hover:bg-gray-200 transition-all duration-200 active:scale-95"
            >
              Decrypt
            </button>
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="mt-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm transition-all duration-300">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Results */}
        <div className="mt-10 space-y-8">

          {encrypted && (
            <div className="transition-all duration-500">
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 ml-2">
                Encrypted Record
              </h2>

              {/* Glass Card */}
              <div className="rounded-[20px] border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 overflow-x-auto">
                <pre className="text-xs text-[#1D1D1F] leading-relaxed">
                  {JSON.stringify(encrypted, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {decrypted && (
            <div className="transition-all duration-700">
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 ml-2">
                Decrypted Payload
              </h2>

              {/* Glass Card */}
              <div className="rounded-[20px] border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-6 overflow-x-auto">
                <pre className="text-xs text-[#1D1D1F] font-mono leading-relaxed">
                  {JSON.stringify(decrypted, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
