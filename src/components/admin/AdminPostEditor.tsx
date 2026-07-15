import { useState } from "react";
import type { FormEvent } from "react";
import { useAdminAuth } from "./AdminAuthProvider";
import { createAdminPost } from "@/lib/adminAuth";

export default function AdminPostEditor() {
  const { token } = useAdminAuth();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setMessage("로그인이 만료되었습니다. 다시 로그인하세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createAdminPost(token, {
        title,
        slug,
        excerpt,
        content,
        status,
      });
      setMessage("포스트가 업로드되었습니다.");
    } catch {
      setMessage(
        "포스트 업로드에 실패했습니다. 백엔드 엔드포인트와 JWT 검증을 확인하세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          New post
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">
          Write and publish
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          백엔드가 받는 payload에 맞춰 제목, slug, excerpt, content, status를
          전송합니다.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
              placeholder="Post title"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
              placeholder="post-title"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Excerpt</span>
          <input
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
            placeholder="Short summary for list pages"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Content</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            rows={14}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-950 outline-none transition focus:border-slate-950"
            placeholder="Write markdown or HTML here..."
          />
        </label>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "draft" | "published")
              }
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Uploading..." : "Upload post"}
          </button>
        </div>

        {message ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
