import { getSiteSettings } from "@/lib/settings";
import { absoluteUrl, getSiteName, getSiteUrl } from "@/lib/site";

export function OrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: "مهکام",
    url: siteUrl,
    logo: absoluteUrl("/images/mahkam-logo.png"),
    description:
      "تولیدکننده انواع سیم و کابل برق با مشخصات فنی شفاف و استعلام قیمت از کانال تلگرام.",
    sameAs: [process.env.TELEGRAM_URL ?? "https://t.me/mahkam_cable"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/** LocalBusiness + geo for Google Maps / local SEO */
export async function LocalBusinessJsonLd() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const settings = await getSiteSettings();
  const phones = settings.phones.length > 0 ? settings.phones : ["02166349014"];
  const address =
    settings.address?.trim() ||
    "تهران، خیابان لاله‌زار نو، کوچه معمار مخصوص، پاساژ چلچراغ، طبقه ۴، واحد ۱۰";
  const lat = settings.mapLat ?? 35.700348;
  const lng = settings.mapLng ?? 51.42455;
  const telegram = settings.telegramUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: siteName,
    alternateName: "مهکام",
    url: siteUrl,
    image: absoluteUrl("/images/mahkam-logo.png"),
    logo: absoluteUrl("/images/mahkam-logo.png"),
    description:
      "تولید و عرضه سیم و کابل برق در لاله‌زار؛ مشخصات فنی شفاف و استعلام قیمت از تلگرام.",
    telephone: phones.map((p) => p.replace(/\s/g, "")),
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "تهران",
      addressRegion: "تهران",
      addressCountry: "IR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
    sameAs: [telegram],
    areaServed: {
      "@type": "City",
      name: "تهران",
    },
    priceRange: "$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
