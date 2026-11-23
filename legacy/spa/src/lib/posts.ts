import { apiRequest } from "./api";
import type { Post } from "@/types/types";

export async function fetchPosts(
  tag?: string,
  category?: string,
): Promise<Post[]> {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (category) params.set("category", category);
  const qs = params.toString();
  const data = await apiRequest<Post[] | null>(
    `/api/posts${qs ? `?${qs}` : ""}`,
  );
  return data ?? [];
}

/** Admin-only: fetch all posts including drafts */
export async function fetchAllPosts(): Promise<Post[]> {
  const data = await apiRequest<Post[] | null>("/api/posts?all=true");
  return data ?? [];
}

/** Admin-only: fetch a single post by id (for editing) */
export async function fetchPost(id: number, token: string): Promise<Post> {
  return apiRequest<Post>(`/api/admin/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Admin-only: update a post */
export async function updatePost(
  id: number,
  payload: {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    categoryId?: number | null;
    published: boolean;
  },
  token: string,
): Promise<Post> {
  return apiRequest<Post>(`/api/posts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: payload,
  });
}

/** Admin-only: delete a post by id */
export async function deletePost(id: number, token: string): Promise<void> {
  await apiRequest<void>(`/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchPostBySlug(slug: string): Promise<Post> {
  return apiRequest<Post>(`/api/posts/${encodeURIComponent(slug)}`);
}
