import { useState } from "react";
import type { FormEvent } from "react";
import { useAdminAuth } from "./AdminAuthProvider";
import { createAdminPost } from "@/lib/adminAuth";
import TextEditor from "./textEditor";

const tagsPlaceholder = "Type a tag and press Enter";

export default function AdminPostEditor() {
  const { token } = useAdminAuth();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // flush any remaining tag input before submit
    const finalTags = tagInput.trim()
      ? tags.includes(tagInput.trim())
        ? tags
        : [...tags, tagInput.trim()]
      : tags;

    if (!token) {
      setMessage("로그인이 만료되었습니다. 다시 로그인하세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createAdminPost(token, {
        title,
        excerpt,
        content,
        tags: finalTags,
        published: status === "published",
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
          <span className="text-sm font-medium text-slate-700">Tags</span>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-slate-950">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-slate-950 outline-none placeholder:text-slate-400"
              placeholder={tagsPlaceholder}
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Content</span>
          <TextEditor content={content} onChange={setContent} />
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
