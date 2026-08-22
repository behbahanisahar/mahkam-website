import { readFileSync, existsSync } from "fs";
import path from "path";

const assets = path.join(
  process.env.HOME,
  ".cursor/projects/Users-saharbehbahani-mahkam/assets",
);
const catv2Dir = path.join(assets, "catalog-v2");
const queue = JSON.parse(
  readFileSync(new URL("./catalog-v2-queue.json", import.meta.url), "utf8"),
);

const missing = queue.filter((e) => {
  const catv2 = path.join(assets, `catv2-${e.slug}.png`);
  const catalog = path.join(catv2Dir, `${e.slug}.png`);
  return !existsSync(catv2) && !existsSync(catalog);
});

const done = queue.length - missing.length;
console.log(JSON.stringify({ total: queue.length, done, missing: missing.length, slugs: missing.map((e) => e.slug) }, null, 0));
