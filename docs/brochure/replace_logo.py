# -*- coding: utf-8 -*-
"""
커버 일러스트(cover-user.webp)의 AI 로고("자리없GYM")를 앱 로고("자리없Gym", 네이비+민트)로 바꾸고
380x270 커버와 3배 고해상도본을 만든다.

사용법: python docs/brochure/replace_logo.py <출력 파일 이름(확장자 제외)>
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "cover-user.webp")
BOLD = r"C:\Windows\Fonts\malgunbd.ttf"
NAVY = (30, 58, 95)
MINT = (46, 196, 182)

# 원본(1487x1058) 기준 AI 로고 영역 (덤벨 장식·반짝이 포함) + 여유
LOGO_BOX = (1212, 18, 1472, 98)
LOGO_RIGHT, LOGO_TOP, LOGO_SIZE = 1457, 30, 46


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "cover-final"
    im = Image.open(SRC).convert("RGB")

    # 1) 로고 영역을 주변 배경색으로 덮기 (가장자리를 부드럽게 섞어 티 나지 않게)
    x0, y0, x1, y1 = LOGO_BOX
    ring = [im.getpixel((x, y)) for x in range(x0, x1, 4) for y in (y0 - 6, y1 + 6)]
    bg = tuple(round(sum(c[i] for c in ring) / len(ring)) for i in range(3))
    patch = Image.new("RGB", im.size, bg)
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(LOGO_BOX, radius=18, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(6))
    im = Image.composite(patch, im, mask)

    # 2) 앱 로고 올리기 (오른쪽 정렬)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(BOLD, LOGO_SIZE)
    w1, w2 = d.textlength("자리없", font=f), d.textlength("Gym", font=f)
    x = LOGO_RIGHT - (w1 + w2)
    d.text((x, LOGO_TOP), "자리없", font=f, fill=NAVY)
    d.text((x + w1, LOGO_TOP), "Gym", font=f, fill=MINT)

    # 3) 380:270으로 다듬고 저장
    w, h = im.size
    nh = round(w * 270 / 380)
    top = max(0, (h - nh) // 2)
    im = im.crop((0, top, w, top + min(nh, h)))
    im.resize((1140, 810), Image.LANCZOS).save(os.path.join(HERE, f"{name}@3x.png"), optimize=True)
    im.resize((380, 270), Image.LANCZOS).save(os.path.join(HERE, f"{name}.png"), optimize=True)
    print(f"{name}.png (380x270), {name}@3x.png (1140x810), 배경색 {bg}")


if __name__ == "__main__":
    main()
