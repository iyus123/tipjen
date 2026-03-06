"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Password admin salah.");
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Password admin</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          className="w-full rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
        />
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">{error}</p> : null}
      <button className="w-full rounded-2xl bg-brand-cocoa px-4 py-3 font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-900" disabled={loading}>
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
