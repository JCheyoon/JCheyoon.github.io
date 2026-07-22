import { apiRequest } from "./api";
import type { Post } from "@/types/types";

export async function fetchPosts(tag?: string): Promise<Post[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  const data = await apiRequest<Post[] | null>(`/api/posts${query}`);
  return data ?? [];
}

/** Admin-only: fetch all posts including drafts */
export async function fetchAllPosts(): Promise<Post[]> {
  const data = await apiRequest<Post[] | null>("/api/posts?all=true");
  return data ?? [];
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
