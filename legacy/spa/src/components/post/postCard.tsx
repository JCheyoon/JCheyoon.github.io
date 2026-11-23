import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, BookOpen, Hash } from "lucide-react";
import { useCategoryCache, flattenCategories } from "@/lib/category-cache";
import type { Post } from "@/types/types";

interface PostCardProps {
  post: Post;
}

// 카테고리 트리에서 root -> leaf 순서의 전체 경로를 구합니다.
function getCategoryPath(
  categoryId: string | undefined,
  flatCats: { id: string; name: string; parentId?: string | null }[],
): string[] {
  if (!categoryId) return [];
  const map = new Map(flatCats.map((c) => [c.id, c]));
  const path: string[] = [];
  let current = map.get(categoryId);
  while (current) {
    path.unshift(current.name);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return path;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: categoryTree = [] } = useCategoryCache();
  const flatCats = flattenCategories(categoryTree);
  const categoryPath = getCategoryPath(post.categoryId, flatCats);

  const formattedDate = new Date(post.createdAt).toISOString().slice(0, 10);

  const category = searchParams.get("category");

  return (
    <article
      onClick={() =>
        navigate(
          category
            ? `/post/${post.slug}?category=${encodeURIComponent(category)}`
            : `/post/${post.slug}`,
        )
      }
      className="group cursor-pointer rounded-2xl border border-border bg-card px-6 py-5 transition hover:shadow-lg hover:border-border"
    >
      <div className="relative pl-5">
        <span className="absolute left-0 top-1.5 h-4 w-1 shrink-0 rounded-full bg-accent-bar" />
        <div className="flex-1 min-w-0 space-y-3">
          <h2 className="text-lg font-bold text-foreground leading-snug">
            {post.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>

            {categoryPath.length > 0 && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {categoryPath[0]}
              </span>
            )}

            {categoryPath.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {categoryPath.join(" / ")}
              </span>
            )}
          </div>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
