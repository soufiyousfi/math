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
SECTIONS = ["dars", "al3ab", "series", "fard", "wadjib", "ikhtibar", "chahada", "tahaddi", "idmaj"]
EXTS = {".html": "html", ".htm": "html", ".pdf": "pdf",
        ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image"}

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)

LEVEL_AR = {"1m": "السنة الأولى متوسط", "2m": "السنة الثانية متوسط",
            "3m": "السنة الثالثة متوسط", "4m": "السنة الرابعة متوسط"}
SECTION_AR = {"dars": "درس تفاعلي", "al3ab": "ألعاب رياضيات", "series": "سلسلة تمارين", "fard": "فرض", "wadjib": "واجب منزلي", "ikhtibar": "اختبار", "chahada": "سلسلة الشهادة", "tahaddi": "تحدي", "idmaj": "وضعية إدماجية"}


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
    url = base + item["url"]
    desc = f'{item["title"]} — {SECTION_AR[item["section"]]} في الرياضيات، {LEVEL_AR[item["level"]]}: تمارين تفاعلية مع الحل والتصحيح الآلي. الأستاذ يوسفي السوفي.'
    seo = ""
    # search engines: one address per page, and a short description when the page has none
    if not re.search(r'<link[^>]+rel=["\']canonical', page, re.I):
        seo += f'\n<link rel="canonical" href="{esc(url)}">'
    if not re.search(r'<meta[^>]+name=["\']description', page, re.I):
        seo += f'\n<meta name="description" content="{esc(desc)}">'
    tags = (seo + f'\n<meta property="og:type" content="website">'
            f'\n<meta property="og:locale" content="ar_DZ">'
            f'\n<meta property="og:site_name" content="رياضيات المتوسط — الأستاذ يوسفي السوفي">'
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


AR_ORD = {"الأول": 1, "الثاني": 2, "الثالث": 3, "الرابع": 4, "الخامس": 5, "السادس": 6, "السابع": 7}


def sequences(url, title):
    """Sequence numbers (المقطع) of a page, for the parents' report «تقريري» (2026-11-19):
    from the file name (…-m2-…, idmaj-m12 = 1 and 2) or the title («المقطع 2», «المقطعان 1 و2», «المقطعين الأول والثاني»)."""
    name = url.rstrip("/").split("/")[-1]
    m = re.search(r"(?:^|[-_])m([1-7]{1,3})(?=[-_.]|$)", name)
    if m:
        return sorted({int(c) for c in m.group(1)})
    m = re.search(r"المقطع(?:ان|ين)?\s+([^)\-–—|،]+)", title or "")
    if not m:
        return []
    part = m.group(1)
    out = {int(d) for d in re.findall(r"(?<!\d)([1-7])(?!\d)", part)}
    out |= {v for k, v in AR_ORD.items() if k in part}
    return sorted(out)


def site_version():
    """Version of this deployment: pages compare it with version.json to show «تتوفر تمارين جديدة»."""
    sha = os.environ.get("GITHUB_SHA", "")
    if sha:
        return sha[:10]
    import time
    return time.strftime("%Y%m%d%H%M%S")


VERSION = site_version()


KID_SHIM = ('<script>(function(){try{var L=window.localStorage,S=Storage.prototype,g=S.getItem,s=S.setItem,r=S.removeItem,'
            'G={"math-theme":1,"math-kids":1,"math-kid":1,"math-kid-tip":1,"math-prof":1,"math-dests":1,"math-offline":1,"math-pin":1},'
            'id=g.call(L,"math-kid")||"",k=function(t,x){return t===L&&id&&!G[x]?"kid"+id+"|"+x:x};'
            'window.__kid=id;window.__kidRaw={g:function(x){return g.call(L,x)},s:function(x,v){return s.call(L,x,v)},r:function(x){return r.call(L,x)}};'
            'S.getItem=function(x){return g.call(this,k(this,x))};S.setItem=function(x,v){return s.call(this,k(this,x),v)};'
            'S.removeItem=function(x){return r.call(this,k(this,x))}}catch(e){}})();</script>')


# ---------- 📋 resources and Bloom levels for the parents' report «تقريري» (2026-11-19 his ask
# «الهدف هو فهم جميع الموارد والتحكم فيها حسب مخطط بلوم … اضف توجيهات للتحكم الكلي والجزئي») ----------
# Each question of an exercise page is linked (automatically, by keywords) to one official resource of its level,
# and gets a Bloom level from the kind of exercise: 1 = تذكّر، فهم، تطبيق (direct application), 2 = تحليل (ربط),
# 3 = تقويم وتوظيف (وضعية إدماجية، تميّز، تحدٍّ). The map is written into the deployed page (window.__resmap).
import sys as _sys
_sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from resources_src import RES  # noqa: E402

RES_RX = {lv: [re.compile(r[4]) for r in rows] for lv, rows in RES.items()}
RES_STOP = set("على في من إلى مع عدد عددين أعداد معرفة استعمال وضعية وضعيات بسيطة معطاة حساب تعيين نحسب ثم الذي التي هذه هذا كل لكل حيث".split())


def _plain(s):
    return html.unescape(TAG_RE.sub(" ", s or "")).replace("‪", "").replace("‬", "")


def _words(s):
    return {w[2:] if w.startswith("ال") else w for w in re.findall(r"[؀-ۿ]{4,}", s)} - RES_STOP


def bloom_of(extitle, section):
    t = _plain(extitle)
    if re.search(r"وضعية|إدماج|تميّ?ز|تحدّ?ي", t) or section in ("idmaj", "tahaddi"):
        return 3
    if re.search(r"ربط", t):
        return 2
    return 1


def res_order(lv, seq, title):
    """Place of a page in the annual plan: index of the first resource of ITS sequence named by its title
    (2026-11-22, home page lists and «🎯 مهمتك الآن» follow the order of the lessons, not the alphabet)."""
    t = re.sub(r"\(.*?\)|أُتقِن:|درس تفاعلي:", " ", title or "")
    for i, (row, rx) in enumerate(zip(RES.get(lv, []), RES_RX.get(lv, []))):
        if row[1] in seq and rx.search(t):
            return i
    return None


def res_map(path, lv, term, section, seq):
    """{qId: [resource index or -1, bloom level]} for an exercise page, or None."""
    try:
        with open(path, encoding="utf-8", errors="ignore") as f:
            m = EX_RE.search(f.read())
        if not m or lv not in RES:
            return None
        ex = json.loads(m.group(1))
    except (OSError, ValueError):
        return None
    tn = int(term[1])
    rows = RES[lv]
    cand = [i for i, r in enumerate(rows) if (r[1] in seq if seq else r[0] == tn)] or [i for i, r in enumerate(rows) if r[0] <= tn]
    out = {}
    for ei, e in enumerate(ex):
        et, ctx = _plain(e.get("title", "")), _plain(e.get("context", ""))
        b = bloom_of(e.get("title", ""), section)
        hint = re.search(r"\(المورد\s*\d*\s*:\s*([^—)]+)", et)
        hint = hint.group(1) if hint else ""
        for qi, q in enumerate(e.get("questions", [])):
            meth = _plain((q.get("steps") or [""])[0])
            qt = _plain(q.get("text", ""))
            mw = _words(meth + " " + hint)
            best, bs = -1, 0
            for i in cand:
                rx = RES_RX[lv][i]
                sc = (3 * len(rx.findall(meth)) + 2 * len(rx.findall(qt)) + 2 * len(rx.findall(et)) + 0.5 * min(2, len(rx.findall(ctx)))
                      + 4 * len(rx.findall(hint)) + 1.5 * len(mw & _words(rows[i][2] + " " + rows[i][3])))
                if sc > bs:
                    bs, best = sc, i
            out[str(q.get("qId") or f"{ei + 1}-{qi + 1}")] = [best if bs >= 2 else -1, b]
    return out


def inject_resmap(path, rmap):
    with open(path, encoding="utf-8", errors="ignore") as f:
        page = f.read()
    tag = "<script>window.__resmap=" + json.dumps(rmap, separators=(",", ":")) + ";</script>"
    h = re.search(r"<head[^>]*>", page, re.I)
    page = page[:h.end()] + tag + page[h.end():] if h else tag + page
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)


def write_resources(items, maps):
    """assets/resources.json: the official resources of each level + where to practise them (links for the guidance)."""
    out = {}
    for lv, rows in RES.items():
        lst = []
        for i, r in enumerate(rows):
            ent = {"t": r[0], "s": r[1], "n": r[2], "k": r[3]}
            where = {1: [], 2: [], 3: []}
            for it in items:
                mp = maps.get(it["url"])
                if it["level"] != lv or not mp:
                    continue
                for ri, b in mp.values():
                    if ri == i and it["url"] not in where[b]:
                        where[b].append(it["url"])
            lessons = [u for u in where[1] if "/dars/" in u]
            if not lessons:     # «أُتقِن» lessons have their own engine: linked by the words of their title
                best, bs = None, 0
                for it in items:
                    if it["level"] != lv or "/dars/" not in it["url"] or "kharitat" in it["url"]:
                        continue
                    tt = re.sub(r"\(.*?\)|أُتقِن:|درس تفاعلي:", " ", it["title"])
                    ov = len(_words(tt) & _words(r[2] + " " + r[3]))
                    sc = 2 * len(RES_RX[lv][i].findall(tt)) + ov if ov >= 2 else 0
                    if sc > bs:
                        bs, best = sc, it["url"]
                if best and bs >= 3:
                    lessons = [best]
            if lessons:
                ent["l"] = lessons[0]
            if where[1]:
                ent["p1"] = [u for u in where[1] if u not in lessons][:2] or where[1][:1]
            if where[2]:
                ent["p2"] = where[2][:2]
            if where[3]:
                ent["p3"] = where[3][:2]
            lst.append(ent)
        out[lv] = lst
    # "_pg": per page, its resources and Bloom levels with the number of questions, so that the report can also count the
    # results saved BEFORE the per-question record existed (2026-11-21 his ask: bottom «السنة الدراسية» ≠ top one)
    pg = {}
    for u, mp in maps.items():
        cnt = {}
        for ri, b in mp.values():
            if ri >= 0:
                cnt[(ri, b)] = cnt.get((ri, b), 0) + 1
        if cnt:
            pg[u] = [[ri, b, n] for (ri, b), n in sorted(cnt.items())]
    out["_pg"] = pg
    os.makedirs("assets", exist_ok=True)
    with open(os.path.join("assets", "resources.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))


def inject_site_js(path):
    """Add the shared layer assets/site.js to the DEPLOYED copy of a page (CI only)."""
    with open(path, encoding="utf-8", errors="ignore") as f:
        page = f.read()
    if re.search(r'<script[^>]+assets/site\.js', page):
        return
    depth = path.replace(os.sep, "/").count("/")
    # shared answer checker first (deferred scripts run in order), then the shared layer
    tag = (f'<script src="{"../" * depth}assets/answer-check.js?v={VERSION}" defer></script>'
           f'<script src="{"../" * depth}assets/site.js?v={VERSION}" data-v="{VERSION}" defer></script>'
           f'<script src="{"../" * depth}assets/plus.js?v={VERSION}" defer></script>')
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


def inline_links(items):
    """Write every activity as a plain HTML link in the deployed index («فهرس كل الأنشطة»),
    so search engines find all pages even without running the JavaScript."""
    esc = lambda t: html.escape(t, quote=True)
    TERM_AR = {"t1": "الفصل الأول", "t2": "الفصل الثاني", "t3": "الفصل الثالث"}
    parts = []
    for lv in LEVELS:
        mine = [i for i in items if i["level"] == lv]
        if not mine:
            continue
        parts.append(f'<h3>{LEVEL_AR[lv]}</h3><ul>')
        for it in sorted(mine, key=lambda i: (i["term"], SECTIONS.index(i["section"]), i["url"])):
            parts.append(f'<li><a href="{esc(it["url"])}">{esc(it["title"])}</a> — {SECTION_AR[it["section"]]}، {TERM_AR[it["term"]]}</li>')
        parts.append('</ul>')
    with open("index.html", encoding="utf-8") as f:
        page = f.read()
    page = page.replace('<div id="all-list"></div>', '<div id="all-list">' + "".join(parts) + '</div>', 1)
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(page)


PRIORITY = {"fard": "0.8", "chahada": "0.8", "series": "0.8", "ikhtibar": "0.8", "wadjib": "0.7",
            "dars": "0.7", "tahaddi": "0.6", "al3ab": "0.6", "idmaj": "0.8"}


def write_sitemap(items, extra):
    """sitemap.xml (all pages, date of their last change) + robots.txt that points to it."""
    base = site_base()
    def lastmod(path):
        try:
            d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path],
                               capture_output=True, text=True, check=True).stdout.strip()
        except (subprocess.CalledProcessError, FileNotFoundError):
            d = ""
        return d
    rows = [(base, lastmod("index.html") or lastmod("."), "weekly", "1.0")]
    for it in items:
        pr = PRIORITY.get(it["section"], "0.6") if it["type"] == "html" else "0.4"
        rows.append((base + it["url"], lastmod(it["url"].rstrip("/")), "monthly", pr))
    for path in extra:
        rows.append((base + path, lastmod(path), "monthly", "0.7"))
    esc = lambda t: html.escape(t, quote=False)
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, mod, freq, pr in rows:
        out.append(f"  <url><loc>{esc(loc)}</loc>" + (f"<lastmod>{mod}</lastmod>" if mod else "")
                   + f"<changefreq>{freq}</changefreq><priority>{pr}</priority></url>")
    out.append("</urlset>\n")
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    with open("robots.txt", "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n")
    return len(rows)


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


def last_change_date(path):
    """Date of the LAST change (also corrections): pages saved on the phone are refreshed when it changes."""
    try:
        return subprocess.run(["git", "log", "-1", "--format=%cI", "--", path],
                              capture_output=True, text=True, check=True).stdout.strip() or None
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


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
                            "title": title, "url": url, "type": kind, "date": date,
                            "mod": last_change_date(full)}
                    seq = sequences(url, title)
                    if seq:
                        item["seq"] = seq
                        ro = res_order(lv, seq, title)
                        if ro is not None:
                            item["ro"] = ro
                    if kind == "html":
                        item.update(page_meta(url + "index.html" if url.endswith("/") else url))
                    items.append(item)
    deploy = os.environ.get("GITHUB_ACTIONS") == "true" or os.environ.get("SITE_BUILD") == "1"
    maps = {}
    for it in items:
        if it["type"] == "html":
            page = it["url"] + "index.html" if it["url"].endswith("/") else it["url"]
            mp = res_map(page, it["level"], it["term"], it["section"], it.get("seq") or [])
            if mp:
                maps[it["url"]] = mp
    if deploy:
        write_resources(items, maps)
        for it in items:
            if it["type"] == "html":
                page = it["url"] + "index.html" if it["url"].endswith("/") else it["url"]
                inject_og(page, it)
                if it["url"] in maps:
                    inject_resmap(page, maps[it["url"]])
                inject_site_js(page)
        packs = []
        for lv in LEVELS:
            pack = os.path.join(lv, "bem")
            if os.path.isdir(pack):
                for name in sorted(os.listdir(pack)):
                    if name.endswith(".html"):
                        inject_site_js(os.path.join(pack, name))
                        packs.append(f"{lv}/bem/{name}")
        # 🥇 olympiad section (2026-11-22): olymp/index.html + olymp/<g12|g34>/*.html, outside the level folders
        # because one paper serves two levels (1AM+2AM, 3AM+4AM)
        if os.path.isdir("olymp"):
            for root, _, names in sorted(os.walk("olymp")):
                for name in sorted(names):
                    if name.endswith(".html"):
                        path = os.path.join(root, name)
                        inject_site_js(path)
                        packs.append(path.replace(os.sep, "/"))
        inline_index(items)
        inline_links(items)
        print(f"sitemap.xml: {write_sitemap(items, packs)} pages")
        inject_site_js("index.html")
        inject_site_js("report.html")
        inject_site_js("awards.html")
        with open("version.json", "w", encoding="utf-8") as f:
            json.dump({"v": VERSION}, f)
    with open("files.json", "w", encoding="utf-8") as f:
        json.dump({"items": items}, f, ensure_ascii=False, indent=1)
    print(f"files.json: {len(items)} items")


if __name__ == "__main__":
    main()
