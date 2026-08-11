import { SubmitButton } from "@/components/ui/SubmitButton";
import { upsertProductAction } from "@/lib/actions/admin";
import { ImageUrlField } from "@/components/admin/ImageUrlField";
import { CategoryFields, type CategoryOption } from "@/components/admin/CategoryFields";
import { LtrAwareText } from "@/components/ui/LtrAwareText";

type ProductValue = {
  id?: string;
  nameFa?: string;
  slug?: string;
  introduction?: string | null;
  wireStructure?: string | null;
  techSpecs?: string | null;
  applications?: string | null;
  advantages?: string | null;
  categoryId?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  imageUrl?: string;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductValue;
}) {
  return (
    <form
      action={upsertProductAction}
      className="space-y-4 rounded-2xl border border-glass-border/80 bg-white/70 p-4 shadow-sm sm:p-5"
    >
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

        <label className="block text-sm">
          نام محصول
          <span className="mt-0.5 block text-xs text-muted">
            مثل نمایش ورد: سیم افشان 1×0.75 — متن راست‌به‌چپ، عدد چپ‌به‌راست
          </span>
          <input
            name="nameFa"
            required
            defaultValue={product?.nameFa ?? ""}
            placeholder="سیم افشان 1×0.75"
            dir="rtl"
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>
        {product?.nameFa ? (
          <p className="text-xs text-muted">
            پیش‌نمایش:{" "}
            <LtrAwareText text={product.nameFa} className="font-semibold text-ink" />
          </p>
        ) : null}

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

      <CategoryFields
        categories={categories}
        defaultCategoryId={product?.categoryId ?? ""}
      />

      <div className="space-y-4 border-t border-glass-border/60 pt-4">
        <p className="text-xs font-medium text-copper">محتوای صفحه محصول (مطابق کاتالوگ)</p>

        <label className="block text-sm">
          معرفی محصول
          <textarea
            name="introduction"
            rows={5}
            required
            defaultValue={product?.introduction ?? ""}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          ساختار سیم
          <span className="mt-0.5 block text-xs text-muted">
            در صورت نیاز فرمول ساختار را هم در همین بخش بنویسید
          </span>
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

      <div className="grid gap-4 border-t border-glass-border/60 pt-4 sm:grid-cols-2">
        <label className="block text-sm">
          ترتیب نمایش
          <input
            name="sortOrder"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
            className="mt-1 w-full rounded-xl border border-glass-border bg-white/80 px-3 py-2"
            dir="ltr"
          />
        </label>
        <div className="flex flex-wrap items-end gap-4 pb-1 text-sm">
          <label className="inline-flex items-center gap-2">
            <input name="isPublished" type="checkbox" defaultChecked={product?.isPublished ?? true} />
            انتشار
          </label>
          <label className="inline-flex items-center gap-2">
            <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} />
            نمایش در صفحه اصلی
          </label>
        </div>
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
