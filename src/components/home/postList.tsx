import { useState } from "react";
import PostCard from "@/components/post/postCard";
import type { Post } from "@/types/types";

interface PostListProps {
  posts: Post[];
}

const POSTS_PER_PAGE = 6;

export default function PostList({ posts }: PostListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagedPosts = posts.slice(start, start + POSTS_PER_PAGE);

  if (posts.length === 0) {
    return (
      <p className="text-sm text-slate-500">No posts in this category yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {pagedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-full text-sm font-medium transition ${
                p === page
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
