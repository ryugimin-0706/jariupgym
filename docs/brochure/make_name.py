# -*- coding: utf-8 -*-
"""프로젝트명 이미지 150x100 (커버와 어울리게). 3배로 그린 뒤 축소."""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
COVER = os.path.join(HERE, "cover-user.webp")
BOLD = r"C:\Windows\Fonts\malgunbd.ttf"
NAVY = (30, 58, 95)
NAVY_DARK = (19, 40, 64)
MINT = (46, 196, 182)
MINT_700 = (27, 130, 120)
WHITE = (255, 255, 255)
CREAM = (251, 250, 246)  # 커버 배경색
W, H, S = 150, 100, 3


def wordmark(d, cx, y, size):
    f = ImageFont.truetype(BOLD, size)
    w1, w2 = d.textlength("자리없", font=f), d.textlength("Gym", font=f)
    x = cx - (w1 + w2) / 2
    d.text((x, y), "자리없", font=f, fill=NAVY_DARK)
    d.text((x + w1, y), "Gym", font=f, fill=MINT_700)


def subtitle(d, cx, y, size, fill=NAVY):
    f = ImageFont.truetype(BOLD, size)
    text = "루틴은 있는데, 자리가 없다면"
    d.text((cx - d.textlength(text, font=f) / 2, y), text, font=f, fill=fill)


def save(img, name):
    img.convert("RGB").resize((W, H), Image.LANCZOS).save(os.path.join(HERE, f"{name}.png"), optimize=True)
    img.convert("RGB").save(os.path.join(HERE, f"{name}@3x.png"), optimize=True)
    print(name)


def name_a():
    """커버의 헬스장 배경(흐리게) + 흰 카드"""
    art = Image.open(COVER).convert("RGB")
    # 커버 오른쪽 아래(비어 있는 기구 쪽)를 150:100 비율로 잘라 흐리게
    aw, ah = art.size
    cw = int(aw * 0.5)
    ch = int(cw * H / W)
    crop = art.crop((aw - cw, ah - ch, aw, ah)).resize((W * S, H * S), Image.LANCZOS)
    bg = crop.filter(ImageFilter.GaussianBlur(6 * S)).convert("RGBA")
    bg.alpha_composite(Image.new("RGBA", bg.size, (255, 255, 255, 60)))
    d = ImageDraw.Draw(bg)
    # 흰 카드 + 민트 테두리 (커버의 추천 카드 느낌)
    box = (10 * S, 14 * S, 140 * S, 86 * S)
    glow = Image.new("RGBA", bg.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle(box, radius=12 * S, fill=(46, 196, 182, 120))
    bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(4 * S)))
    d = ImageDraw.Draw(bg)
    d.rounded_rectangle(box, radius=12 * S, fill=WHITE, outline=MINT, width=int(1.5 * S))
    wordmark(d, W * S / 2, 24 * S, 23 * S)
    d.rounded_rectangle(((W / 2 - 14) * S, 56 * S, (W / 2 + 14) * S, 58 * S), radius=S, fill=MINT)
    subtitle(d, W * S / 2, 63 * S, 9 * S)
    save(bg, "name-option-a")


def name_b():
    """커버 배경색 + 민트 포인트 + 체크 배지"""
    img = Image.new("RGBA", (W * S, H * S), CREAM + (255,))
    d = ImageDraw.Draw(img)
    # 아래쪽 민트 띠
    d.rectangle((0, 84 * S, W * S, H * S), fill=MINT_700)  # 흰 글씨 대비를 위해 짙은 민트
    # 체크 배지 (커버의 "사용 가능 ✓")
    cx, cy, r = 128 * S, 18 * S, 9 * S
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=MINT)
    d.line([(cx - 4 * S, cy), (cx - 1 * S, cy + 3.5 * S), (cx + 4.5 * S, cy - 3.5 * S)], fill=WHITE, width=int(2.2 * S), joint="curve")
    wordmark(d, W * S / 2, 22 * S, 25 * S)
    subtitle(d, W * S / 2, 60 * S, 9 * S, fill=NAVY_DARK)
    f = ImageFont.truetype(BOLD, 8 * S)
    tag = "3초 만에 대체 운동 추천"
    d.text((W * S / 2 - d.textlength(tag, font=f) / 2, 86 * S), tag, font=f, fill=WHITE)
    save(img, "name-option-b")


name_a()
name_b()
