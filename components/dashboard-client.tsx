"use client";

import { Eye, EyeOff, Image as ImageIcon, Pencil, Plus, Save, Search, Tag, Trash2, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Label, Product } from "@/lib/types";

const emptyForm = {
  id: "",
  name: "",
  description: "",
  category: "Umum",
  price: "",
  stock: "",
  image_url: "",
  tags: [] as string[],
  is_published: true,
};

export default function DashboardClient({
  initialProducts,
  initialLabels,
}: {
  initialProducts: Product[];
  initialLabels: Label[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((item) => [item.name, item.category, item.description, ...(item.tags ?? [])].join(" ").toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const showNotice = (text: string) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 2000);
  };

  const totalPublished = products.filter((item) => item.is_published).length;
  const totalHidden = products.filter((item) => !item.is_published).length;

  const selectForEdit = (item: Product) => {
    setForm({
     id: String(item.id),
      name: item.name,
      description: item.description,
      category: item.category,
      price: String(item.price),
      stock: String(item.stock),
      image_url: item.image_url,
      tags: item.tags ?? [],
      is_published: item.is_published,
    });
  };

  const resetForm = () => setForm(emptyForm);

  const saveLabel = async () => {
    const name = tagInput.trim();
    if (!name) return;
    const res = await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return showNotice("Gagal menyimpan label");
    const label = await res.json();
    setLabels((prev) => prev.some((x) => x.name === label.name) ? prev : [...prev, label].sort((a,b) => a.name.localeCompare(b.name)));
    if (!form.tags.includes(label.name)) setForm((prev) => ({ ...prev, tags: [...prev.tags, label.name] }));
    setTagInput("");
    showNotice("Label tersimpan");
  };

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image_url: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      id: form.id || undefined,
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url: form.image_url,
      tags: form.tags,
      is_published: form.is_published,
    };
    const res = await fetch("/api/products", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) return showNotice("Gagal menyimpan produk");
    const product = await res.json();
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev.map((item) => item.id === product.id ? product : item);
      return [product, ...prev];
    });
    resetForm();
    showNotice(form.id ? "Produk diperbarui" : "Produk ditambahkan");
  };

  const togglePublished = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}/toggle`, { method: "POST" });
    if (!res.ok) return showNotice("Gagal mengubah status");
    const updated = await res.json();
    setProducts((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    showNotice(updated.is_published ? "Produk ditampilkan di buyer" : "Produk disembunyikan dari buyer");
  };

  const removeProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) return showNotice("Gagal menghapus produk");
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (form.id === id) resetForm();
    showNotice("Produk dihapus");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      {notice ? <div className="fixed right-6 top-6 z-50 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-emerald-700 shadow-soft dark:border-emerald-400/20 dark:bg-slate-900 dark:text-emerald-300">{notice}</div> : null}
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Total produk", products.length],
            ["Sedang tayang", totalPublished],
            ["Disembunyikan", totalHidden],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-[28px] border border-brand-sand bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-[#84685c] dark:text-slate-300">{label}</p>
              <p className="mt-3 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-brand-sand bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold">Daftar produk</h2>
              <p className="mt-1 text-sm text-[#84685c] dark:text-slate-300">Semua perubahan di sini akan langsung memengaruhi web buyer.</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84685c] dark:text-slate-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full rounded-2xl border border-brand-sand bg-[#fffaf6] py-3 pl-11 pr-4 outline-none dark:border-white/10 dark:bg-white/5" />
            </div>
          </div>
          <div className="space-y-4">
            {filteredProducts.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-[24px] border border-[#efe0d5] bg-[#fffaf6] p-4 dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-center">
                <img src={item.image_url || "https://placehold.co/240x240/png"} alt={item.name} className="h-24 w-24 rounded-[20px] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-bold">{item.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.is_published ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"}`}>{item.is_published ? "Tayang" : "Disembunyikan"}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#84685c] dark:text-slate-300">{item.category} • Stok {item.stock}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(item.tags ?? []).map((tag) => <span key={tag} className="rounded-full bg-[#f4e8df] px-3 py-1 text-xs font-medium text-[#7d5f52] dark:bg-white/10 dark:text-slate-200">#{tag}</span>)}
                  </div>
                  <p className="mt-2 font-semibold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.price)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => togglePublished(item)} className="inline-flex items-center gap-2 rounded-2xl bg-brand-cocoa px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">{item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{item.is_published ? "Sembunyikan" : "Tampilkan"}</button>
                  <button onClick={() => selectForEdit(item)} className="inline-flex items-center gap-2 rounded-2xl border border-brand-sand bg-white px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-white/5"><Pencil className="h-4 w-4" />Edit</button>
                  <button onClick={() => removeProduct(item.id)} className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"><Trash2 className="h-4 w-4" />Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-brand-sand bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Tambah / edit produk</h2>
            <p className="mt-1 text-sm text-[#84685c] dark:text-slate-300">Upload gambar dari galeri dan atur tag yang tersimpan.</p>
          </div>
          {form.id ? <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-2xl border border-brand-sand bg-white px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-white/5"><X className="h-4 w-4" />Reset</button> : null}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Nama produk</label>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Harga</label>
              <input type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} className="w-full rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Stok</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))} className="w-full rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" required />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Kategori</label>
            <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[100px] w-full rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium">Label / tag produk</label>
              <span className="text-xs text-[#84685c] dark:text-slate-300">Klik tag yang tersimpan atau buat tag baru</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const active = form.tags.includes(label.name);
                return (
                  <button type="button" key={label.id} onClick={() => setForm((prev) => ({ ...prev, tags: active ? prev.tags.filter((x) => x !== label.name) : [...prev.tags, label.name] }))} className={`rounded-full px-3 py-2 text-xs font-medium ${active ? "bg-brand-cocoa text-white dark:bg-white dark:text-slate-900" : "border border-brand-sand bg-[#fffaf6] text-[#7c5d50] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`}>
                    <Tag className="mr-1 inline h-3 w-3" />{label.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Ketik label baru..." className="flex-1 rounded-2xl border border-brand-sand bg-[#fffaf6] px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5" />
              <button type="button" onClick={saveLabel} className="rounded-2xl bg-brand-cocoa px-4 py-3 font-semibold text-white dark:bg-white dark:text-slate-900">Simpan label</button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Gambar produk</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-brand-sand bg-[#fffaf6] p-5 text-center dark:border-white/10 dark:bg-white/5">
              <Upload className="h-6 w-6" />
              <span className="font-medium">Upload dari galeri</span>
              <span className="text-sm text-[#84685c] dark:text-slate-300">Pilih gambar untuk preview otomatis</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {form.image_url ? <img src={form.image_url} alt="Preview" className="mt-3 h-40 w-full rounded-[24px] object-cover" /> : <div className="mt-3 flex h-40 items-center justify-center rounded-[24px] bg-[#f7ede6] dark:bg-white/5"><ImageIcon className="h-6 w-6" /></div>}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-brand-sand bg-[#fffaf6] p-4 dark:border-white/10 dark:bg-white/5">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))} />
            <div>
              <p className="font-medium">Tampilkan di buyer</p>
              <p className="text-sm text-[#84685c] dark:text-slate-300">Saat aktif, produk langsung tampil di web buyer.</p>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button disabled={saving} className="rounded-2xl bg-brand-cocoa px-4 py-3 font-semibold text-white dark:bg-white dark:text-slate-900">{saving ? "Menyimpan..." : form.id ? "Perbarui produk" : "Simpan produk"}</button>
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, is_published: false }))} className="rounded-2xl border border-brand-sand bg-white px-4 py-3 font-semibold dark:border-white/10 dark:bg-white/5">Simpan draft</button>
          </div>
        </form>
      </section>
    </div>
  );
}
