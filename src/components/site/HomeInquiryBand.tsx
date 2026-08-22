import Link from "next/link";
import { ArrowLeft, Phone, Send } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { formatPhoneFa } from "@/lib/i18n/fa";
import { getTelegramHandleLabel } from "@/lib/site";

type Props = {
  telegramUrl: string;
  phone: string;
};

export function HomeInquiryBand({ telegramUrl, phone }: Props) {
  const telHref = `tel:${phone.replace(/\D/g, "")}`;

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-[0.18em] text-copper-light">استعلام</p>
              <h2 className="brand-display mt-3 text-3xl font-extrabold leading-[1.2] sm:text-4xl">
                استعلام قیمت و پیش‌فاکتور
              </h2>
              <p className="mt-4 text-sm leading-8 text-white/75 sm:text-[15px]">
                برای لیست قیمت روز، هماهنگی سفارش و صدور پیش‌فاکتور از کانال تلگرام یا تلفن فروش با
                مهکام در ارتباط باشید.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-modern inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-5 py-3 text-sm font-bold text-white hover:bg-[#1b8fc7]"
              >
                <Send className="size-4" />
                <span dir="ltr">{getTelegramHandleLabel()}</span>
              </a>
              <a
                href={telHref}
                className="btn-modern inline-flex items-center justify-center gap-2 rounded-full bg-copper px-5 py-3 text-sm font-bold text-white hover:bg-copper-deep"
              >
                <Phone className="size-4" />
                <span dir="ltr">{formatPhoneFa(phone)}</span>
              </a>
              <Link
                href="/contact"
                className="btn-modern inline-flex items-center justify-center gap-2 border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white hover:text-ink"
              >
                تماس با ما
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
