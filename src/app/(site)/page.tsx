import { ProductEditorialList } from "@/components/products/ProductEditorialList";
import { LivePricesStrip } from "@/components/prices/LivePricesStrip";
import { HeroSection } from "@/components/site/HeroSection";
import { HomeAboutSection } from "@/components/site/HomeAboutSection";
import { HomeFaqTeaser } from "@/components/site/HomeFaqTeaser";
import { HomeInquiryBand } from "@/components/site/HomeInquiryBand";
import { HomeOrangeBand } from "@/components/site/HomeOrangeBand";
import { ValuesMarquee } from "@/components/site/ValuesMarquee";
import { WebSiteJsonLd } from "@/components/seo/OrganizationJsonLd";
import { getSiteSettings } from "@/lib/settings";
import { getAllTimePopularProducts, getFeaturedProducts } from "@/lib/products/popularity";
import { getLiveDataRates } from "@/lib/prices/livedata";
import { snapshotsAsLiveDataFallback } from "@/lib/prices/snapshots";
import { SITE_PAGE_META } from "@/lib/seo/site-pages";

/** ISR: rebuild HTML every 5 minutes; data also cached via unstable_cache tags. */
export const revalidate = 300;

export const metadata = SITE_PAGE_META.home;

export default async function HomePage() {
  const [settings, popular, liveRates] = await Promise.all([
    getSiteSettings(),
    getAllTimePopularProducts(6),
    getLiveDataRates().catch(() => ({ rates: [], fetchedAt: new Date().toISOString() })),
  ]);

  const products =
    popular.length > 0 ? popular : await getFeaturedProducts(6);
  const subtitle =
    popular.length > 0 ? "پربازدیدترین محصولات" : "منتخب کاتالوگ مهکام";

  const initialPrices =
    liveRates.rates.length > 0
      ? liveRates
      : ((await snapshotsAsLiveDataFallback().catch(() => null)) ?? liveRates);

  const blurb =
    settings.companyBlurb ??
    "شرکت گسترش سیم و کابل مهکام با تمرکز بر کیفیت، شفافیت مشخصات فنی و پشتیبانی مشتریان فعالیت می‌کند.";

  const primaryPhone = settings.phones[0] ?? "02166349014";

  return (
    <>
      <WebSiteJsonLd />
      <HeroSection telegramUrl={settings.telegramUrl} />
      <HomeAboutSection blurb={blurb} />
      <LivePricesStrip initial={initialPrices} />
      <ProductEditorialList
        title="کاتالوگ سیم و کابل"
        subtitle={subtitle}
        products={products}
        emptyMessage="هنوز محصولی منتشر نشده است. از پنل مدیریت اضافه کنید."
      />
      <HomeInquiryBand telegramUrl={settings.telegramUrl} phone={primaryPhone} />
      <HomeOrangeBand telegramUrl={settings.telegramUrl} />
      <ValuesMarquee />
      <HomeFaqTeaser />
    </>
  );
}
