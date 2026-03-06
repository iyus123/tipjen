export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Label = {
  id: string;
  name: string;
  created_at: string;
};
