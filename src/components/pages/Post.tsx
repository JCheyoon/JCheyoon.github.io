import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug } from "@/lib/posts";
import { useCategoryCache, flattenCategories } from "@/lib/category-cache";
import type { Post } from "@/types/types";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data: categoryTree = [] } = useCategoryCache();
  const flatCats = flattenCategories(categoryTree);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery<Post>({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="p-6 text-muted-foreground">
        Post not found.{" "}
        <Link to="/" className="underline hover:text-foreground">
          Back to home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const catName = flatCats.find((c) => c.id === post.categoryId)?.name;
  const category = searchParams.get("category");

  return (
    <article className="max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {catName && (
            <span className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs">
              {catName}
            </span>
          )}
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          Jung cheyoon · {formattedDate}
        </p>
      </div>
      {post.excerpt && (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>
      )}
      <hr className="border-border" />
      <div
        className="prose prose-slate max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="pt-4">
        <Link
          to={category ? `/?category=${encodeURIComponent(category)}` : "/"}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          &larr; Back to all posts
        </Link>
      </div>
    </article>
  );
};

export default PostPage;
