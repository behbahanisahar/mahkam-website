import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/site/Footer";
import { MobileBottomNav } from "@/components/site/MobileBottomNav";
import { TelegramFab } from "@/components/site/TelegramFab";
import { IndustrialBackdrop } from "@/components/site/IndustrialBackdrop";
import { getSiteSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/products/queries";
import { categoriesWithProducts } from "@/components/site/nav-category";

/**
 * Cached layout shell. Categories use unstable_cache (not noStore) so home /
 * product / about pages can stay ISR-fast. Header still falls back to
 * /api/categories if the cached list is empty.
 */
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getCachedCategories().catch(() => []),
  ]);

  const navCategories = categoriesWithProducts(
    categories.map((c) => {
      const childProducts = c.children.reduce((sum, ch) => sum + ch._count.products, 0);
      return {
        slug: c.slug,
        nameFa: c.nameFa,
        productCount: c._count.products + childProducts,
        children: c.children.map((ch) => ({
          slug: ch.slug,
          nameFa: ch.nameFa,
          productCount: ch._count.products,
        })),
      };
    }),
  );

  return (
    <>
      <IndustrialBackdrop />
      <SiteHeader
        telegramUrl={settings.telegramUrl}
        phones={settings.phones}
        categories={navCategories}
      />
      <main className="relative w-full flex-1 pb-28 lg:pb-16">{children}</main>
      <Footer
        telegramUrl={settings.telegramUrl}
        phones={settings.phones}
        address={settings.address}
      />
      <MobileBottomNav telegramUrl={settings.telegramUrl} categories={navCategories} />
      <TelegramFab href={settings.telegramUrl} />
    </>
  );
}
