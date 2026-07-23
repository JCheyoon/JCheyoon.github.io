export type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: Category[];
  createdAt: string;
  updatedAt: string;
};

export interface OutletContext {
  selectedCategory: string;
}

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  categoryId: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
