#!/usr/bin/env python3
"""Knock the studio floor out of HD catalog photos (transparent PNG)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np


def cutout_bgr(bgr: np.ndarray) -> np.ndarray:
    """Keep the cable, wrap label, and jacket print; drop only the studio floor."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]

    core = ((gray < 165) | (sat > 38)).astype(np.uint8) * 255
    core = cv2.medianBlur(core, 5)
    core = cv2.morphologyEx(
        core,
        cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)),
    )

    keep = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (42, 42)))
    white = ((gray > 200) & (sat < 32)).astype(np.uint8) * 255
    brand_orange = (
        (hsv[:, :, 0] > 4)
        & (hsv[:, :, 0] < 28)
        & (sat > 70)
        & (gray > 70)
    )
    label_zone = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (28, 28)))
    keep = cv2.bitwise_or(keep, cv2.bitwise_and(white, label_zone))
    keep[brand_orange] = 255

    # Drop leftover floor: large bright blobs not sitting on the cable
    leftover = ((keep > 0) & (gray > 178) & (sat < 28)).astype(np.uint8) * 255
    count, labels, stats, _ = cv2.connectedComponentsWithStats(leftover)
    dark = gray < 140
    ring_k = np.ones((9, 9), np.uint8)
    h, w = gray.shape
    for i in range(1, count):
        if stats[i, cv2.CC_STAT_AREA] < 250:
            continue
        cx = stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] / 2
        cy = stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] / 2
        # Wrap labels sit on the coil (inner area). Only drop edge floor blobs.
        if 0.14 * w < cx < 0.86 * w and 0.12 * h < cy < 0.88 * h:
            continue
        comp = labels == i
        ring = cv2.dilate(comp.astype(np.uint8), ring_k) & (~comp)
        if ring.sum() == 0:
            continue
        if dark[ring > 0].mean() < 0.42:
            keep[comp] = 0

    keep = cv2.medianBlur(keep, 5)
    keep = cv2.GaussianBlur(keep, (0, 0), 0.9)
    keep = np.clip(keep.astype(np.int16) * 1.2 - 22, 0, 255).astype(np.uint8)
    b, g, r = cv2.split(bgr)
    return cv2.merge([b, g, r, keep])


def process_one(src: Path, dest: Path) -> None:
    bgr = cv2.imread(str(src), cv2.IMREAD_COLOR)
    if bgr is None:
        raise FileNotFoundError(src)
    dest.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(dest), cutout_bgr(bgr))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--jobs", required=True, help="JSON list of {src, dest}")
    args = parser.parse_args()
    jobs = json.loads(Path(args.jobs).read_text(encoding="utf-8"))
    for job in jobs:
        src = Path(job["src"])
        dest = Path(job["dest"])
        process_one(src, dest)
        print(f"  cutout {src.name} → {dest.name}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
