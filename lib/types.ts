export type Label = {
  id: string | number;
  name: string;
};

export type Product = {
  id: string | number;
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  image_url?: string | null;
  is_published?: boolean;
  published?: boolean;
  tags?: string[];
};

export type ProductPayload = {
  name: string;
  description?: string | null;
  category?: string | null;
  price: number;
  stock: number;
  image_url?: string | null;
  is_published?: boolean;
  tags?: string[];
};
