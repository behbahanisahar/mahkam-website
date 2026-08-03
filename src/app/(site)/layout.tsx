import { SiteHeader } from "@/components/site/SiteHeader";
import { Footer } from "@/components/site/Footer";
import { MobileBottomNav } from "@/components/site/MobileBottomNav";
import { TelegramFab } from "@/components/site/TelegramFab";
import { IndustrialBackdrop } from "@/components/site/IndustrialBackdrop";
import { getSiteSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/products/queries";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCachedCategories()]);

  const navCategories = categories.map((c) => {
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
  });

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
