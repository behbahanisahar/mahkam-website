#!/usr/bin/env python3
"""Split dumped «قابل انعطاف» copy out of earth-70 into two catalog JSON files."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AFSHAN = ROOT / "prisma/data/afshan-catalog.json"

TITLE_RE = re.compile(
    r"(کابل افشان قابل انعطاف(?:\s*فیلردار)?)\s*"
    r"([0-9]+(?:\.[0-9]+)?(?:\s*\+\s*[0-9]+(?:\.[0-9]+)?)?\s*[×xX]\s*[0-9]+)",
)

STRUCT_SIZE_RE = re.compile(
    r"به صورت\s+(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)(?:\s*\+\s*(?:1\s*[×xX]\s*)?(\d+(?:\.\d+)?))?",
)


def slug_size(cores: str, section: str, neutral: str | None) -> str:
    def n(x: str) -> str:
        return x.replace(".", "-")

    if neutral:
        return f"{cores}x{n(section)}-{n(neutral)}"
    return f"{cores}x{n(section)}"


def parse_word_size(raw: str) -> tuple[str, str, str | None]:
    """Word stored section×cores, or N+M×3 meaning 3×M+N."""
    s = re.sub(r"\s+", "", raw.replace("x", "×").replace("X", "×"))
    m = re.fullmatch(
        r"(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)×(\d+)",
        s,
    )
    if m:
        # 16+25×3 → 3×25+16
        return m.group(3), m.group(2), m.group(1)
    m = re.fullmatch(r"(\d+(?:\.\d+)?)×(\d+)", s)
    if not m:
        raise ValueError(raw)
    a, b = m.group(1), m.group(2)
    # section×cores when cores is small integer 2–5
    if b in {"2", "3", "4", "5"} and (float(a) != float(b) or "." in a):
        return b, a, None
    return a, b, None


def first_block(text: str) -> str:
    parts = re.split(r"\nکابل افشان قابل انعطاف", text, maxsplit=1)
    return parts[0].strip()


def split_by_title(text: str) -> list[dict]:
    matches = list(TITLE_RE.finditer(text))
    out = []
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[m.end() : end].strip()
        filler = "فیلردار" in m.group(1)
        out.append({"raw_size": m.group(2).strip(), "filler": filler, "body": body})
    return out


def split_struct(body: str) -> tuple[str, str]:
    parts = re.split(r"\nساختار کابل\n", body, maxsplit=1)
    intro = parts[0].strip()
    structure = parts[1].strip() if len(parts) > 1 else ""
    return intro, structure


def main() -> None:
    data = json.loads(AFSHAN.read_text())
    earth = next(p for p in data if p["slug"] == "sim-afshan-earth-70x1")

    intro_chunks = split_by_title(earth["introduction"])
    adv_chunks = { (c["filler"], c["raw_size"].replace(" ", "")): c["body"] for c in split_by_title(earth["advantages"]) }
    app_chunks = split_by_title(earth["applications"])
    spec_paras = [p.strip() for p in earth["techSpecs"].split("\n") if p.strip()]

    flex, filler = [], []
    spec_i = 1  # skip earth's first techSpecs paragraph
    app_i = 0
    # applications first chunk is still earth — skip until first کابل
    apps = split_by_title(earth["applications"])

    for i, chunk in enumerate(intro_chunks):
        intro, structure = split_struct(chunk["body"])
        cores, section, neutral = parse_word_size(chunk["raw_size"])
        sm = STRUCT_SIZE_RE.search(structure)
        if sm:
            cores, section, extra = sm.group(1), sm.group(2), sm.group(3)
            if extra:
                # 3×25+16 stored as 3 × 25 + 1×16 → cores=3 section=25 neutral=16
                # or 3×25+1×16
                if extra and not neutral:
                    # if formula is 3×25 + 16
                    if float(extra) < float(section) or True:
                        # structure "3×25+1×16" groups: cores=3, section=25, extra=16
                        # structure "3×70+1×35"
                        cores, section, neutral = sm.group(1), sm.group(2), extra
        if sm and sm.group(3):
            cores, section, neutral = sm.group(1), sm.group(2), sm.group(3)

        size_label = f"{cores}×{section}" + (f"+{neutral}" if neutral else "")
        kind = "filler" if chunk["filler"] else "flex"
        prefix = "cable-flex-filler" if chunk["filler"] else "cable-flex"
        slug = f"{prefix}-{slug_size(cores, section, neutral)}"
        name = ("کابل افشان قابل انعطاف فیلردار " if chunk["filler"] else "کابل افشان قابل انعطاف ") + size_label

        key = (chunk["filler"], chunk["raw_size"].replace(" ", ""))
        advantages = adv_chunks.get(key, "").strip()
        # advantages body after title is just the advantages paragraph
        advantages = re.sub(r"^کابل[^\n]*\n?", "", advantages).strip()
        applications = apps[i]["body"].strip() if i < len(apps) else ""
        tech = spec_paras[spec_i] if spec_i < len(spec_paras) else ""
        spec_i += 1

        rec = {
            "category": "کابل افشان قابل انعطاف فیلردار" if chunk["filler"] else "کابل های افشان قابل انعطاف",
            "nameFa": name,
            "slug": slug,
            "isFiller": chunk["filler"],
            "sizeLabel": size_label,
            "cores": int(float(cores)),
            "section": section,
            "neutral": neutral,
            "conductor": "مس",
            "imagePath": f"/images/catalog/{slug}.webp?v=flex1",
            "introduction": intro,
            "wireStructure": structure,
            "techSpecs": tech,
            "applications": applications,
            "advantages": advantages,
        }
        (filler if chunk["filler"] else flex).append(rec)

    (ROOT / "prisma/data/flex-catalog.json").write_text(
        json.dumps(flex, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (ROOT / "prisma/data/flex-filler-catalog.json").write_text(
        json.dumps(filler, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"flex {len(flex)}  filler {len(filler)}")
    for p in flex + filler:
        print(f"  {p['slug']:32}  {p['nameFa']}  cores={p['cores']} n={p['neutral']}")

    # restore earth-70
    earth["introduction"] = first_block(earth["introduction"])
    earth["applications"] = first_block(earth["applications"])
    earth["advantages"] = first_block(earth["advantages"])
    earth["techSpecs"] = earth["techSpecs"].split("\n")[0].strip()
    earth["wireStructure"] = "\n".join(earth["wireStructure"].split("\n")[:3]).strip()
    AFSHAN.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("restored sim-afshan-earth-70x1")


if __name__ == "__main__":
    main()
