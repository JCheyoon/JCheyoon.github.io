import { useNavigate } from "react-router-dom";
import type { Post } from "@/types/types";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      onClick={() => navigate(`/post/${post.slug}`)}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-lg hover:border-slate-300"
    >
      {post.tags.length > 0 && (
        <p className="text-sm font-medium text-slate-500 mb-2">
          {post.tags[0]}
        </p>
      )}
      <h2 className="text-xl font-bold text-slate-950 mb-2">{post.title}</h2>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{post.excerpt}</p>
      <div className="text-xs text-slate-400">
        <span className="font-semibold">Jung cheyoon</span>
        {" · "}
        {formattedDate}
      </div>
    </article>
  );
}
