"use client";

/**
 * Must stay self-contained: root-layout failures replace the entire document.
 * Do not import app components, lucide, or shared CSS modules here — those
 * can fail with the same bug that triggered global-error and leave a blank page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof console !== "undefined") {
    console.error(error);
  }

  const digest = error.digest;

  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>خطای سیستمی | مهکام</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { color-scheme: light; }
              * { box-sizing: border-box; }
              body {
                margin: 0;
                min-height: 100vh;
                font-family: Tahoma, Arial, sans-serif;
                color: #111318;
                background:
                  radial-gradient(ellipse at top, rgba(184,149,42,0.12), transparent 55%),
                  linear-gradient(180deg, #f7f6f4 0%, #eef0f3 100%);
              }
              .wrap {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem 1rem;
              }
              .card {
                width: 100%;
                max-width: 28rem;
                overflow: hidden;
                border-radius: 1.5rem;
                border: 1px solid rgba(17,19,24,0.08);
                background: rgba(255,255,255,0.92);
                box-shadow: 0 20px 50px -28px rgba(17,19,24,0.45);
              }
              .head {
                background: #1a1d24;
                color: #fff;
                padding: 1rem 1.5rem;
              }
              .head .brand {
                margin: 0;
                font-size: 0.7rem;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: #d4b45a;
                font-weight: 700;
              }
              .head .sub {
                margin: 0.25rem 0 0;
                font-size: 0.85rem;
                color: rgba(255,255,255,0.7);
              }
              .body {
                padding: 2rem 1.5rem 2.25rem;
                text-align: center;
              }
              .code {
                margin: 0;
                font-size: 3.25rem;
                font-weight: 800;
                color: #b8952a;
                letter-spacing: -0.03em;
              }
              h1 {
                margin: 1rem 0 0;
                font-size: 1.35rem;
                font-weight: 700;
              }
              .desc {
                margin: 0.75rem auto 0;
                max-width: 22rem;
                font-size: 0.95rem;
                line-height: 1.7;
                color: #5c6370;
              }
              .ref {
                margin: 1rem 0 0;
                font-family: ui-monospace, monospace;
                font-size: 0.65rem;
                color: #8a919c;
                direction: ltr;
              }
              .actions {
                margin-top: 1.75rem;
                display: flex;
                flex-wrap: wrap;
                gap: 0.6rem;
                justify-content: center;
              }
              button, a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 0.75rem;
                padding: 0.75rem 1.25rem;
                font-size: 0.9rem;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                border: none;
                font-family: inherit;
              }
              .primary {
                background: #b8952a;
                color: #111;
              }
              .primary:hover { filter: brightness(1.05); }
              .secondary {
                background: #111318;
                color: #fff;
              }
              .secondary:hover { filter: brightness(1.1); }
              .links {
                margin-top: 1rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
                font-size: 0.8rem;
              }
              .links a { color: #5c6370; padding: 0; background: none; }
              .links a:hover { color: #b8952a; }
            `,
          }}
        />
      </head>
      <body>
        <div className="wrap">
          <div className="card" role="alert">
            <div className="head">
              <p className="brand">مهکام · MAHKAM</p>
              <p className="sub">گسترش سیم و کابل</p>
            </div>
            <div className="body">
              <p className="code">۵۰۰</p>
              <h1>خطای سیستمی</h1>
              <p className="desc">
                سامانه موقتاً با مشکل مواجه شده است. لطفاً چند لحظه دیگر دوباره تلاش کنید.
              </p>
              {digest ? <p className="ref">ref: {digest}</p> : null}
              <div className="actions">
                <button type="button" className="primary" onClick={() => reset()}>
                  تلاش دوباره
                </button>
                <a className="secondary" href="/">
                  صفحه اصلی
                </a>
              </div>
              <div className="links">
                <a href="/products">محصولات</a>
                <a href="/contact">تماس با ما</a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
