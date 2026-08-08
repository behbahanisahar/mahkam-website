import { SubmitButton } from "@/components/ui/SubmitButton";
import { upsertProductAction } from "@/lib/actions/admin";
import { ImageUrlField } from "@/components/admin/ImageUrlField";

type Category = { id: string; nameFa: string; parentId?: string | null };

type ProductValue = {
  id?: string;
  nameFa?: string;
  slug?: string;
  shortDesc?: string | null;
  introduction?: string | null;
  wireStructure?: string | null;
  techSpecs?: string | null;
  applications?: string | null;
  advantages?: string | null;
  conductor?: string | null;
  categoryId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  specs?: unknown;
  imageUrl?: string;
};

function specsToText(specs: unknown): string {
  if (!specs || typeof specs !== "object") return "";
  return Object.entries(specs as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function categoryLabel(categories: Category[], c: Category): string {
  if (!c.parentId) return c.nameFa;
  const parent = categories.find((p) => p.id === c.parentId);
  return parent ? `${parent.nameFa} ← ${c.nameFa}` : c.nameFa;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductValue;
}) {
  const parents = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);
  const ordered = [
    ...parents.flatMap((p) => [p, ...children.filter((c) => c.parentId === p.id)]),
    ...children.filter((c) => !parents.some((p) => p.id === c.parentId)),
  ];

  return (
    <form action={upsertProductAction} className="space-y-4 rounded-2xl border border-glass-border/80 bg-white/70 p-4 shadow-sm sm:p-5">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          نام محصول (مثلاً سیم افشان ۰.۷۵×۱)
          <input
            name="nameFa"
            required
            defaultValue={product?.nameFa ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          اسلاگ (URL)
          <input
            name="slug"
            defaultValue={product?.slug ?? ""}
            placeholder="خودکار از نام ساخته می‌شود"
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
            dir="ltr"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm sm:col-span-2">
          دسته والد / زیردسته
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 py-2 pr-3 pl-10"
          >
            <option value="">بدون دسته</option>
            {ordered.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(categories, c)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          هادی
          <select
            name="conductor"
            defaultValue={product?.conductor ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 py-2 pr-3 pl-10"
          >
            <option value="">—</option>
            <option value="مس">مس</option>
            <option value="آلومینیوم">آلومینیوم</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        خلاصه کارت (اختیاری)
        <textarea
          name="shortDesc"
          rows={2}
          defaultValue={product?.shortDesc ?? ""}
          placeholder="اگر خالی باشد از معرفی محصول استفاده می‌شود"
          className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
        />
      </label>

      <div className="space-y-4 border-t border-glass-border/60 pt-4">
        <p className="text-xs font-medium text-copper">محتوای صفحه محصول</p>

        <label className="block text-sm">
          معرفی محصول
          <textarea
            name="introduction"
            rows={4}
            defaultValue={product?.introduction ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          ساختار سیم
          <textarea
            name="wireStructure"
            rows={4}
            defaultValue={product?.wireStructure ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          مشخصات فنی
          <textarea
            name="techSpecs"
            rows={4}
            defaultValue={product?.techSpecs ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          جدول مشخصات (هر خط: کلید: مقدار)
          <textarea
            name="specs"
            rows={4}
            defaultValue={specsToText(product?.specs)}
            placeholder={"سطح مقطع: ۰.۷۵\nولتاژ نامی: ۴۵۰/۷۵۰ ولت"}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          کاربردها
          <textarea
            name="applications"
            rows={4}
            defaultValue={product?.applications ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          مزایا
          <textarea
            name="advantages"
            rows={4}
            defaultValue={product?.advantages ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        تصویر محصول
        <div className="mt-1">
          <ImageUrlField defaultValue={product?.imageUrl ?? ""} />
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          عنوان سئو
          <input
            name="seoTitle"
            defaultValue={product?.seoTitle ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          ترتیب نمایش
          <input
            name="sortOrder"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        توضیحات سئو
        <textarea
          name="seoDescription"
          rows={2}
          defaultValue={product?.seoDescription ?? ""}
          className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
        />
      </label>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input name="isPublished" type="checkbox" defaultChecked={product?.isPublished ?? true} />
          انتشار
        </label>
        <label className="inline-flex items-center gap-2">
          <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} />
          نمایش در صفحه اصلی
        </label>
      </div>

      <SubmitButton
        className="btn-copper rounded-xl px-5 py-3 text-sm font-semibold"
        pendingLabel="در حال ذخیره…"
      >
        ذخیره محصول
      </SubmitButton>
    </form>
  );
}
