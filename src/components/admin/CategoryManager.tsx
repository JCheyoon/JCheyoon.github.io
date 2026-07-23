import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "./AdminAuthProvider";
import {
  fetchFlatCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/categories";
import { useInvalidateCategoryCache } from "@/lib/category-cache";
import type { Category } from "@/types/types";

export default function CategoryManager() {
  const { token } = useAdminAuth();
  const qc = useQueryClient();
  const invalidateCache = useInvalidateCategoryCache();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: () => fetchFlatCategories(token!),
    enabled: !!token,
  });

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<number | null>(null);
  const [editing, setEditing] = useState<{
    id: number;
    name: string;
    parentId: number | null;
  } | null>(null);

  const createMut = useMutation({
    mutationFn: (body: { name: string; parentId?: number | null }) =>
      createCategory(body, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      invalidateCache();
      setNewName("");
      setNewParent(null);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      name,
      parentId,
    }: {
      id: number;
      name: string;
      parentId: number | null;
    }) => updateCategory(id, { name, parentId }, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      invalidateCache();
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteCategory(id, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      invalidateCache();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMut.mutate({ name: newName.trim(), parentId: newParent });
  };

  const rootCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Categories
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">
          Manage categories
        </h2>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Name
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
            placeholder="Category name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Parent (optional)
          </label>
          <select
            value={newParent ?? ""}
            onChange={(e) =>
              setNewParent(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
          >
            <option value="">— Top-level —</option>
            {rootCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={createMut.isPending}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {createMut.isPending ? "..." : "Add"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-4">
        {rootCategories.length === 0 && subCategories.length === 0 && (
          <p className="text-sm text-slate-500">No categories yet.</p>
        )}

        {/* Top-level categories */}
        {rootCategories.map((cat) => (
          <CategoryRow
            key={cat.id}
            category={cat}
            subCategories={subCategories.filter((s) => s.parentId === cat.id)}
            allCategories={categories}
            editing={editing}
            onEdit={setEditing}
            onUpdate={(id, name, parentId) =>
              updateMut.mutate({ id, name, parentId })
            }
            onDelete={(id) => {
              if (window.confirm("Delete this category?")) deleteMut.mutate(id);
            }}
            isPending={deleteMut.isPending || updateMut.isPending}
          />
        ))}

        {/* Orphan sub-categories */}
        {subCategories
          .filter(
            (s) => !s.parentId || !categories.find((c) => c.id === s.parentId),
          )
          .map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              subCategories={[]}
              allCategories={categories}
              editing={editing}
              onEdit={setEditing}
              onUpdate={(id, name, parentId) =>
                updateMut.mutate({ id, name, parentId })
              }
              onDelete={(id) => {
                if (window.confirm("Delete this category?"))
                  deleteMut.mutate(id);
              }}
              isPending={deleteMut.isPending || updateMut.isPending}
            />
          ))}
      </div>
    </div>
  );
}

function CategoryRow({
  category: cat,
  subCategories,
  allCategories,
  editing,
  onEdit,
  onUpdate,
  onDelete,
  isPending,
}: {
  category: Category;
  subCategories: Category[];
  allCategories: Category[];
  editing: { id: number; name: string; parentId: number | null } | null;
  onEdit: (
    e: { id: number; name: string; parentId: number | null } | null,
  ) => void;
  onUpdate: (id: number, name: string, parentId: number | null) => void;
  onDelete: (id: number) => void;
  isPending: boolean;
}) {
  const isEditing = editing?.id === cat.id;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      {isEditing ? (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Name
            </label>
            <input
              value={editing.name}
              onChange={(e) => onEdit({ ...editing, name: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Parent
            </label>
            <select
              value={editing.parentId ?? ""}
              onChange={(e) =>
                onEdit({
                  ...editing,
                  parentId: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-950"
            >
              <option value="">— Top-level —</option>
              {allCategories
                .filter((c) => c.id !== cat.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                onUpdate(editing.id, editing.name, editing.parentId)
              }
              disabled={isPending || !editing.name.trim()}
              className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              Save
            </button>
            <button
              onClick={() => onEdit(null)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-900">
              {cat.name}
            </span>
            {cat.parentId && (
              <span className="ml-2 text-xs text-slate-400">sub</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                onEdit({
                  id: cat.id,
                  name: cat.name,
                  parentId: cat.parentId ?? null,
                })
              }
              className="rounded-full px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              disabled={isPending}
              className="rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {subCategories.length > 0 && (
        <div className="ml-6 mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
          {subCategories.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
            >
              <span className="text-sm text-slate-700">{sub.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    onEdit({
                      id: sub.id,
                      name: sub.name,
                      parentId: sub.parentId ?? null,
                    })
                  }
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(sub.id)}
                  disabled={isPending}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
