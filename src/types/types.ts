export type Category = {
  id: number;
  category: string;
};

export interface OutletContext {
  selectedCategory: string;
}

export type Post = {
  id: number;
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
};
