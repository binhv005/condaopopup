"""
Builds the stills used by the scroll-scrubbed video hero from public/video/homestay-scrub.mp4:
  public/images/hero-video/poster.webp    first frame, shown until the video can play
  public/images/hero-video/cutout.webp    last frame with the sky cut away: sea, beach, headland and window frame
                                          stay, laid over the "Homestay" mark so it sits behind the horizon
  public/images/hero-video/mask-check.jpg the cutout outlined on the frame, for a quick visual check

The scrub copy itself is encoded with dense keyframes (every 4 frames) so seeking backwards stays smooth:
  ffmpeg -i public/video.mp4 -an -c:v libx264 -preset slow -crf 23 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 \
         -pix_fmt yuv420p -movflags +faststart public/video/homestay-scrub.mp4

Phones get a lighter portrait cut from public/video2.mp4 (540px wide, a keyframe every 2 frames) and their own stills
(poster-mobile.webp, cutout-mobile.webp, mask-check-mobile.jpg):
  ffmpeg -i public/video2.mp4 -an -vf scale=540:-2 -c:v libx264 -preset slow -crf 28 -g 2 -keyint_min 2 -sc_threshold 0 \
         -bf 0 -pix_fmt yuv420p -movflags +faststart public/video/homestay-scrub-mobile.mp4

Run from the project root:  python scripts/hero-video-assets.py [--mobile]      (numpy, opencv-python, Pillow)
"""
import pathlib
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
MOBILE = "--mobile" in sys.argv
SUFFIX = "-mobile" if MOBILE else ""
VIDEO = ROOT / "public" / "video" / f"homestay-scrub{SUFFIX}.mp4"
OUT = ROOT / "public" / "images" / "hero-video"


def frame(cap: cv2.VideoCapture, index: int) -> np.ndarray:
    cap.set(cv2.CAP_PROP_POS_FRAMES, index)
    ok, img = cap.read()
    if not ok:
        raise RuntimeError(f"could not read frame {index}")
    return img


def largest_touching(mask: np.ndarray, touches) -> np.ndarray:
    """Connected components of `mask` that touch the given image edges"""
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    h, w = mask.shape
    keep = np.zeros_like(mask, bool)
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        edges = {"left": x == 0, "right": x + bw >= w, "top": y == 0, "bottom": y + bh >= h}
        if area > h * w * 0.002 and all(edges[e] for e in touches):
            keep |= labels == i
    return keep


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(str(VIDEO))
    count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    first, last = frame(cap, 0), frame(cap, count - 1)
    Image.fromarray(cv2.cvtColor(first, cv2.COLOR_BGR2RGB)).save(OUT / f"poster{SUFFIX}.webp", quality=80, method=6)

    h, w = last.shape[:2]
    hsv = cv2.cvtColor(last, cv2.COLOR_BGR2HSV).astype(np.float32)
    b, g, r = [last[..., i].astype(np.float32) for i in range(3)]
    hue, sat, val = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    yy, xx = np.mgrid[0:h, 0:w]

    # Headland: green vegetation and dark rock on the right, below the horizon
    green = (hue > 45) & (hue < 160) & (sat > 0.18) & (g > b * 0.95)
    rock = (val < 0.42) & (sat < 0.45)
    land = (green | rock) & (xx > w * 0.55) & (yy > h * 0.33)
    land = cv2.morphologyEx(land.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8)).astype(bool)
    land = largest_touching(land, ["right"])

    # Window frame: the warm vertical bar on the left, running from top to bottom (beige wood; dark brown in the mobile cut)
    hue_min, sat_max, val_min = (5, 0.9, 0.12) if MOBILE else (15, 0.55, 0.45)
    beige = (hue > hue_min) & (hue < 55) & (sat > 0.12) & (sat < sat_max) & (val > val_min) & (xx < w * 0.3)
    beige = cv2.morphologyEx(beige.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((31, 9), np.uint8)).astype(bool)
    frame_bar = largest_touching(beige, ["top", "bottom"])

    # Horizon: the row where the bright sky turns into the darker sea, measured over open water
    band = cv2.cvtColor(last, cv2.COLOR_BGR2GRAY)[:, int(w * 0.25):int(w * 0.6)].astype(np.float32).mean(1)
    grad = np.convolve(np.diff(band), np.ones(3) / 3, "same")
    lo, hi = int(h * 0.3), int(h * 0.6)
    horizon = lo + int(np.argmin(grad[lo:hi])) + 1
    sea = np.clip((yy - horizon + 1.0) / 2.0, 0, 1)                  # soft 2px edge along the horizon

    mask = np.maximum(sea, (land | frame_bar).astype(np.float32)) * 255
    mask = cv2.GaussianBlur(mask.astype(np.uint8), (0, 0), 1.0)      # soft 1–2px edge, no halo
    rgba = np.dstack([cv2.cvtColor(last, cv2.COLOR_BGR2RGB), mask])
    Image.fromarray(rgba, "RGBA").save(OUT / f"cutout{SUFFIX}.webp", quality=85, method=6)

    check = last.copy()
    contours, _ = cv2.findContours((mask > 127).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(check, contours, -1, (0, 0, 255), 4)
    cv2.imwrite(str(OUT / f"mask-check{SUFFIX}.jpg"), cv2.resize(check, (w // 2, h // 2)))
    key = "HERO.mobile.horizon" if MOBILE else "HERO.horizon"
    print("frames", count, "horizon row", horizon, "fraction", round(horizon / h, 4), f"→ {key} in src/data/home.ts")
    for f in OUT.iterdir():
        print(f.name, f.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
