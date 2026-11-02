#!/usr/bin/env python3
"""Builds files.json: the list of all published items, read by index.html.

Run automatically by GitHub Actions on every push.
An item is either a file directly inside a section folder
(e.g. 3m/t1/wadjib/wadjib-01.html) or a sub-folder that contains
an index.html (e.g. 3m/t1/series/series-01/index.html).
"""
import html
import json
import os
import re
import subprocess

LEVELS = ["1m", "2m", "3m", "4m"]
TERMS = ["t1", "t2", "t3"]
SECTIONS = ["series", "fard", "wadjib", "ikhtibar", "chahada"]
EXTS = {".html": "html", ".htm": "html", ".pdf": "pdf",
        ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image"}

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)

LEVEL_AR = {"1m": "السنة الأولى متوسط", "2m": "السنة الثانية متوسط",
            "3m": "السنة الثالثة متوسط", "4m": "السنة الرابعة متوسط"}
SECTION_AR = {"series": "سلسلة تمارين", "fard": "فرض", "wadjib": "واجب منزلي", "ikhtibar": "اختبار", "chahada": "سلسلة الشهادة"}


def site_base():
    owner, _, repo = os.environ.get("GITHUB_REPOSITORY", "soufiyousfi/math").partition("/")
    return f"https://{owner}.github.io/{repo}/"


def inject_og(path, item):
    """Add Facebook preview tags to the DEPLOYED copy of a page (CI only).
    The files in the repository are never changed."""
    with open(path, encoding="utf-8", errors="ignore") as f:
        page = f.read()
    if 'property="og:image"' in page:
        return
    base = site_base()
    esc = lambda t: html.escape(t, quote=True)
    tags = (f'\n<meta property="og:type" content="website">'
            f'\n<meta property="og:title" content="{esc(item["title"])}">'
            f'\n<meta property="og:description" content="{esc(LEVEL_AR[item["level"]] + " · " + SECTION_AR[item["section"]] + " — رياضيات المتوسط")}">'
            f'\n<meta property="og:image" content="{base}cover.png">'
            f'\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">'
            f'\n<meta property="og:url" content="{base}{item["url"]}">\n')
    m = re.search(r"<head[^>]*>", page, re.I)
    page = page[:m.end()] + tags + page[m.end():] if m else tags + page
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)


def html_title(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            m = TITLE_RE.search(f.read(200_000))
        if m:
            t = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()
            if t:
                return t
    except OSError:
        pass
    return None


def name_title(name):
    stem = os.path.splitext(name)[0]
    return re.sub(r"[-_]+", " ", stem).strip()


def last_commit_date(path):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cI", "--", path],
                             capture_output=True, text=True, check=True).stdout.strip()
        return out or None
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def main():
    items = []
    for lv in LEVELS:
        for tm in TERMS:
            for sec in SECTIONS:
                base = os.path.join(lv, tm, sec)
                if not os.path.isdir(base):
                    continue
                for name in sorted(os.listdir(base)):
                    if name.startswith("."):
                        continue
                    full = os.path.join(base, name)
                    if os.path.isdir(full):
                        index = os.path.join(full, "index.html")
                        if not os.path.isfile(index):
                            continue
                        url = full.replace(os.sep, "/") + "/"
                        title = html_title(index) or name_title(name)
                        kind = "html"
                        date = last_commit_date(full)
                    else:
                        ext = os.path.splitext(name)[1].lower()
                        if ext not in EXTS:
                            continue
                        url = full.replace(os.sep, "/")
                        kind = EXTS[ext]
                        title = (html_title(full) if kind == "html" else None) or name_title(name)
                        date = last_commit_date(full)
                    items.append({"level": lv, "term": tm, "section": sec,
                                  "title": title, "url": url, "type": kind, "date": date})
    if os.environ.get("GITHUB_ACTIONS") == "true":
        for it in items:
            if it["type"] == "html":
                inject_og(it["url"] + "index.html" if it["url"].endswith("/") else it["url"], it)
    with open("files.json", "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=1)
    print(f"files.json: {len(items)} items")


if __name__ == "__main__":
    main()
