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
SECTIONS = ["dars", "al3ab", "series", "fard", "wadjib", "ikhtibar", "chahada", "tahaddi"]
EXTS = {".html": "html", ".htm": "html", ".pdf": "pdf",
        ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image"}

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)

LEVEL_AR = {"1m": "السنة الأولى متوسط", "2m": "السنة الثانية متوسط",
            "3m": "السنة الثالثة متوسط", "4m": "السنة الرابعة متوسط"}
SECTION_AR = {"dars": "درس تفاعلي", "al3ab": "ألعاب رياضيات", "series": "سلسلة تمارين", "fard": "فرض", "wadjib": "واجب منزلي", "ikhtibar": "اختبار", "chahada": "سلسلة الشهادة", "tahaddi": "تحدي"}


def site_base():
    owner, _, repo = os.environ.get("GITHUB_REPOSITORY", "soufiyousfi/math").partition("/")
    return f"https://{owner}.github.io/{repo}/"


def og_image(item):
    """Share image fitted to the type of exercises: og/<level>-<section>.jpg (cover.png if missing)."""
    name = f'og/{item["level"]}-{item["section"]}.jpg'
    return name if os.path.isfile(name) else "cover.png"


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
            f'\n<meta property="og:image" content="{base}{og_image(item)}">'
            f'\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">'
            f'\n<meta property="og:image:alt" content="{esc(SECTION_AR[item["section"]] + " · " + LEVEL_AR[item["level"]])}">'
            f'\n<meta name="twitter:card" content="summary_large_image">'
            f'\n<meta property="og:image:type" content="image/jpeg">\n')
    m = re.search(r"<head[^>]*>", page, re.I)
    page = page[:m.end()] + tags + page[m.end():] if m else tags + page
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)


EX_RE = re.compile(r"const exercises = (\[.*?\n\]);", re.S)
TAG_RE = re.compile(r"<[^>]+>")


def page_meta(path):
    """Number of exercises / questions / points and exercise titles of an exercise page (for the index cards)."""
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            m = EX_RE.search(f.read())
        if not m:
            return {}
        ex = json.loads(m.group(1))
        names = []
        for e in ex:
            t = html.unescape(TAG_RE.sub("", e.get("title", ""))).strip()
            t = re.sub(r"^(التمرين|تمرين)\s*\S*\s*[:：-]\s*", "", t)
            if t and t not in names:
                names.append(t)
        return {"nEx": len(ex), "nQ": sum(len(e.get("questions", [])) for e in ex),
                "pts": round(sum(q.get("pts", 0) for e in ex for q in e.get("questions", [])), 2),
                "topics": names[:6]}
    except (OSError, ValueError, AttributeError):
        return {}


def site_version():
    """Version of this deployment: pages compare it with version.json to show «تتوفر تمارين جديدة»."""
    sha = os.environ.get("GITHUB_SHA", "")
    if sha:
        return sha[:10]
    import time
    return time.strftime("%Y%m%d%H%M%S")


VERSION = site_version()


KID_SHIM = ('<script>(function(){try{var L=window.localStorage,S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem,'
            'G={"math-theme":1,"math-kids":1,"math-kid":1,"math-kid-tip":1,"math-prof":1,"math-dests":1},'
            'id=g.call(L,"math-kid")||"",k=function(t,x){return t===L&&id&&!G[x]?"kid"+id+"|"+x:x};'
            'window.__kid=id;window.__kidRaw={g:function(x){return g.call(L,x)},s:function(x,v){return s.call(L,x,v)},r:function(x){return r.call(L,x)}};'
            'S.getItem=function(x){return g.call(this,k(this,x))};S.setItem=function(x,v){return s.call(this,k(this,x),v)};'
            'S.removeItem=function(x){return r.call(this,k(this,x))}}catch(e){}})();</script>')


def inject_site_js(path):
    """Add the shared layer assets/site.js to the DEPLOYED copy of a page (CI only)."""
    with open(path, encoding="utf-8", errors="ignore") as f:
        page = f.read()
    if re.search(r'<script[^>]+assets/site\.js', page):
        return
    depth = path.replace(os.sep, "/").count("/")
    tag = f'<script src="{"../" * depth}assets/site.js?v={VERSION}" data-v="{VERSION}" defer></script>'
    # 👪 several children on one phone: every localStorage key of the active child gets its own prefix,
    # before any script of the page runs (the first child keeps the keys without prefix = data already saved)
    early = KID_SHIM
    if path.replace(os.sep, "/") != "index.html":
        # night mode before the first paint (no white flash)
        early += '<script>try{if(localStorage.getItem("math-theme")==="dark")document.documentElement.classList.add("sx-dark")}catch(e){}</script>'
    h = re.search(r"<head[^>]*>", page, re.I)
    page = page[:h.end()] + early + page[h.end():] if h else early + page
    i = page.lower().rfind("</body>")
    page = page[:i] + tag + "\n" + page[i:] if i >= 0 else page + tag
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)


def inline_index(items):
    """Put the list inside the deployed index.html so it opens without «جارٍ التحميل…»."""
    with open("index.html", encoding="utf-8") as f:
        page = f.read()
    data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
    page = re.sub(r'(<script id="items" type="application/json">).*?(</script>)',
                  lambda m: m.group(1) + data + m.group(2), page, count=1, flags=re.S)
    with open("index.html", "w", encoding="utf-8") as f:
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
        # date the page was ADDED (a later correction does not make it «جديد» again)
        out = subprocess.run(["git", "log", "--diff-filter=A", "--format=%cI", "--", path],
                             capture_output=True, text=True, check=True).stdout.strip().splitlines()
        if out:
            return out[-1]
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
                    item = {"level": lv, "term": tm, "section": sec,
                            "title": title, "url": url, "type": kind, "date": date}
                    if kind == "html":
                        item.update(page_meta(url + "index.html" if url.endswith("/") else url))
                    items.append(item)
    deploy = os.environ.get("GITHUB_ACTIONS") == "true" or os.environ.get("SITE_BUILD") == "1"
    if deploy:
        for it in items:
            if it["type"] == "html":
                page = it["url"] + "index.html" if it["url"].endswith("/") else it["url"]
                inject_og(page, it)
                inject_site_js(page)
        for lv in LEVELS:
            pack = os.path.join(lv, "bem")
            if os.path.isdir(pack):
                for name in sorted(os.listdir(pack)):
                    if name.endswith(".html"):
                        inject_site_js(os.path.join(pack, name))
        inline_index(items)
        inject_site_js("index.html")
        with open("version.json", "w", encoding="utf-8") as f:
            json.dump({"v": VERSION}, f)
    with open("files.json", "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=1)
    print(f"files.json: {len(items)} items")


if __name__ == "__main__":
    main()
