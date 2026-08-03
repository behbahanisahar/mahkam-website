import { NextRequest, NextResponse } from "next/server";
import { recordProductView } from "@/lib/products/popularity";

type Props = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  const { slug } = await params;

  let visitorKey: string | undefined;
  let source: string | undefined;
  try {
    const body = (await req.json()) as { visitorKey?: string; source?: string };
    visitorKey = body.visitorKey;
    source = body.source;
  } catch {
    visitorKey = undefined;
    source = undefined;
  }

  const result = await recordProductView({
    slug,
    source,
    visitorKey,
    referrer: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  });

  if (result.reason === "not_found") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...result });
}
