export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_published: boolean;
  tags: string[];
  created_at?: string;
  updated_at?: string;
};

export type ProductPayload = {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  is_published: boolean;
  tags: string[];
};
