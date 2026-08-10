"use client";

import { useMemo, useState } from "react";

export type CategoryOption = {
  id: string;
  nameFa: string;
  parentId?: string | null;
};

export function CategoryFields({
  categories,
  defaultCategoryId = "",
}: {
  categories: CategoryOption[];
  defaultCategoryId?: string;
}) {
  const parents = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const initial = categories.find((c) => c.id === defaultCategoryId);
  const initialParentId = initial
    ? initial.parentId || initial.id
    : "";
  const initialChildId = initial?.parentId ? initial.id : "";

  const [parentId, setParentId] = useState(initialParentId);
  const [childId, setChildId] = useState(initialChildId);

  const children = useMemo(
    () => categories.filter((c) => c.parentId === parentId),
    [categories, parentId],
  );

  const categoryId = childId || parentId;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm">
        دسته
        <select
          value={parentId}
          onChange={(e) => {
            setParentId(e.target.value);
            setChildId("");
          }}
          className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 py-2 pr-3 pl-10"
        >
          <option value="">انتخاب دسته</option>
          {parents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameFa}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        زیردسته
        <select
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
          disabled={!parentId || children.length === 0}
          className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 py-2 pr-3 pl-10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {!parentId
              ? "ابتدا دسته را انتخاب کنید"
              : children.length === 0
                ? "بدون زیردسته (همین دسته)"
                : "بدون زیردسته / همه"}
          </option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameFa}
            </option>
          ))}
        </select>
      </label>

      <input type="hidden" name="categoryId" value={categoryId} />
    </div>
  );
}
