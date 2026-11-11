"""Die-cut the promo pop-up layers out of the site photos.
usage: python scripts/cut-promo-layers.py public/images/photos public/images/promo <preview dir>
needs: pip install opencv-python numpy"""
import sys, os
import cv2
import numpy as np

src, out, prev = sys.argv[1:4]


def imread(path):
    return cv2.imdecode(np.fromfile(path, np.uint8), cv2.IMREAD_COLOR)


def imwrite(path, img, params=()):
    ext = os.path.splitext(path)[1]
    cv2.imencode(ext, img, list(params))[1].tofile(path)
os.makedirs(out, exist_ok=True)


def load(name, box, width):
    im = imread(os.path.join(src, name))
    h, w = im.shape[:2]
    x0, y0, x1, y1 = (int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h))
    im = im[y0:y1, x0:x1]
    scale = width / im.shape[1]
    return cv2.resize(im, (width, round(im.shape[0] * scale)), interpolation=cv2.INTER_AREA)


def sky_mask(im, v_min, sat_max, blue_bias, strict=False, cut_px=0):
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    b, g, r = [c.astype(int) for c in cv2.split(im)]
    if strict:
        sky = (hsv[..., 2] >= v_min) & (b - r >= blue_bias)
    else:
        sky = (hsv[..., 2] >= v_min) & ((hsv[..., 1] <= sat_max) | (b - r >= blue_bias))
    sky = sky.astype(np.uint8)
    if cut_px:  # break thin channels so holes inside the subject are not treated as sky
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (cut_px, cut_px))
        core = cv2.erode(sky, k)
        n, lab = cv2.connectedComponents(core, connectivity=4)
        keep = np.unique(lab[0][core[0] > 0])
        core = np.isin(lab, keep[keep > 0]).astype(np.uint8)
        return cv2.dilate(core, k).astype(bool) & sky.astype(bool)
    # only sky regions connected to the top edge
    n, lab = cv2.connectedComponents(sky, connectivity=4)
    keep = np.unique(lab[0][sky[0] > 0])
    return np.isin(lab, keep[keep > 0])


def diecut(fg, close_px, border_px):
    """Smooth a foreground mask into a cut-paper contour, return (inner, outer-with-border)."""
    m = fg.astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close_px, close_px))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    # drop small islands
    n, lab, stats, _ = cv2.connectedComponentsWithStats((m > 0).astype(np.uint8), connectivity=8)
    big = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 1500]
    m = np.isin(lab, big).astype(np.uint8) * 255
    # smooth the contour (blur + threshold) so it reads as one clean knife cut
    m = cv2.GaussianBlur(m, (0, 0), 2.2)
    m = (m > 127).astype(np.uint8) * 255
    outer = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * border_px + 1,) * 2))
    return m, outer


def compose(im, inner, outer, path):
    """Photo inside the cut, white card stock around it, anti-aliased edges."""
    a_in = cv2.GaussianBlur(inner, (0, 0), .7).astype(np.float32)[..., None] / 255
    a_out = cv2.GaussianBlur(outer, (0, 0), .7).astype(np.float32) / 255
    paper = np.full_like(im, (238, 246, 248))  # warm white card (BGR)
    rgb = im * a_in + paper * (1 - a_in)
    # thin grey line where the photo meets the paper, like a printed edge
    edge = cv2.morphologyEx(inner, cv2.MORPH_GRADIENT, np.ones((2, 2), np.uint8)).astype(np.float32)[..., None] / 255
    rgb = rgb * (1 - .25 * edge)
    bgra = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (a_out * 255).astype(np.uint8)])
    imwrite(path, bgra, [cv2.IMWRITE_WEBP_QUALITY, 82])
    # preview on a dark background
    bg = np.full_like(im, 40)
    pv = bgra[..., :3] * a_out[..., None] + bg * (1 - a_out[..., None])
    imwrite(os.path.join(prev, "p_" + os.path.basename(path).replace(".webp", ".jpg")), pv.astype(np.uint8))


def fade_bottom_flat(mask, rows):
    """Force the bottom rows solid so the layer has a straight fold line."""
    mask[-rows:] = 255
    return mask


# 1) Back layer: karst mountains, palms and roofs (sky removed)
im = load("1520250497591-112f2f40a3f4.jpg", (0, .1, .74, .62), 800)
fg = ~sky_mask(im, 165, 70, 25)
inner, outer = diecut(fg, 9, 5)
inner = fade_bottom_flat(inner, 4); outer = fade_bottom_flat(outer, 4)
outer[:, :0] = 0
compose(im, inner, outer, os.path.join(out, "mountains.webp"))
print("mountains", im.shape)

# 2) Middle layer: beach bungalow with palms on its sand bar (sky and open sea removed)
im = load("1499793983690-e29da59ef1c2.jpg", (.42, .1, 1, .8), 560)
h, w = im.shape[:2]
loose = sky_mask(im, 90, 80, 8)            # anything sky-like
strict = sky_mask(im, 80, 0, 6, strict=True, cut_px=9)
gc = np.full((h, w), cv2.GC_PR_FGD, np.uint8)
gc[loose] = cv2.GC_PR_BGD
gc[strict] = cv2.GC_BGD
gc[: int(h * .12), : int(w * .1)] = cv2.GC_BGD                 # sky corner
gc[int(h * .42): int(h * .85), int(w * .2): int(w * .9)] = cv2.GC_FGD  # roofs and deck
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(im, gc, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
fg = (gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)
# cut the bottom along the sand: keep a gently curved strip below the deck
yy, xx = np.mgrid[0:h, 0:w]
fg &= yy < (h - 6 - 20 * np.sin(np.pi * xx / w))
# round off the right side so the crop line reads as a knife cut, not a photo edge
fg &= xx < (w - 8 - 26 * (1 - np.sin(np.pi * np.clip(yy / h, 0, 1))) ** 2)
inner, outer = diecut(fg, 9, 5)
compose(im, inner, outer, os.path.join(out, "bungalow.webp"))
print("bungalow", im.shape)

# 3) Front layer: surf from the beach photo, top edge cut along the wave crest
im = load("1507525428034-b723cf961d3e.jpg", (.05, .46, .8, .78), 800)
h, w = im.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
crest = h * .32 + h * .12 * np.sin(xx / w * 2 * np.pi * 2.5 + .6) + h * .05 * np.sin(xx / w * 2 * np.pi * 7)
inner, outer = diecut(yy > crest, 3, 5)
inner = fade_bottom_flat(inner, 4); outer = fade_bottom_flat(outer, 4)
compose(im, inner, outer, os.path.join(out, "waves.webp"))
print("waves", im.shape)

# 4) Lid backdrop: sunset sky over the sea (plain crop, no cut)
im = load("1507525428034-b723cf961d3e.jpg", (.12, 0, .88, .62), 800)
imwrite(os.path.join(out, "sky.webp"), im, [cv2.IMWRITE_WEBP_QUALITY, 80])
print("sky", im.shape)


def color_cut(im, fg_seed, bg_seed, iters=5):
    """GrabCut seeded by colour masks: True in fg_seed/bg_seed are hard hints."""
    gc = np.full(im.shape[:2], cv2.GC_PR_BGD, np.uint8)
    gc[cv2.dilate(fg_seed.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0] = cv2.GC_PR_FGD
    gc[fg_seed] = cv2.GC_FGD
    gc[bg_seed & ~fg_seed] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(im, gc, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    return (gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)


def hsv(im):
    h, s, v = cv2.split(cv2.cvtColor(im, cv2.COLOR_BGR2HSV))
    return h.astype(int), s.astype(int), v.astype(int)


# 5) Front-left side piece: banana leaves in front of the pool
im = load("1520250497591-112f2f40a3f4.jpg", (0, .7, .4, 1), 520)
h_, s_, v_ = hsv(im)
leaf = (h_ >= 22) & (h_ <= 50) & (s_ >= 110) & (v_ >= 70)
leaf[: int(im.shape[0] * .12)] = False                      # shrubs behind the deck
water = (h_ >= 80) & (h_ <= 105) & (s_ >= 60)
grey = s_ < 70
fg = color_cut(im, cv2.erode(leaf.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0, water | grey)
inner, outer = diecut(fg, 7, 5)
compose(im, inner, outer, os.path.join(out, "leaves.webp"))
print("leaves", im.shape)

# 6) Middle layer: palms and beach umbrellas against the open sea
im = load("1540541338287-41700207dee6.jpg", (0, .4, .56, .86), 700)
h_, s_, v_ = hsv(im)
b, g, r = [c.astype(int) for c in cv2.split(im)]
sea = (b - r >= 60) & (h_ >= 95) & (h_ <= 125) & (s_ >= 90)
n, lab = cv2.connectedComponents(sea.astype(np.uint8), connectivity=4)
top = np.unique(lab[0][sea[0]]); sea_top = np.isin(lab, top[top > 0])
fg = color_cut(im, ~cv2.dilate(sea.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool), sea_top)
inner, outer = diecut(fg, 7, 5)
inner = fade_bottom_flat(inner, 4); outer = fade_bottom_flat(outer, 4)
compose(im, inner, outer, os.path.join(out, "palms.webp"))
print("palms", im.shape)
