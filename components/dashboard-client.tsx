"use client";

import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Label, Product } from "@/lib/types";

type FormState = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  image_url: string;
  is_published: boolean;
  tags: string[];
};

type DashboardClientProps = {
  initialProducts: Product[];
  initialLabels: Label[];
};

const emptyForm: FormState = {
  id: "",
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  image_url: "",
  is_published: true,
  tags: [],
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function DashboardClient({
  initialProducts,
  initialLabels,
}: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [labels, setLabels] = useState<Label[]>(initialLabels ?? []);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("tipjen-admin-theme");
    if (savedTheme === "dark") setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("tipjen-admin-theme", dark ? "dark" : "light");
  }, [dark]);

  function showNotice(text: string) {
    setNotice(text);
    window.clearTimeout((showNotice as unknown as { timer?: number }).timer);
    (showNotice as unknown as { timer?: number }).timer = window.setTimeout(() => {
      setNotice("");
    }, 1800);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((item) =>
      [
        item.name ?? "",
        item.category ?? "",
        item.description ?? "",
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const totalPublished = products.filter((item) => item.is_published ?? false).length;
  const totalHidden = products.filter((item) => !(item.is_published ?? false)).length;

  const storedTags = useMemo(() => {
    const names = (labels ?? []).map((item) => item.name);
    const productTags = products.flatMap((item) => item.tags ?? []);
    return Array.from(new Set([...names, ...productTags])).filter(Boolean);
  }, [labels, products]);

  function resetForm() {
    setForm(emptyForm);
    setTagInput("");
  }

  function selectForEdit(item: Product) {
    setForm({
      id: String(item.id),
      name: item.name ?? "",
      description: item.description ?? "",
      category: item.category ?? "",
      price: String(item.price ?? 0),
      stock: String(item.stock ?? 0),
      image_url: item.image_url ?? item.image ?? "",
      tags: item.tags ?? [],
      is_published: item.is_published ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveLabel() {
    const name = tagInput.trim();
    if (!name) return;

    if (!(form.tags ?? []).includes(name)) {
      setForm((prev) => ({
        ...prev,
        tags: [...(prev.tags ?? []), name],
      }));
    }

    if (!storedTags.includes(name)) {
      try {
        const res = await fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (res.ok) {
          const created = await res.json();
          setLabels((prev) => [...prev, created]);
        } else {
          setLabels((prev) => [...prev, { id: `${Date.now()}`, name }]);
        }
      } catch {
        setLabels((prev) => [...prev, { id: `${Date.now()}`, name }]);
      }
    }

    setTagInput("");
  }

  function addExistingTag(tag: string) {
    if (!(form.tags ?? []).includes(tag)) {
      setForm((prev) => ({
        ...prev,
        tags: [...(prev.tags ?? []), tag],
      }));
    }
  }

  function removeTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags ?? []).filter((item) => item !== tag),
    }));
  }

  async function handleImageUpload(file?: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        image_url: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  }

  async function submitProduct() {
    if (!form.name.trim()) {
      showNotice("Nama produk wajib diisi");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url: form.image_url || "",
      is_published: form.is_published,
      tags: form.tags ?? [],
    };

    try {
      const isEdit = Boolean(form.id);
      const url = isEdit ? `/api/products/${form.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const saved = await res.json();

      if (isEdit) {
        setProducts((prev) =>
          prev.map((item) => (String(item.id) === String(saved.id) ? saved : item))
        );
        showNotice("Produk berhasil diperbarui");
      } else {
        setProducts((prev) => [saved, ...prev]);
        showNotice("Produk berhasil ditambahkan");
      }

      resetForm();
    } catch {
      showNotice("Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(id: string | number) {
    try {
      const res = await fetch(`/api/products/${String(id)}/toggle`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setProducts((prev) =>
        prev.map((item) => (String(item.id) === String(updated.id) ? updated : item))
      );

      showNotice("Status tayang diperbarui");
    } catch {
      showNotice("Gagal mengubah status tayang");
    }
  }

  async function removeProduct(id: string | number) {
    const confirmed = window.confirm("Hapus produk ini?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${String(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setProducts((prev) => prev.filter((item) => String(item.id) !== String(id)));
      showNotice("Produk berhasil dihapus");
    } catch {
      showNotice("Gagal menghapus produk");
    }
  }

  const shell = dark ? "bg-[#020817] text-white" : "bg-[#f8f2ec] text-[#4a342b]";
  const card = dark ? "bg-white/5 border-white/10" : "bg-white border-[#ead9cc]";
  const soft = dark ? "text-slate-300" : "text-[#84685c]";

  return (
    <div className={`${shell} min-h-screen transition-colors`}>
      {notice && (
        <div
          className={`fixed right-6 top-6 z-[60] rounded-2xl border px-5 py-3 text-sm font-medium shadow-xl ${
            dark
              ? "border-emerald-400/20 bg-emerald-400/20 text-emerald-200"
              : "border-emerald-200 bg-white text-emerald-700"
          }`}
        >
          {notice}
        </div>
      )}

      <div
        className={`border-b px-6 py-5 ${
          dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tipjen Admin</h1>
              <p className={`mt-1 text-sm ${soft}`}>
                Kelola produk, label, gambar, dan sinkronisasi ke buyer.
              </p>
            </div>

            <button
              onClick={() => setDark((prev) => !prev)}
              className={`rounded-2xl border px-4 py-2 text-sm font-medium ${
                dark
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-[#ead9cc] bg-white text-[#6e5347]"
              }`}
            >
              {dark ? "Mode terang" : "Mode gelap"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[1fr,420px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`rounded-[28px] border p-5 ${card}`}>
              <p className={`text-sm ${soft}`}>Total produk</p>
              <p className="mt-3 text-3xl font-bold">{products.length}</p>
            </div>
            <div className={`rounded-[28px] border p-5 ${card}`}>
              <p className={`text-sm ${soft}`}>Sedang tayang</p>
              <p className="mt-3 text-3xl font-bold">{totalPublished}</p>
            </div>
            <div className={`rounded-[28px] border p-5 ${card}`}>
              <p className={`text-sm ${soft}`}>Disembunyikan</p>
              <p className="mt-3 text-3xl font-bold">{totalHidden}</p>
            </div>
          </div>

          <div className={`rounded-[28px] border p-5 ${card}`}>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Daftar produk</h2>
                <p className={`mt-1 text-sm ${soft}`}>
                  Perubahan di sini akan terlihat di web buyer.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${soft}`} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk..."
                  className={`w-full rounded-2xl border py-3 pl-11 pr-4 outline-none ${
                    dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-4 rounded-[24px] border p-4 lg:flex-row lg:items-center ${
                    dark ? "border-white/10 bg-white/5" : "border-[#efe0d5] bg-[#fffaf6]"
                  }`}
                >
                  <img
                    src={item.image_url || item.image || "/placeholder.png"}
                    alt={item.name}
                    className="h-24 w-24 rounded-[20px] object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold">{item.name}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.is_published
                            ? dark
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700"
                            : dark
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.is_published ? "Tayang di buyer" : "Disembunyikan"}
                      </span>
                    </div>

                    <p className={`mt-1 text-sm ${soft}`}>
                      {item.category || "Lainnya"} • Stok {item.stock}
                    </p>

                    {(item.tags ?? []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(item.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              dark
                                ? "bg-white/10 text-slate-200"
                                : "bg-[#f4e8df] text-[#7d5f52]"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 font-semibold">{formatRupiah(Number(item.price || 0))}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => togglePublished(item.id)}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ${
                        dark ? "bg-white text-slate-900" : "bg-[#4f342b] text-white"
                      }`}
                    >
                      {item.is_published ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Sembunyikan
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Tampilkan
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => selectForEdit(item)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium ${
                        dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-white"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => removeProduct(item.id)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium ${
                        dark
                          ? "border-red-400/20 bg-red-400/10 text-red-300"
                          : "border-red-200 bg-red-50 text-red-600"
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className={`rounded-2xl border p-6 text-sm ${card}`}>
                  Belum ada produk ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-[28px] border p-5 ${card}`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                {form.id ? "Edit produk" : "Tambah produk"}
              </h2>
              <p className={`mt-1 text-sm ${soft}`}>
                Lengkapi data produk lalu simpan ke katalog.
              </p>
            </div>

            {form.id && (
              <button
                onClick={resetForm}
                className={`rounded-2xl border px-4 py-2 text-sm font-medium ${
                  dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-white"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Nama produk</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                  dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Harga</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                    dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                  }`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Stok</label>
                <input
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                    dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                  dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                }`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className={`min-h-[100px] w-full rounded-2xl border px-4 py-3 outline-none ${
                  dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                }`}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium">Label / tag produk</label>
                <span className={`text-xs ${soft}`}>Klik label tersimpan atau tambah baru</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {storedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addExistingTag(tag)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                      dark
                        ? "border border-white/10 bg-white/5 text-slate-200"
                        : "border border-[#ead9cc] bg-[#fffaf6] text-[#7c5d50]"
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ketik label baru..."
                  className={`flex-1 rounded-2xl border px-4 py-3 outline-none ${
                    dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-[#fffaf6]"
                  }`}
                />
                <button
                  type="button"
                  onClick={saveLabel}
                  className={`rounded-2xl px-4 py-3 font-semibold ${
                    dark ? "bg-white text-slate-900" : "bg-[#4f342b] text-white"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {(form.tags ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(form.tags ?? []).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
                        dark
                          ? "bg-amber-400/15 text-amber-200"
                          : "bg-[#f4e8df] text-[#7d5f52]"
                      }`}
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gambar produk</label>
              <div
                className={`rounded-[24px] border border-dashed p-5 text-center ${
                  dark ? "border-white/10 bg-white/5" : "border-[#e7d6cb] bg-[#fffaf6]"
                }`}
              >
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mx-auto mb-4 h-40 rounded-2xl object-cover"
                  />
                ) : (
                  <ImageIcon className="mx-auto mb-3 h-6 w-6" />
                )}

                <p className="font-medium">Upload gambar dari galeri</p>
                <p className={`mt-1 text-sm ${soft}`}>
                  Pilih file gambar untuk preview otomatis.
                </p>

                <label
                  className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 font-medium ${
                    dark ? "bg-white text-slate-900" : "bg-[#4f342b] text-white"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Pilih gambar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handleImageUpload(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_published: e.target.checked }))
                }
              />
              <span className="text-sm font-medium">Tampilkan di web buyer</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={submitProduct}
                disabled={saving}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold ${
                  dark ? "bg-white text-slate-900" : "bg-[#4f342b] text-white"
                } disabled:opacity-50`}
              >
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : form.id ? "Update produk" : "Simpan produk"}
              </button>

              <button
                onClick={resetForm}
                className={`rounded-2xl border px-4 py-3 font-semibold ${
                  dark ? "border-white/10 bg-white/5" : "border-[#ead9cc] bg-white"
                }`}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
