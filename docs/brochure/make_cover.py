# -*- coding: utf-8 -*-
"""
브로셔 커버 만들기: 글자 없는 일러스트 위에 제목·로고를 올려 380x270으로 만든다.

사용법:
    python docs/brochure/make_cover.py <일러스트 파일> [가로 위치 0~1] [세로 위치 0~1]
    예) python docs/brochure/make_cover.py art.png 0.5 0.4

- 380:270 비율로 자른다. 위치 값은 잘라낼 구역을 어디에 둘지 (0=왼쪽/위, 0.5=가운데, 1=오른쪽/아래)
- 위쪽에 흰색 그라데이션을 깔아 제목이 그림 위에서도 읽히게 한다.
- 결과: cover-final.png (380x270), cover-final@3x.png (1140x810)
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
BOLD = r"C:\Windows\Fonts\malgunbd.ttf"

NAVY = (30, 58, 95)
MINT = (46, 196, 182)
MINT_700 = (27, 130, 120)
WHITE = (255, 255, 255)

W, H, S = 380, 270, 3  # 최종 크기, 그리는 배율
TITLE_1 = "하고 싶은 기구에"
TITLE_2 = "자리가 없다면?"


def crop_to_ratio(img, fx, fy):
    """380:270 비율로 자르기. fx, fy는 잘라낼 위치(0~1)."""
    target = W / H
    w, h = img.size
    if w / h > target:  # 옆으로 길면 좌우를 자름
        nw = round(h * target)
        x = round((w - nw) * fx)
        return img.crop((x, 0, x + nw, h))
    nh = round(w / target)
    y = round((h - nh) * fy)
    return img.crop((0, y, w, y + nh))


def top_fade(size, height, max_alpha=235):
    """위쪽이 진하고 아래로 갈수록 투명해지는 흰색 막"""
    w, h = size
    fade = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    px = fade.load()
    for y in range(height):
        a = round(max_alpha * (1 - y / height) ** 1.6)
        for x in range(w):
            px[x, y] = (255, 255, 255, a)
    return fade


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = sys.argv[1]
    fx = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
    fy = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5

    art = Image.open(src).convert("RGB")
    art = crop_to_ratio(art, fx, fy).resize((W * S, H * S), Image.LANCZOS)
    canvas = art.convert("RGBA")
    canvas.alpha_composite(top_fade(canvas.size, int(H * S * 0.5)))
    d = ImageDraw.Draw(canvas)

    # 로고 (오른쪽 위)
    f_logo = ImageFont.truetype(BOLD, 14 * S)
    lw = d.textlength("자리없", font=f_logo) + d.textlength("Gym", font=f_logo)
    lx, ly = W * S - lw - 14 * S, 12 * S
    d.text((lx, ly), "자리없", font=f_logo, fill=NAVY)
    d.text((lx + d.textlength("자리없", font=f_logo), ly), "Gym", font=f_logo, fill=MINT)

    # 제목 (왼쪽 위, 흰색 외곽선으로 그림 위에서도 또렷하게)
    f_title = ImageFont.truetype(BOLD, 30 * S)
    tx = 18 * S
    d.text((tx, 34 * S), TITLE_1, font=f_title, fill=NAVY, stroke_width=2 * S, stroke_fill=WHITE)
    d.text((tx, 72 * S), TITLE_2, font=f_title, fill=MINT_700, stroke_width=2 * S, stroke_fill=WHITE)

    out = canvas.convert("RGB")
    out.save(os.path.join(HERE, "cover-final@3x.png"), optimize=True)
    out.resize((W, H), Image.LANCZOS).save(os.path.join(HERE, "cover-final.png"), optimize=True)
    print("cover-final.png (380x270), cover-final@3x.png (1140x810)")


if __name__ == "__main__":
    main()
