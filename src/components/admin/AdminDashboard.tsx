import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchAllPosts, deletePost } from "@/lib/posts";
import { useAdminAuth } from "./AdminAuthProvider";
import type { Post } from "@/types/types";

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["admin", "posts"],
    queryFn: fetchAllPosts,
  });

  const del = useMutation({
    mutationFn: (id: number) => deletePost(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          + New post
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-foreground">
          All posts ({posts.length})
        </h3>

        <div className="mt-4 space-y-3">
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          )}

          {posts.map((post) => {
            return (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {post.title}
                    </span>
                    {!post.published && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/posts/${post.id}/edit`}
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this post?")) {
                        del.mutate(post.id);
                      }
                    }}
                    disabled={del.isPending}
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
