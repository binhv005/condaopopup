"""
Builds the torn-paper hero collage from the photos and paper scans in public/layout/hero.

Every piece is cut with a torn edge, shows the white paper core along the tear (with loose fibres)
and gets a contact shadow baked into its alpha. The paper pieces use real handmade-paper textures
(public/layout/hero/textures, generated in Figma). The mountain strip is cut along the ridge found
in the mountain photo, and the light strip above it follows that ridge in the photo's sky colour.

Output:
  public/images/hero/*.webp      one cropped RGBA image per layer, the header band and the paper tile
  src/data/heroCollage.ts        layer positions in % of the artboard (generated, do not edit)

Run from the project root:  python scripts/hero-collage.py      (numpy, opencv-python, Pillow)
"""
import math
import pathlib

import cv2
import numpy as np
from numpy.lib.stride_tricks import sliding_window_view
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "layout" / "hero"
TEX = SRC / "textures"
OUT = ROOT / "public" / "images" / "hero"
TS = ROOT / "src" / "data" / "heroCollage.ts"

W, H = 2400, 1700          # artboard; the hero keeps this aspect ratio
M = 140                    # canvas margin so tears and shadows can run past the artboard edge
SHAPE = (H + 2 * M, W + 2 * M)

MOUNTAIN = SRC / "image copy.png"
COAST = SRC / "pexels-tranthangnhat-17581847.jpg"
FIGURE = SRC / "image-removebg-preview.png"

# Brand tokens (style.css :root)
TROPICAL, IVORY = "#0f3a2e", "#faf7f1"
CORE = "#f6f2e8"           # paper core revealed by a tear


def rgb(h: str) -> np.ndarray:
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)


def hexof(c) -> str:
    return "#" + "".join(f"{int(np.clip(v, 0, 255)):02x}" for v in c)


def open_img(path: pathlib.Path) -> Image.Image:
    """Open with the EXIF orientation applied (the coast JPEG is stored mirrored)"""
    return ImageOps.exif_transpose(Image.open(path))


def load_rgb(path: pathlib.Path) -> np.ndarray:
    return np.asarray(open_img(path).convert("RGB"), np.float32)


def noise1d(n: int, octaves: int, seed: int, base: int = 3) -> np.ndarray:
    """Fractal value noise in [-1, 1]; `base` = control points of the coarsest octave"""
    r = np.random.default_rng(seed)
    out, amp, total = np.zeros(n), 1.0, 0.0
    for o in range(octaves):
        k = min(n, int(base * 2 ** o) + 1)
        out += amp * np.interp(np.linspace(0, k - 1, n), np.arange(k), r.uniform(-1, 1, k))
        total += amp
        amp *= 0.55
    return out / total


# ---------- edges ----------

def curve(points, step: float = 2.5) -> np.ndarray:
    """Smooth dense polyline through control points"""
    p = np.asarray(points, float)
    s = np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]
    t = np.linspace(0, s[-1], max(4, int(s[-1] / step)))
    xy = np.c_[np.interp(t, s, p[:, 0]), np.interp(t, s, p[:, 1])]
    k = max(3, int(90 / step)) | 1
    pad = np.pad(xy, ((k, k), (0, 0)), mode="edge")
    ker = cv2.getGaussianKernel(k, k / 4).ravel()
    return np.c_[np.convolve(pad[:, 0], ker, "same"), np.convolve(pad[:, 1], ker, "same")][k:-k]


def torn(pts: np.ndarray, seed: int, rough: float, rim: float, up: bool):
    """Rip a dense edge (slow sweeps + ragged bites + jitter); returns the edge and its white-core outline"""
    n = len(pts)
    d = np.gradient(pts, axis=0)
    d /= np.maximum(np.hypot(d[:, 0], d[:, 1]), 1e-6)[:, None]
    normal = np.c_[-d[:, 1], d[:, 0]]
    normal *= np.where((normal[:, 1] < 0) == up, 1, -1)[:, None]        # point away from the body
    off = (noise1d(n, 3, seed, base=2) * rough * 1.4
           + noise1d(n, 5, seed + 2, base=max(8, int(n * 2.5 / 60))) * rough * 0.6
           + np.random.default_rng(seed + 1).normal(0, 0.6, n))
    edge = pts + normal * off[:, None]
    width = rim * np.clip((noise1d(n, 5, seed + 7, base=max(6, int(n / 80))) + 0.8) / 1.5, 0.08, 1) ** 1.2
    width += np.abs(np.random.default_rng(seed + 3).normal(0, 0.9, n))
    return edge, edge + normal * width[:, None]


def ribbon(top, bottom, seed: int, rough=14.0, rim=16.0, top_rough=None):
    """Closed strip between a top and a bottom curve (both given left→right), both edges torn"""
    t_edge, t_core = torn(curve(top), seed, rough if top_rough is None else top_rough, rim, up=True)
    b_edge, b_core = torn(curve(bottom), seed + 50, rough, rim, up=False)
    return np.vstack([t_edge, b_edge[::-1]]), np.vstack([t_core, b_core[::-1]])


def fill(poly: np.ndarray) -> np.ndarray:
    """Anti-aliased polygon mask on the canvas"""
    mask = np.zeros(SHAPE, np.uint8)
    cv2.fillPoly(mask, [np.round((poly + M) * 16).astype(np.int32)], 255, cv2.LINE_AA, shift=4)
    return mask.astype(np.float32) / 255


def taper(x, x0, x1, mid, peak, end):
    """Strip thickness along x: grows from a point at x0 to `peak` at `mid`, eases to `end` at x1"""
    t = np.clip((x - x0) / (x1 - x0), 0, 1)
    rise = peak * np.sin(np.minimum(t / mid, 1) * math.pi / 2)
    fall = end + (peak - end) * np.cos(np.clip((t - mid) / (1 - mid), 0, 1) * math.pi / 2)
    return np.where(t < mid, rise, fall)


# ---------- surfaces ----------

def texture(name: str, colour=None, scale=1.0, strength=1.0, seed=0) -> np.ndarray:
    """Paper scan mirror-tiled over the canvas, optionally re-dyed to `colour` keeping its fibres"""
    tex = load_rgb(TEX / name)
    if scale != 1:
        tex = cv2.resize(tex, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    block = np.vstack([np.hstack([tex, tex[:, ::-1]]), np.hstack([tex[::-1], tex[::-1, ::-1]])])
    reps = (math.ceil(SHAPE[0] / block.shape[0]) + 1, math.ceil(SHAPE[1] / block.shape[1]) + 1, 1)
    oy, ox = np.random.default_rng(seed).integers(0, tex.shape[0], 2)
    big = np.tile(block, reps)[oy:oy + SHAPE[0], ox:ox + SHAPE[1]]
    if colour is None:
        return big
    lum = big.mean(-1, keepdims=True)
    return np.clip(rgb(colour) * (1 + (lum / lum.mean() - 1) * strength), 0, 255)


def place(path: pathlib.Path, scale: float, x: float, y: float, alpha=False) -> np.ndarray:
    """Image scaled and moved onto the canvas (x, y = artboard position of its top-left corner)"""
    arr = np.asarray(open_img(path).convert("RGBA" if alpha else "RGB"), np.float32)
    mat = np.float32([[scale, 0, x + M], [0, scale, y + M]])
    return cv2.warpAffine(arr, mat, (SHAPE[1], SHAPE[0]), flags=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)


def printed(img: np.ndarray, seed: int, sat=0.9) -> np.ndarray:
    """Photo printed on paper: slightly less saturated, warmer, softer blacks, paper grain showing through"""
    grey = img.mean(-1, keepdims=True)
    img = (grey + (img - grey) * sat) * np.array([1.02, 1.0, 0.96], np.float32) * 0.95 + 8
    paper = texture("paper-ivory.png", seed=seed).mean(-1, keepdims=True)
    return np.clip(img * (1 + (paper / paper.mean() - 1) * 0.35), 0, 255)


# ---------- compositing ----------

def composite(content, body, core, seed, shadow=(10, 18, 26, 0.32)):
    """Layer = content inside body, white core in the rim, contact + soft shadow underneath"""
    h, w = body.shape
    rim = np.clip(cv2.GaussianBlur(core, (0, 0), 0.6) - body, 0, 1)
    rim *= np.clip(0.8 + np.random.default_rng(seed).normal(0, 0.25, (h, w)).astype(np.float32), 0, 1)
    core_img = texture("paper-ivory.png", CORE, strength=0.6, seed=seed + 5)
    edge = np.clip(body - cv2.erode(body, np.ones((3, 3), np.uint8)), 0, 1)[..., None]
    content = content * (1 - edge * 0.25) + 245 * edge * 0.25
    a = np.clip(body + rim * (1 - body), 0, 1)
    colour = (content * body[..., None] + core_img * (rim * (1 - body))[..., None]) / np.maximum(a, 1e-4)[..., None]
    dx, dy, blur, opacity = shadow
    near = cv2.GaussianBlur(cv2.warpAffine(a, np.float32([[1, 0, dx * .15], [0, 1, dy * .15]]), (w, h)), (0, 0), 2.5) * 0.35
    far = cv2.GaussianBlur(cv2.warpAffine(a, np.float32([[1, 0, dx], [0, 1, dy]]), (w, h)), (0, 0), blur) * opacity
    sh = np.clip(np.maximum(near, far), 0, 1)
    out_a = a + sh * (1 - a)
    out = (colour * a[..., None] + rgb("#1e1a10") * (sh * (1 - a))[..., None]) / np.maximum(out_a, 1e-4)[..., None]
    return out, out_a


def save(name, colour, alpha, layers, speed):
    """Crop to visible pixels inside the artboard and write a WebP; record its position"""
    ys, xs = np.where(alpha > 0.008)
    x0, y0 = max(xs.min(), M), max(ys.min(), M)
    x1, y1 = min(xs.max() + 1, M + W), min(ys.max() + 1, M + H)
    rgba = np.dstack([colour, alpha * 255])[y0:y1, x0:x1]
    Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA").save(OUT / f"{name}.webp", quality=82, method=6)
    layers.append({"id": name, "speed": speed, "left": (x0 - M) / W * 100, "top": (y0 - M) / H * 100, "width": (x1 - x0) / W * 100})


def piece(name, content, polys, seed, layers, speed, shadow=(10, 18, 26, 0.32)):
    save(name, *composite(content, fill(polys[0]), fill(polys[1]), seed, shadow), layers, speed)


# ---------- photo analysis ----------

def ridge(path: pathlib.Path):
    """Skyline of the front ridge (y per source column) and the average sky colour just above it"""
    img = load_rgb(path)
    h, w = img.shape[:2]
    sw, sh = 960, int(h * 960 / w)
    s = cv2.resize(img, (sw, sh), interpolation=cv2.INTER_AREA)
    lum = s.mean(-1)
    mountain = ((s[..., 1] > s[..., 2] + 4) & (lum < 175)) | (lum < 95)
    k = 12
    cs = np.cumsum(mountain, 0)
    y = np.argmax((cs[k:] - cs[:-k]) >= k * 0.9, 0).astype(float)
    y = np.median(sliding_window_view(np.pad(y, 15, mode="edge"), 31), 1)
    y = cv2.GaussianBlur(y[None], (0, 0), 3)[0]
    sky = np.concatenate([s[max(0, int(v) - 40):max(1, int(v) - 10), x] for x, v in enumerate(y) if v > 50])
    return np.interp(np.arange(w), np.linspace(0, w - 1, sw), y * h / sh), sky.mean(0)


def rock_colour(path: pathlib.Path) -> np.ndarray:
    arr = np.asarray(open_img(path).convert("RGBA"), np.float32)
    low = arr[int(arr.shape[0] * 0.65):]
    return low[..., :3][low[..., 3] > 200].mean(0)


# ---------- build ----------

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    layers: list = []

    # Mountain photo mapped so its ridge runs from the lower left to the upper right of the artboard
    m_scale, m_x, m_y = 0.55, 348, 125
    line, sky_rgb = ridge(MOUNTAIN)
    ridge_y = lambda x: np.interp((x - m_x) / m_scale, np.arange(len(line)), line) * m_scale + m_y + 6
    thick = lambda x: taper(x, 520, W + 60, 0.45, 300, 150)          # mountain strip thickness
    grey = sky_rgb.mean()
    sky = hexof((grey + (sky_rgb - grey) * 1.6) * 0.62 + rgb(IVORY) * 0.38)   # pale sky tone for the strip above the ridge
    rock = hexof(rock_colour(FIGURE) * 0.6 + rgb(IVORY) * 0.4)       # tone of the rock the figure stands on

    # 1. Sun
    n = 360
    ang = np.linspace(0, 2 * math.pi, n, endpoint=False)
    r_body = 290 + noise1d(n, 6, 3) * 5
    r_core = r_body + np.clip(noise1d(n, 5, 6) + 0.4, 0, 1) * 7 + 0.6
    circle = lambda r: np.c_[1760 + np.cos(ang) * r, 520 + np.sin(ang) * r]
    piece("sun", texture("paper-terracotta.png", scale=0.8, seed=3), (circle(r_body), circle(r_core)), 3, layers, 10, (6, 12, 22, 0.22))

    # 2. Coast: large enough that the bay and the hills around it show below the mountain strip
    coast = printed(place(COAST, 2160 / load_rgb(COAST).shape[1], 300, 760), 5, sat=0.88)
    xs = np.arange(900, W + 61, 20.0)
    # The left end climbs out of the ground and tucks under the mountain strip where it is thick enough
    top = np.r_[[[560, H + 40], [780, 1610]], np.c_[xs, ridge_y(xs) + thick(xs) - 60]]
    bottom = np.c_[np.arange(300, W + 61, 20.0), np.full(len(np.arange(300, W + 61, 20.0)), H + 60)]
    piece("coast", coast, ribbon(top, bottom, 5, rough=16, rim=18), 5, layers, 0)

    # 3. Sky-coloured strip following the ridge just above the mountain
    xs = np.arange(760, W + 61, 20.0)
    top = np.c_[xs, ridge_y(xs) - taper(xs, 760, W + 60, 0.35, 190, 170)]
    piece("strip-sky", texture("paper-ivory.png", sky, strength=1.1, seed=7),
          ribbon(top, np.c_[xs, ridge_y(xs) + 60], 7, rough=14, rim=18), 7, layers, 3)

    # 4. Mountain strip cut along the real ridge: long, curved, tapering to the left
    xs = np.arange(520, W + 61, 20.0)
    piece("strip-mountain", printed(place(MOUNTAIN, m_scale, m_x, m_y), 11, sat=0.95),
          ribbon(np.c_[xs, ridge_y(xs)], np.c_[xs, ridge_y(xs) + thick(xs)], 11, rough=16, rim=18, top_rough=3), 11, layers, 5)

    # 5. Terracotta shard tucked under the mountain strip
    xs = np.arange(900, 1521, 20.0)
    b0, b1 = (ridge_y(np.array([900.0, 1520.0])) + thick(np.array([900.0, 1520.0])))
    base = b0 + (b1 - b0) * (xs - 900) / 620 - 30                     # straight shard, not bent along the strip
    piece("strip-sunset", texture("paper-terracotta.png", scale=0.7, seed=19),
          ribbon(np.c_[xs, base], np.c_[xs, base + taper(xs, 900, 1520, 0.45, 95, 0)], 19, rough=10, rim=12), 19, layers, 8)

    # 6. Figure on the rock (background already removed), cut out with a ragged white border
    fig = place(FIGURE, 0.55, -40, 949, alpha=True)
    body = np.clip((fig[..., 3] / 255 - 0.35) * 2.2, 0, 1)
    grown = cv2.GaussianBlur(cv2.dilate(body, np.ones((13, 13), np.uint8)), (0, 0), 3)
    wobble = cv2.resize(np.random.default_rng(23).uniform(0, 1, (SHAPE[0] // 24, SHAPE[1] // 24)).astype(np.float32), (SHAPE[1], SHAPE[0]))
    core = np.maximum(np.clip((grown - 0.35 - wobble * 0.35) * 4, 0, 1), body)
    save("cliff", *composite(fig[..., :3] * 0.97 + 4, body, core, 23, (8, 14, 20, 0.28)), layers, -1)

    # 7. Ground: sage paper, a rock-coloured strip over the foot of the rock, then the ivory edge
    floor = lambda xs: np.c_[xs, np.full_like(xs, H + 60)]
    xs = np.arange(-60, 1900, 20.0)
    piece("ground-rock", texture("paper-ivory.png", rock, strength=1.2, seed=31),
          ribbon(np.c_[xs, 1560 + 18 * np.sin((xs + 60) / 520) + (xs + 60) * 0.065], floor(xs), 31, rough=14, rim=16), 31, layers, -1)
    xs = np.arange(-60, 1100, 20.0)
    piece("ground-sage", texture("paper-sage.png", scale=0.8, seed=29),
          ribbon(np.c_[xs, 1615 + (xs + 60) * 0.03 + np.maximum(0, xs - 450) * 0.16], floor(xs), 29, rough=16, rim=16), 29, layers, -2)
    xs = np.arange(-60, W + 61, 20.0)
    piece("ground-ivory", texture("paper-ivory.png", IVORY, strength=0.15, seed=37),
          ribbon(np.c_[xs, 1672 + (xs + 60) * 0.006], floor(xs), 37, rough=8, rim=10), 37, layers, 0)

    band()
    paper_tile()
    write_ts(layers)
    for l in layers:
        print(l["id"], f'{(OUT / (l["id"] + ".webp")).stat().st_size // 1024} KB')
    print("sky", sky, "rock", rock)


def band():
    """Dark torn strip behind the transparent header (stretched to the page width with object-fit)"""
    global SHAPE
    saved, bh = SHAPE, 260
    SHAPE = (bh + 2 * M, W + 2 * M)
    xs = np.arange(-60, W + 61, 20.0)
    poly = ribbon(np.c_[xs, np.full_like(xs, -60.0)], np.c_[xs, 200 - (xs + 60) * 0.008], 41, rough=7, rim=11)
    colour, a = composite(texture("paper-ivory.png", TROPICAL, strength=1.4, seed=41), fill(poly[0]), fill(poly[1]), 41, (0, 12, 14, 0.3))
    rgba = np.dstack([colour, a * 255])[M:M + bh, M:M + W]
    Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA").save(OUT / "band.webp", quality=82, method=6)
    SHAPE = saved


def paper_tile():
    """Background paper: the scan re-dyed to the hero tone and made seamless by cross-fading it with
    a half-offset copy of itself (the edges of the tile come from the middle of the scan)"""
    tex = load_rgb(TEX / "paper-ivory.png")
    n = tex.shape[0]
    lum = tex.mean(-1, keepdims=True)
    tex = np.clip(rgb("#f1eadd") * (1 + (lum / lum.mean() - 1) * 0.85), 0, 255)
    rolled = np.roll(tex, (n // 2, n // 2), (0, 1))
    u = np.abs(np.linspace(-1, 1, n))
    weight = np.clip(1 - np.maximum.outer(u, u), 0, 1)[..., None] ** 0.8
    tile = tex * weight + rolled * (1 - weight)
    Image.fromarray(tile.astype(np.uint8)).save(OUT / "paper.webp", quality=84, method=6)


def write_ts(layers):
    rows = ",\n".join(
        f'  {{ id: "{l["id"]}", left: {l["left"]:.2f}, top: {l["top"]:.2f}, width: {l["width"]:.2f}, speed: {l["speed"]} }}' for l in layers
    )
    TS.write_text(
        "// Generated by scripts/hero-collage.py – re-run the script instead of editing by hand.\n"
        "// Layers back to front; left/top/width are % of the artboard, images live in public/images/hero/<id>.webp\n"
        f"export const HERO_ARTBOARD = {{ width: {W}, height: {H} }};\n\n"
        f"export const HERO_LAYERS = [\n{rows},\n] as const;\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
