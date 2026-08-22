"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";

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
        <Select
          value={parentId}
          onChange={(value) => {
            setParentId(value);
            setChildId("");
          }}
          className="mt-1"
          options={[
            { value: "", label: "انتخاب دسته" },
            ...parents.map((c) => ({ value: c.id, label: c.nameFa })),
          ]}
        />
      </label>

      <label className="block text-sm">
        زیردسته
        <Select
          value={childId}
          onChange={setChildId}
          disabled={!parentId || children.length === 0}
          className="mt-1"
          options={[
            {
              value: "",
              label: !parentId
                ? "ابتدا دسته را انتخاب کنید"
                : children.length === 0
                  ? "بدون زیردسته (همین دسته)"
                  : "بدون زیردسته / همه",
            },
            ...children.map((c) => ({ value: c.id, label: c.nameFa })),
          ]}
        />
      </label>

      <input type="hidden" name="categoryId" value={categoryId} />
    </div>
  );
}
