export type Category = {
  id: number;
  category: string;
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
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
