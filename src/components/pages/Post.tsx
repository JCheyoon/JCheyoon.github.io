import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug } from "@/lib/posts";
import type { Post } from "@/types/types";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();

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
    return <div className="p-6 text-slate-500">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="p-6 text-slate-500">
        Post not found.{" "}
        <Link to="/" className="underline hover:text-slate-800">
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

  return (
    <article className="max-w-3xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-slate-950">{post.title}</h1>
        <p className="text-sm text-slate-500">Jung cheyoon · {formattedDate}</p>
      </div>
      {post.excerpt && (
        <p className="text-lg text-slate-600 leading-relaxed">{post.excerpt}</p>
      )}
      <hr className="border-slate-200" />
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="pt-4">
        <Link
          to="/"
          className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-800"
        >
          &larr; Back to all posts
        </Link>
      </div>
    </article>
  );
};

export default PostPage;
