import { apiRequest } from "./api";
import type { Category } from "@/types/types";

/** Public: returns nested category tree (for sidebar) */
export async function fetchCategoryTree(): Promise<Category[]> {
  const data = await apiRequest<Category[] | null>("/api/categories");
  return data ?? [];
}

/** Admin: returns flat category list (for management UI) */
export async function fetchFlatCategories(token: string): Promise<Category[]> {
  const data = await apiRequest<Category[] | null>("/api/admin/categories", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data ?? [];
}

export async function createCategory(
  body: { name: string; parentId?: number | null },
  token: string,
): Promise<Category> {
  return apiRequest<Category>("/api/admin/categories", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
}

export async function updateCategory(
  id: number,
  body: { name?: string; parentId?: number | null },
  token: string,
): Promise<Category> {
  return apiRequest<Category>(`/api/admin/categories/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  await apiRequest<void>(`/api/admin/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
