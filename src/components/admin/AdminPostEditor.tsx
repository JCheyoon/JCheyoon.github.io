import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "./AdminAuthProvider";
import { createAdminPost } from "@/lib/adminAuth";
import { fetchPost, updatePost } from "@/lib/posts";
import { useCategoryCache, flattenCategories } from "@/lib/category-cache";
import TextEditor from "./textEditor";

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const isEdit = Boolean(id);

  const { data: categoryTree = [] } = useCategoryCache();
  const flatCats = flattenCategories(categoryTree);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load existing post data when editing
  const { data: existing } = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => fetchPost(Number(id!), token!),
    enabled: isEdit && !!token,
  });

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setExcerpt(existing.excerpt);
    setContent(existing.content);
    setTags(existing.tags);
    setCategoryId(existing.categoryId ?? "");
    setStatus(existing.published ? "published" : "draft");
  }, [existing]);

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
      const payload = {
        title,
        excerpt,
        content,
        tags: finalTags,
        categoryId: categoryId !== "" ? Number(categoryId) : null,
        published: status === "published",
      };

      if (isEdit) {
        await updatePost(Number(id), payload, token);
        setMessage("포스트가 수정되었습니다.");
      } else {
        await createAdminPost(token, payload);
        setMessage("포스트가 업로드되었습니다.");
      }
    } catch {
      setMessage(
        isEdit
          ? "포스트 수정에 실패했습니다."
          : "포스트 업로드에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          {isEdit ? "Edit post" : "New post"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">
          {isEdit ? "Edit and update" : "Write and publish"}
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

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
            >
              <option value="">— No category —</option>
              {flatCats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
              placeholder="Type a tag and press Enter"
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

          <div className="flex gap-3">
            {isEdit && (
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Uploading..."
                : isEdit
                  ? "Update post"
                  : "Upload post"}
            </button>
          </div>
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
