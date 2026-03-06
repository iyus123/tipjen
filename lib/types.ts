export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
