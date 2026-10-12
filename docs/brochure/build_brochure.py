# -*- coding: utf-8 -*-
"""
노션 첨부용 HTML 브로셔 만들기: brochure.template.html에 이미지를 넣어 한 파일(브로셔-전체.html)로 만든다.
노션 파일 미리보기에서도 그대로 보이도록 이미지는 data URI로, 스크립트는 쓰지 않는다.

사용법: python docs/brochure/build_brochure.py
"""
import base64
import io
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))

RETRO = {
    "RETRO_GOOD": "코드를 쓰기 전에 기획서의 모호한 점을 질문으로 뽑고, 정한 내용을 결정 문서에 계속 남겼더니 "
    "하루 만에 핵심 흐름(자리 없음 → 대체)을 배포하고 피드백을 바로바로 반영할 수 있었어요.",
    "RETRO_BAD": "피드백이 올 때마다 기능을 붙이다 보니(운동 87개, 세트 기록, 운동 추가 등) "
    "핵심 기능이 실제 헬스장에서 쓰이는지 확인하기 전에 범위가 먼저 커졌어요.",
    "RETRO_NEXT": "다음에는 실제 헬스장에서 쓰는 모습을 먼저 관찰하고, '대체 운동을 고른 비율' 같은 지표로 "
    "핵심 기능을 검증한 뒤에 기능을 늘리겠어요.",
}


def data_uri(path, max_width=None, as_jpeg=False, quality=85):
    img = Image.open(path)
    if max_width and img.width > max_width:
        img = img.resize((max_width, round(img.height * max_width / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    if as_jpeg:
        img.convert("RGB").save(buf, "JPEG", quality=quality, optimize=True)
        mime = "image/jpeg"
    else:
        img.save(buf, "PNG", optimize=True)
        mime = "image/png"
    return f"data:{mime};base64,{base64.b64encode(buf.getvalue()).decode()}"


def main():
    html = open(os.path.join(HERE, "brochure.template.html"), encoding="utf-8").read()
    images = {
        "COVER": data_uri(os.path.join(HERE, "cover-final@3x.png"), max_width=1140, as_jpeg=True),
        "SHOT1": data_uri(os.path.join(HERE, "screen-1-substitute.jpg"), as_jpeg=True),
        "SHOT2": data_uri(os.path.join(HERE, "screen-2-recommended.jpg"), max_width=600, as_jpeg=True),
        "SHOT3": data_uri(os.path.join(HERE, "screen-4-defer.jpg"), max_width=600, as_jpeg=True),
        "QR": data_uri(os.path.join(HERE, "qr-card.png")),
    }
    for key, value in {**images, **RETRO}.items():
        html = html.replace("{{" + key + "}}", value)
    assert "{{" not in html, "채우지 않은 자리가 있어요"
    out = os.path.join(HERE, "브로셔-전체.html")
    open(out, "w", encoding="utf-8").write(html)
    print(f"브로셔-전체.html {os.path.getsize(out) // 1024}KB")


if __name__ == "__main__":
    main()
