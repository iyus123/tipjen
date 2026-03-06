import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSupabase } from "@/lib/supabase";
import { ProductPayload } from "@/lib/types";

function isAuthed() {
  return cookies().get("tipjen_admin_session")?.value === "logged_in";
}

export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ProductPayload;
  const supabase = getAdminSupabase();

  const record = {
    name: payload.name,
    description: payload.description || "",
    category: payload.category || "Umum",
    price: Number(payload.price || 0),
    stock: Number(payload.stock || 0),
    image_url: payload.image_url || "",
    published: Boolean(payload.published),
  };

  const { data, error } = await supabase.from("products").insert(record).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

export async function PUT(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as ProductPayload;

  if (!payload.id) {
    return NextResponse.json({ error: "ID produk wajib diisi." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      description: payload.description || "",
      category: payload.category || "Umum",
      price: Number(payload.price || 0),
      stock: Number(payload.stock || 0),
      image_url: payload.image_url || "",
      published: Boolean(payload.published),
    })
    .eq("id", payload.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID produk tidak ditemukan." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
