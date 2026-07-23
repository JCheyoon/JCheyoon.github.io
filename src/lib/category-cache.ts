import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategoryTree } from "./categories";
import type { Category } from "@/types/types";

const CATEGORY_KEY = ["categories"];

/** Flatten a nested category tree into a list of { id, name, slug }. */
export function flattenCategories(
  tree: Category[],
): { id: number; name: string; slug: string }[] {
  const result: { id: number; name: string; slug: string }[] = [];
  for (const cat of tree) {
    result.push({ id: cat.id, name: cat.name, slug: cat.slug });
    if (cat.children) {
      for (const child of cat.children) {
        result.push({ id: child.id, name: child.name, slug: child.slug });
      }
    }
  }
  return result;
}

/**
 * Hook to consume categories from the static cache.
 * staleTime: Infinity means it's fetched once and never refetched.
 * To refresh, call invalidateCategoryCache() after an admin mutation.
 */
export function useCategoryCache() {
  return useQuery<Category[]>({
    queryKey: CATEGORY_KEY,
    queryFn: fetchCategoryTree,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/** Call after any admin category mutation to bust the cache. */
export function useInvalidateCategoryCache() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: CATEGORY_KEY });
}
