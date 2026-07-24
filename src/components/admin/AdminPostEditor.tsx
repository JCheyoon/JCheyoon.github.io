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
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {isEdit ? "Edit post" : "New post"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">
          {isEdit ? "Edit and update" : "Write and publish"}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-foreground outline-none transition focus:border-primary"
              placeholder="Post title"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-foreground outline-none transition focus:border-primary"
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
          <span className="text-sm font-medium text-foreground">Excerpt</span>
          <input
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-foreground outline-none transition focus:border-primary"
            placeholder="Short summary for list pages"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Tags</span>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted/50 px-3 py-2 transition focus-within:border-primary">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-foreground outline-none placeholder:text-muted-foreground"
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
            <span className="text-sm font-medium text-foreground">Status</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "draft" | "published")
              }
              className="block rounded-2xl border border-border bg-muted/50 px-4 py-3 text-foreground outline-none transition focus:border-primary"
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
                className="rounded-2xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
          <p className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
