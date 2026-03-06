"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

type FormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  image_url: string;
  description: string;
  is_published: boolean;
};

const blankForm: FormState = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image_url: "",
  description: "",
  is_published: true,
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function AdminApp({ storeName, whatsappNumber }: { storeName: string; whatsappNumber: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"dashboard" | "form" | "settings">("dashboard");
  const [form, setForm] = useState<FormState>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSession() {
    setIsLoading(true);
    const res = await fetch("/api/admin/check", { cache: "no-store" });
    const data = await res.json();
    setIsLoggedIn(Boolean(data.loggedIn));
    setIsLoading(false);
  }

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadProducts();
    }
  }, [isLoggedIn]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((item) =>
      [item.name, item.category, item.description].join(" ").toLowerCase().includes(keyword)
    );
  }, [products, search]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.message || "Login gagal");
      return;
    }
    setPassword("");
    setIsLoggedIn(true);
    loadProducts();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setProducts([]);
    setEditingId(null);
    setForm(blankForm);
  }

  function resetForm() {
    setEditingId(null);
    setForm(blankForm);
    setTab("form");
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url,
      description: product.description,
      is_published: product.is_published,
    });
    setTab("form");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || DEFAULT_IMAGE,
      description: form.description,
      is_published: form.is_published,
    };

    const res = await fetch("/api/products", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Gagal menyimpan produk");
      setSaving(false);
      return;
    }

    setMessage(editingId ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
    setForm(blankForm);
    setEditingId(null);
    setSaving(false);
    setTab("dashboard");
    loadProducts();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Hapus produk ini?");
    if (!confirmed) return;

    const res = await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Gagal menghapus produk");
      return;
    }
    loadProducts();
  }

  async function togglePublish(product: Product) {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url,
        description: product.description,
        is_published: !product.is_published,
      }),
    });
    if (res.ok) loadProducts();
  }

  const totalProducts = products.length;
  const totalPublished = products.filter((item) => item.is_published).length;
  const totalDraft = products.filter((item) => !item.is_published).length;

  if (isLoading) {
    return <div className="card"><p>Memeriksa sesi admin...</p></div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="auth-wrap">
        <div className="card auth-card">
          <span className="badge">Admin Tipjen</span>
          <h1>Login Penjual</h1>
          <p className="muted">Halaman ini hanya untuk penjual mengelola katalog, harga, stok, dan publish produk.</p>
          <form onSubmit={handleLogin} className="stack">
            <label>
              Password admin
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required />
            </label>
            {loginError ? <div className="error-box">{loginError}</div> : null}
            <button className="btn primary" type="submit">Masuk</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <section className="hero card">
        <div>
          <span className="badge">Web Penjual</span>
          <h1>{storeName} Admin</h1>
          <p className="muted">Semua perubahan di sini akan terhubung ke web pembeli selama produk berstatus dipublikasikan.</p>
        </div>
        <div className="hero-actions wrap">
          <button className={`btn ${tab === "dashboard" ? "primary" : "ghost"}`} onClick={() => setTab("dashboard")}>Dashboard</button>
          <button className={`btn ${tab === "form" ? "primary" : "ghost"}`} onClick={() => setTab("form")}>{editingId ? "Edit Produk" : "Tambah Produk"}</button>
          <button className={`btn ${tab === "settings" ? "primary" : "ghost"}`} onClick={() => setTab("settings")}>Info</button>
          <button className="btn danger" onClick={handleLogout}>Keluar</button>
        </div>
      </section>

      {tab === "dashboard" && (
        <>
          <section className="grid three">
            <div className="card stat-card"><p className="muted">Total produk</p><h2>{totalProducts}</h2></div>
            <div className="card stat-card"><p className="muted">Tampil di buyer</p><h2>{totalPublished}</h2></div>
            <div className="card stat-card"><p className="muted">Draft</p><h2>{totalDraft}</h2></div>
          </section>

          <section className="card stack">
            <div className="toolbar">
              <div>
                <h2>Daftar Produk</h2>
                <p className="muted">Produk published akan muncul di web pembeli.</p>
              </div>
              <div className="toolbar-actions wrap">
                <input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <button className="btn primary" onClick={resetForm}>+ Tambah Produk</button>
              </div>
            </div>

            <div className="product-list">
              {filteredProducts.map((item) => (
                <article className="product-row" key={item.id}>
                  <img src={item.image_url || DEFAULT_IMAGE} alt={item.name} />
                  <div className="product-main">
                    <div className="wrap gap-sm">
                      <h3>{item.name}</h3>
                      <span className={`pill ${item.is_published ? "ok" : "warn"}`}>{item.is_published ? "Published" : "Draft"}</span>
                    </div>
                    <p className="muted">{item.category || "Umum"}</p>
                    <p>{formatRupiah(item.price)} • Stok {item.stock}</p>
                  </div>
                  <div className="wrap gap-sm">
                    <button className="btn ghost" onClick={() => togglePublish(item)}>{item.is_published ? "Sembunyikan" : "Tampilkan"}</button>
                    <button className="btn ghost" onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                  </div>
                </article>
              ))}
              {filteredProducts.length === 0 ? <p className="muted">Belum ada produk.</p> : null}
            </div>
          </section>
        </>
      )}

      {tab === "form" && (
        <section className="card stack">
          <div>
            <h2>{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
            <p className="muted">Isi produk lalu pilih apakah langsung tampil di web pembeli.</p>
          </div>
          <form onSubmit={handleSave} className="stack">
            <div className="grid two">
              <label>Nama produk<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Kategori<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Contoh: Fashion" /></label>
            </div>
            <div className="grid two">
              <label>Harga<input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
              <label>Stok<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></label>
            </div>
            <label>Link gambar<input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></label>
            <label>Deskripsi<textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="checkbox-row"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Tampilkan di web pembeli</label>
            {message ? <div className="success-box">{message}</div> : null}
            <div className="wrap gap-sm">
              <button className="btn primary" type="submit" disabled={saving}>{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Produk"}</button>
              <button className="btn ghost" type="button" onClick={() => { setForm(blankForm); setEditingId(null); }}>Reset</button>
            </div>
          </form>
        </section>
      )}

      {tab === "settings" && (
        <section className="card stack">
          <h2>Info Project Admin</h2>
          <div className="grid two">
            <div className="info-box"><strong>Nama toko</strong><p>{storeName}</p></div>
            <div className="info-box"><strong>Nomor WhatsApp</strong><p>{whatsappNumber}</p></div>
          </div>
          <p className="muted">Deploy project buyer secara terpisah agar pembeli hanya membuka web katalog. Keduanya tetap sinkron karena memakai Supabase yang sama.</p>
        </section>
      )}
    </div>
  );
}
