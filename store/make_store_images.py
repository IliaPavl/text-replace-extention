"""Chrome Web Store assets: 24-bit PNG, no alpha."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "screenshots"
ICON_PATH = ROOT / "icons" / "icon128.png"

BG = (18, 19, 26)
CARD = (28, 29, 38)
CARD2 = (22, 23, 32)
BORDER = (46, 49, 66)
TEXT = (244, 245, 247)
MUTED = (154, 163, 178)
ACCENT = (139, 108, 255)
ACCENT_SOFT = (196, 181, 255)
GREEN = (110, 231, 183)


def font(size, bold=False):
    names = (
        ["segoeuib.ttf", "segoeui.ttf"] if bold else ["segoeui.ttf", "segoeuil.ttf"]
    )
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def flatten_icon(size, bg):
    src = Image.open(ICON_PATH).convert("RGBA")
    src = src.resize((size, size), Image.Resampling.LANCZOS)
    base = Image.new("RGBA", (size, size), bg + (255,))
    base.alpha_composite(src)
    return base.convert("RGB")


def canvas(w, h):
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    # soft blob
    blob = Image.new("RGB", (w, h), BG)
    bdraw = ImageDraw.Draw(blob)
    bdraw.ellipse((-180, -220, 620, 560), fill=(32, 28, 58))
    blob = blob.filter(ImageFilter.GaussianBlur(48))
    img = Image.blend(img, blob, 0.55)
    return img, ImageDraw.Draw(img)


def rounded(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)


def paste_icon(img, xy, size):
    icon = flatten_icon(size, CARD)
    img.paste(icon, xy)


def save_rgb(img, path):
    rgb = img.convert("RGB")
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb.save(path, "PNG", optimize=True)
    # verify no alpha
    check = Image.open(path)
    assert check.mode == "RGB", check.mode
    assert check.size == img.size
    print(path.name, check.size, check.mode, path.stat().st_size)


def shot1():
    img, d = canvas(1280, 800)
    paste_icon(img, (80, 72), 148)
    d.text((260, 92), "Replace Similar Text", font=font(52, True), fill=TEXT)
    d.text((260, 164), "Fix names in auto-translated books — no AI", font=font(26), fill=MUTED)
    rounded(d, (80, 280, 620, 530), 20, CARD, BORDER)
    d.text((112, 308), "Matching  ·  your wording", font=font(22, True), fill=ACCENT_SOFT)
    rows = [("Wei / Weia", "Wei"), ("Lian / Lyan", "Lian Hua"), ("auto-translated page", "your names")]
    y = 360
    for left, right in rows:
        d.text((112, y), left, font=font(22), fill=MUTED)
        d.text((400, y), "→  " + right, font=font(22, True), fill=TEXT)
        y += 46
    rounded(d, (660, 280, 1200, 530), 20, CARD, BORDER)
    d.text((692, 308), "Without another translator", font=font(22, True), fill=ACCENT_SOFT)
    for i, line in enumerate(["No cloud AI", "Folders per book", "Data stays on this device"]):
        d.text((692, 368 + i * 46), line, font=font(22), fill=TEXT)
    rounded(d, (80, 560, 1200, 728), 20, CARD, BORDER)
    d.text((112, 592), "Made for readers of auto-translated novels and books.", font=font(26, True), fill=TEXT)
    d.text((112, 648), "Replace names, titles, and any phrase you choose. Fuzzy match or exact string.", font=font(22), fill=MUTED)
    return img


def shot2():
    img, d = canvas(1280, 800)
    d.text((80, 56), "One folder per book", font=font(44, True), fill=TEXT)
    d.text((80, 118), "Keep name lists separate. Auto-replace can be on or off per folder.", font=font(22), fill=MUTED)
    folders = [
        ("Mo Dao Zu Shi", "24 pairs  ·  auto on"),
        ("Heaven Official’s Blessing", "18 pairs  ·  auto on"),
        ("Omniscient Reader", "9 pairs  ·  auto off"),
    ]
    y = 180
    for name, meta in folders:
        rounded(d, (80, y, 820, y + 108), 16, CARD, BORDER)
        d.text((112, y + 22), name, font=font(26, True), fill=TEXT)
        d.text((112, y + 62), meta, font=font(20), fill=MUTED)
        d.text((760, y + 38), "›", font=font(32), fill=MUTED)
        y += 124
    rounded(d, (860, 180, 1200, 520), 16, CARD, BORDER)
    d.text((892, 208), "Inside a folder", font=font(22, True), fill=ACCENT_SOFT)
    pairs = [("Wei Ying", "Wei Wuxian"), ("Lan Zhan", "Lan Wangji"), ("Yiling Laozu", "Yiling Patriarch")]
    y = 268
    for a, b in pairs:
        d.text((892, y), a, font=font(20), fill=MUTED)
        d.text((892, y + 28), "→  " + b, font=font(20, True), fill=TEXT)
        y += 76
    return img


def shot3():
    img, d = canvas(1280, 800)
    d.text((80, 56), "Matching vs exact", font=font(44, True), fill=TEXT)
    d.text((80, 118), "Catch endings and close translit — or replace only the literal string.", font=font(22), fill=MUTED)
    rounded(d, (80, 200, 620, 720), 20, CARD, BORDER)
    d.rounded_rectangle((112, 236, 330, 284), 10, fill=(42, 34, 72))
    d.text((132, 246), "Matching", font=font(20, True), fill=ACCENT_SOFT)
    d.text((360, 246), "Exact match", font=font(20), fill=MUTED)
    d.text((112, 320), "Original", font=font(18), fill=MUTED)
    rounded(d, (112, 350, 588, 420), 12, CARD2, BORDER)
    d.text((132, 368), "Wei / Weia / Вэй / Вэя", font=font(22), fill=TEXT)
    d.text((112, 450), "Your text", font=font(18), fill=MUTED)
    rounded(d, (112, 480, 588, 550), 12, CARD2, BORDER)
    d.text((132, 498), "Wei Wuxian", font=font(22), fill=TEXT)
    d.text((112, 600), "Good for names and inflected forms.", font=font(20), fill=MUTED)
    rounded(d, (660, 200, 1200, 720), 20, CARD, BORDER)
    d.text((700, 236), "On the page", font=font(22, True), fill=ACCENT_SOFT)
    lines = [
        ("Before", "Weia said to Lan Zhan…", MUTED),
        ("After", "Wei Wuxian said to Lan Zhan…", TEXT),
        ("Before", "the Yiling Laozu appeared", MUTED),
        ("After", "the Yiling Patriarch appeared", TEXT),
    ]
    y = 300
    for label, line, color in lines:
        d.text((700, y), label, font=font(18), fill=ACCENT_SOFT if label == "After" else MUTED)
        d.text((700, y + 32), line, font=font(22, True if label == "After" else False), fill=color)
        y += 96
    return img


def shot4():
    img, d = canvas(1280, 800)
    d.text((80, 56), "Auto-replace, scan, restore", font=font(44, True), fill=TEXT)
    d.text((80, 118), "Apply a folder as the page loads — or scan once. Restore original text anytime.", font=font(22), fill=MUTED)
    items = [
        ("Auto-replace", "On by default for the folder. Pairs apply while you read."),
        ("Scan", "Run this folder’s pairs on the current tab, even if auto is off."),
        ("Restore", "Put the tab back as it was. Scan or auto will apply again."),
    ]
    y = 200
    for title, body in items:
        rounded(d, (80, y, 1200, y + 150), 18, CARD, BORDER)
        d.ellipse((116, y + 52, 156, y + 92), fill=ACCENT)
        d.text((188, y + 36), title, font=font(26, True), fill=TEXT)
        d.text((188, y + 82), body, font=font(22), fill=MUTED)
        y += 170
    return img


def shot5():
    img, d = canvas(1280, 800)
    d.text((80, 56), "Import, export, your device only", font=font(44, True), fill=TEXT)
    d.text((80, 118), "Share a book’s name list as JSON. Nothing is sent to a cloud translator.", font=font(22), fill=MUTED)
    rounded(d, (80, 200, 620, 720), 20, CARD, BORDER)
    d.text((112, 236), "Folders", font=font(22, True), fill=ACCENT_SOFT)
    for i, label in enumerate(["Import and replace all", "Import without replacing", "Export everything"]):
        rounded(d, (112, 300 + i * 110, 588, 386 + i * 110), 12, CARD2, BORDER)
        d.text((140, 326 + i * 110), label, font=font(22, True), fill=TEXT)
    rounded(d, (660, 200, 1200, 720), 20, CARD, BORDER)
    d.text((700, 236), "Privacy", font=font(22, True), fill=ACCENT_SOFT)
    points = [
        "Pairs live in chrome.storage.local",
        "No analytics, no ads, no account",
        "Page text is not uploaded",
        "Matching rules per language (RU / EN)",
        "JSON comments for sharing lists",
    ]
    y = 310
    for p in points:
        d.ellipse((708, y + 10, 724, y + 26), fill=GREEN)
        d.text((744, y), p, font=font(22), fill=TEXT)
        y += 70
    return img


def small_promo():
    img, d = canvas(440, 280)
    paste_icon(img, (28, 56), 96)
    d.text((144, 68), "Replace", font=font(28, True), fill=TEXT)
    d.text((144, 104), "Similar Text", font=font(28, True), fill=TEXT)
    d.text((144, 156), "Names in translated", font=font(18), fill=MUTED)
    d.text((144, 184), "books — no AI", font=font(18), fill=MUTED)
    return img


def marquee():
    img, d = canvas(1400, 560)
    paste_icon(img, (72, 168), 176)
    d.text((280, 160), "Replace Similar Text", font=font(56, True), fill=TEXT)
    d.text((280, 236), "Fix names and terms in auto-translated books.", font=font(28), fill=MUTED)
    d.text((280, 278), "Your wording. Fuzzy or exact. No AI translator.", font=font(28), fill=MUTED)
    chips = ["Folders per book", "Matching + exact", "Local only"]
    x = 280
    for chip in chips:
        w = 18 * len(chip) // 2 + 36
        rounded(d, (x, 360, x + w, 412), 20, CARD, BORDER)
        d.text((x + 18, 372), chip, font=font(18, True), fill=ACCENT_SOFT)
        x += w + 16
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    save_rgb(shot1(), OUT / "01-hero-1280x800.png")
    save_rgb(shot2(), OUT / "02-folders-1280x800.png")
    save_rgb(shot3(), OUT / "03-matching-1280x800.png")
    save_rgb(shot4(), OUT / "04-auto-scan-1280x800.png")
    save_rgb(shot5(), OUT / "05-import-privacy-1280x800.png")
    save_rgb(small_promo(), OUT / "promo-small-440x280.png")
    save_rgb(marquee(), OUT / "promo-marquee-1400x560.png")
    old = OUT / "screenshot-1280x800.png"
    if old.exists():
        old.unlink()


if __name__ == "__main__":
    main()
