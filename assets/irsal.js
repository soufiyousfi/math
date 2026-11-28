/* «📤 إرسال أوراقي إلى الأستاذ» — hidden on the home page (2026-11-28, his ask).
   Long press (2,5 s) on the school name opens it. The pupil types the class code, picks level → type → paper,
   photographs the sheets and sends them. NOTHING is graded here: the photos go to the teacher's own Google Drive
   (Apps Script, tools/irsal-apps-script.gs); the teacher grades them himself (Gemini help from his sheet menu only).
   The class code is checked by the server, never stored in this file.
   Before sending, every photo is checked ON THE PHONE: a photo with a face or one that does not look like a paper
   sheet is refused and never leaves the phone. */
(function () {
  "use strict";
  /* ↓↓↓ the address of the Apps Script web app (ends with /exec). The teacher gives it once. ↓↓↓ */
  const IRSAL_URL = "";
  /* ↑↑↑ ---------------------------------------------------------------------------------- ↑↑↑ */
  const HOLD_MS = 2500, MAX_PHOTOS = 6, MAX_SIDE = 1600, QUALITY = 0.8;
  const MP = "assets/vendor/mediapipe-0.10.21/";
  const LEVELS = { "1m": "السنة الأولى", "2m": "السنة الثانية", "3m": "السنة الثالثة", "4m": "السنة الرابعة" };
  const KINDS = { fard: "فرض", ikhtibar: "اختبار", wadjib: "واجب" };

  const school = document.getElementById("school");
  if (!school) return;

  /* ---------- 1. long press (phones and computers); a short press keeps doing nothing new ---------- */
  let timer = null, fired = false;
  const start = e => {
    if (e.type === "mousedown" && e.button !== 0) return;
    fired = false; clearTimeout(timer);
    timer = setTimeout(() => { fired = true; if (navigator.vibrate) try { navigator.vibrate(30); } catch (_) {} open(); }, HOLD_MS);
  };
  const stop = () => { clearTimeout(timer); timer = null; };
  school.addEventListener("touchstart", start, { passive: true });
  school.addEventListener("mousedown", start);
  ["touchend", "touchcancel", "touchmove", "mouseup", "mouseleave"].forEach(t => school.addEventListener(t, stop, { passive: true }));
  school.addEventListener("contextmenu", e => { if (timer || fired) e.preventDefault(); });
  school.addEventListener("click", e => { if (fired) { e.preventDefault(); e.stopPropagation(); fired = false; } }, true);
  school.style.webkitUserSelect = "none"; school.style.userSelect = "none"; school.style.webkitTouchCallout = "none";

  /* ---------- helpers ---------- */
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
               set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) {} } };
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
               set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const h = (tag, attrs, html) => { const el = document.createElement(tag); Object.assign(el, attrs || {}); if (html != null) el.innerHTML = html; return el; };

  function papers() {
    let items = [];
    try { items = JSON.parse(document.getElementById("items").textContent || "[]"); } catch (_) {}
    return items.filter(it => it.type === "html" && KINDS[it.section] && /^[1-4]m\/t[1-3]\/(fard|ikhtibar|wadjib)\/[a-z0-9\-]+\.html$/.test(it.url));
  }

  function post(body) {
    return fetch(IRSAL_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(r => { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
  }

  /* ---------- 2. the window ---------- */
  let css = false;
  function style() {
    if (css) return; css = true;
    document.head.appendChild(h("style", {}, `
.irs{position:fixed;inset:0;z-index:3500;background:rgba(15,23,42,.6);display:flex;align-items:flex-start;justify-content:center;padding:4vh 12px;overflow:auto}
.irs .box{background:var(--surface,#fff);color:var(--text,#0f172a);border-radius:18px;border-top:6px solid var(--accent,#f59e0b);max-width:460px;width:100%;padding:16px 14px 14px;box-shadow:0 8px 24px rgba(15,23,42,.25)}
.irs h2{margin:0 0 6px;font-size:1.2rem}
.irs p{margin:0 0 10px;color:var(--muted,#475569);font-size:.93rem;line-height:1.6}
.irs label{display:block;font-weight:800;font-size:.92rem;margin:8px 0 4px}
.irs select,.irs input[type=text],.irs input[type=password]{width:100%;font:inherit;padding:9px 10px;border:1.5px solid var(--border,#e2e8f0);border-radius:10px;background:var(--surface,#fff);color:var(--text,#0f172a)}
.irs .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.irs button{font:inherit;cursor:pointer;border-radius:12px;padding:9px 14px;font-weight:800;border:2px solid var(--primary,#0f4c81);background:var(--surface,#fff);color:var(--primary,#0f4c81)}
.irs button.main{background:var(--primary,#0f4c81);color:#fff}
.irs button:disabled{opacity:.5;cursor:default}
.irs .x{float:left;border:0;background:none;font-size:1.3rem;padding:0 4px;color:var(--muted,#475569)}
.irs .msg{margin-top:10px;padding:8px 10px;border-radius:10px;font-size:.92rem;display:none}
.irs .msg.err{display:block;background:#fde8e8;color:#991b1b}
.irs .msg.ok{display:block;background:var(--ok-bg,#dcfce7);color:#14532d}
.irs .msg.info{display:block;background:var(--soft,#f8fafc);color:var(--muted,#475569);border:1px solid var(--border,#e2e8f0)}
.irs .th{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.irs .th div{position:relative;border:1.5px solid var(--border,#e2e8f0);border-radius:10px;overflow:hidden;aspect-ratio:3/4;background:var(--soft,#f8fafc)}
.irs .th img{width:100%;height:100%;object-fit:cover;display:block}
.irs .th b{position:absolute;top:2px;right:4px;background:rgba(15,23,42,.65);color:#fff;border-radius:8px;padding:0 6px;font-size:.8rem}
.irs .th button{position:absolute;top:2px;left:2px;padding:0 7px;border-radius:8px;border:0;background:#b91c1c;color:#fff;font-size:.85rem}
.irs .spin{display:inline-block;width:1em;height:1em;border:3px solid currentColor;border-left-color:transparent;border-radius:50%;animation:irsr .8s linear infinite;vertical-align:-3px;margin-inline-start:6px}
@keyframes irsr{to{transform:rotate(360deg)}}
.irs .card-r{border:1.5px solid var(--border,#e2e8f0);border-radius:12px;padding:10px;margin-top:10px;background:var(--soft,#f8fafc)}
.irs .solbox{margin-top:8px;padding:8px;border-top:1px dashed var(--border,#e2e8f0);font-size:.9rem;overflow-x:auto}
.irs .solbox h4{margin:8px 0 4px;background:var(--ok-bg,#dcfce7);border-radius:6px;padding:1px 6px}
.irs .solbox table{border-collapse:collapse;width:100%}.irs .solbox td,.irs .solbox th{border:1px solid var(--border,#e2e8f0);padding:2px 4px}
.irs .hint{font-size:.85rem;color:var(--muted,#475569);margin-top:6px}`));
  }

  let root = null;
  function close() { if (root) { root.remove(); root = null; } }
  function shell(inner) {
    style(); close();
    root = h("div", { className: "irs" });
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    const box = h("div", { className: "box", dir: "rtl" }, `<button class="x" aria-label="إغلاق">✕</button>` + inner);
    root.appendChild(box); document.body.appendChild(root);
    box.querySelector(".x").onclick = close;
    root.addEventListener("click", e => { if (e.target === root) close(); });
    return box;
  }
  function msg(box, kind, text) { const m = box.querySelector(".msg"); m.className = "msg " + kind; m.innerHTML = text; }

  function open() {
    if (!IRSAL_URL) {
      const b = shell(`<h2>📤 إرسال الأوراق</h2><p>هذه الخدمة غير مفعّلة بعد. اسأل أستاذك.</p>`); return b;
    }
    if (ss.get("irsal-code")) return form();
    const b = shell(`<h2>📤 إرسال أوراقي إلى الأستاذ</h2><p>اكتب كود القسم الذي أعطاك إياه الأستاذ.</p>
<label for="irs-code">الكود</label><input type="password" id="irs-code" autocomplete="off" dir="ltr">
<div class="row"><button class="main" id="irs-go">دخول</button></div><div class="msg"></div>`);
    const inp = b.querySelector("#irs-code"), go = b.querySelector("#irs-go");
    inp.focus();
    const check = () => {
      const code = inp.value.trim(); if (!code) return;
      if (!navigator.onLine) return msg(b, "err", "لا يوجد اتصال بالإنترنت. اتصل ثم أعد المحاولة.");
      go.disabled = true; go.innerHTML = 'تحقق<span class="spin"></span>';
      post({ a: "check", code }).then(r => {
        if (r && r.ok) { ss.set("irsal-code", code); form(); }
        else { msg(b, "err", (r && r.msg) || "الكود غير صحيح. تأكّد منه وأعد المحاولة."); go.disabled = false; go.textContent = "دخول"; inp.select(); }
      }).catch(() => { msg(b, "err", "تعذّر الاتصال بالخادم. أعد المحاولة بعد قليل."); go.disabled = false; go.textContent = "دخول"; });
    };
    go.onclick = check; inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  }

  /* ---------- 3. level → type → paper, name, photos ---------- */
  function form() {
    const all = papers();
    const lvNow = ls.get("math-level");
    const mine = receipts();
    const b = shell(`<h2>📤 إرسال أوراقي إلى الأستاذ</h2>
<div class="row" style="margin:0 0 8px"><button id="irs-res">📊 نتائجي${mine.length ? " (" + mine.length + ")" : ""}</button></div>
<p>اختر الورقة، ثم صوّر ورقة إجابتك فقط (بلا وجوه ولا أشخاص).</p>
<label for="irs-lv">المستوى</label><select id="irs-lv">${Object.keys(LEVELS).map(l => `<option value="${l}"${l === lvNow ? " selected" : ""}>${LEVELS[l]}</option>`).join("")}</select>
<label for="irs-k">النوع</label><select id="irs-k">${Object.keys(KINDS).map(k => `<option value="${k}">${KINDS[k]}</option>`).join("")}</select>
<label for="irs-p">الورقة</label><select id="irs-p"></select>
<div class="row"><button id="irs-cam">📷 صوّر ورقة</button><button id="irs-gal">🖼️ من المعرض</button></div>
<input type="file" id="irs-f1" accept="image/*" capture="environment" hidden><input type="file" id="irs-f2" accept="image/*" multiple hidden>
<div class="hint">حتى ${MAX_PHOTOS} صور. صوّر كل صفحة كاملة، في ضوء جيد، والورقة مستوية.</div>
<div class="th" id="irs-th"></div>
<div class="row"><button class="main" id="irs-send" disabled>📤 أرسل أوراقي</button></div><div class="msg"></div>`);
    const $ = s => b.querySelector(s);
    const lv = $("#irs-lv"), k = $("#irs-k"), p = $("#irs-p"), send = $("#irs-send");
    $("#irs-res").onclick = results;
    const fill = () => {
      const list = all.filter(it => it.level === lv.value && it.section === k.value)
        .sort((a, b2) => a.term.localeCompare(b2.term) || a.url.localeCompare(b2.url, undefined, { numeric: true }));
      const TERM = { t1: "الفصل 1", t2: "الفصل 2", t3: "الفصل 3" };
      p.innerHTML = list.map(it => `<option value="${esc(it.url)}">${esc(TERM[it.term] + " · " + it.title)}</option>`).join("")
        || `<option value="">لا توجد أوراق</option>`;
      ready();
    };
    const photos = [];   // {blob, url}
    lv.onchange = fill; k.onchange = fill;
    const th = $("#irs-th");
    function draw() {
      th.innerHTML = "";
      photos.forEach((ph, i) => {
        const d = h("div", {}, `<img alt="صفحة ${i + 1}" src="${ph.url}"><b>${i + 1}</b><button aria-label="حذف">✕</button>`);
        d.querySelector("button").onclick = () => { URL.revokeObjectURL(ph.url); photos.splice(i, 1); draw(); };
        th.appendChild(d);
      });
      ready();
    }
    function ready() { send.disabled = !(photos.length && p.value); }
    p.onchange = ready;
    $("#irs-cam").onclick = () => $("#irs-f1").click();
    $("#irs-gal").onclick = () => $("#irs-f2").click();
    const take = async input => {
      const files = Array.from(input.files || []); input.value = "";
      for (const f of files) {
        if (photos.length >= MAX_PHOTOS) { msg(b, "err", `الحد الأقصى ${MAX_PHOTOS} صور.`); break; }
        msg(b, "info", 'فحص الصورة<span class="spin"></span>');
        try {
          const img = await load(f);
          const verdict = await guard(img);
          if (!verdict.ok) { msg(b, "err", verdict.why); continue; }
          const blob = await shrink(img);
          photos.push({ blob, url: URL.createObjectURL(blob) });
          msg(b, "ok", "✅ الصورة مقبولة.");
        } catch (_) { msg(b, "err", "تعذّرت قراءة هذه الصورة. جرّب صورة أخرى."); }
      }
      draw();
    };
    fill();
    $("#irs-f1").onchange = e => take(e.target);
    $("#irs-f2").onchange = e => take(e.target);

    send.onclick = async () => {
      if (!navigator.onLine) return msg(b, "err", "لا يوجد اتصال بالإنترنت. أوراقك لم تُرسل بعد، اتصل ثم اضغط «أرسل» من جديد.");
      send.disabled = true; send.innerHTML = 'جارٍ الإرسال<span class="spin"></span>';
      try {
        const images = await Promise.all(photos.map(ph => b64(ph.blob)));
        const r = await post({ a: "send", code: ss.get("irsal-code"), page: p.value, title: p.options[p.selectedIndex].text,
                               images });
        if (r && r.ok && r.receipt) {
          const title = p.options[p.selectedIndex].text;
          addReceipt({ r: r.receipt, page: p.value, title, d: Date.now() });
          b.innerHTML = `<h2>✅ وصلت أوراقك إلى الأستاذ</h2><p>${esc(title)}: ${photos.length} صور.</p>
<p>رقم الوصل: <b dir="ltr" style="font-size:1.4rem;letter-spacing:2px;color:var(--text,#0f172a)">${esc(r.receipt)}</b><br>حُفظ في هاتفك. دوّنه أيضا في كراسك.</p>
<p>ستظهر نقطتك في «📊 نتائجي» بعد أن يراجعها الأستاذ.</p><div class="row"><button class="main" id="irs-ok">حسنا</button><button id="irs-res2">📊 نتائجي</button></div>`;
          b.querySelector("#irs-ok").onclick = close; b.querySelector("#irs-res2").onclick = results;
        } else {
          if (r && r.bad === "code") ss.set("irsal-code", "");
          msg(b, "err", (r && r.msg) || "لم تُرسل الأوراق. أعد المحاولة."); send.disabled = false; send.textContent = "📤 أرسل أوراقي";
        }
      } catch (_) {
        msg(b, "err", "انقطع الاتصال أثناء الإرسال. أوراقك لم تصل، أعد المحاولة."); send.disabled = false; send.textContent = "📤 أرسل أوراقي";
      }
    };
  }

  /* ---------- 3b. receipts and «📊 نتائجي» (only marks the teacher APPROVED come back) ---------- */
  const RKEY = "irsal-receipts";
  function receipts() { try { const a = JSON.parse(ls.get(RKEY) || "[]"); return Array.isArray(a) ? a : []; } catch (_) { return []; } }
  function addReceipt(x) { const a = receipts().filter(y => y.r !== x.r); a.unshift(x); ls.set(RKEY, JSON.stringify(a.slice(0, 40))); }
  function results() {
    const b = shell(`<h2>📊 نتائجي</h2><p>النقاط التي راجعها الأستاذ واعتمدها.</p>
<label for="irs-add">أضف رقم وصل (من جهاز آخر)</label>
<div class="row" style="margin-top:0"><input type="text" id="irs-add" maxlength="8" dir="ltr" style="flex:1;text-transform:uppercase"><button id="irs-addb">إضافة</button></div>
<div id="irs-list"><p>جارٍ التحميل<span class="spin"></span></p></div>
<div class="row"><button id="irs-back">📤 إرسال ورقة أخرى</button></div><div class="msg"></div>`);
    b.querySelector("#irs-back").onclick = form;
    b.querySelector("#irs-addb").onclick = () => {
      const v = b.querySelector("#irs-add").value.trim().toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(v)) return msg(b, "err", "رقم الوصل 6 رموز، مثل K7Q4M2.");
      addReceipt({ r: v, page: "", title: "", d: Date.now() }); results();
    };
    const list = b.querySelector("#irs-list"), mine = receipts();
    if (!mine.length) { list.innerHTML = "<p>لم ترسل أي ورقة من هذا الهاتف بعد.</p>"; return; }
    if (!navigator.onLine) { list.innerHTML = ""; return msg(b, "err", "لا يوجد اتصال بالإنترنت."); }
    post({ a: "results", code: ss.get("irsal-code"), receipts: mine.map(x => x.r) }).then(r => {
      if (!r || !r.ok) { list.innerHTML = ""; if (r && r.bad === "code") ss.set("irsal-code", ""); return msg(b, "err", (r && r.msg) || "تعذّر جلب النتائج."); }
      const by = {}; (r.items || []).forEach(it => { by[it.r] = it; });
      list.innerHTML = mine.map(x => {
        const it = by[x.r] || { status: "unknown" };
        const title = esc(it.title || x.title || "ورقة"), date = new Date(it.date || x.d).toLocaleDateString("ar-DZ");
        const head = `<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b>${title}</b><small dir="ltr">${esc(x.r)}</small></div><small style="color:var(--muted,#475569)">${date}</small>`;
        if (it.status !== "approved")
          return `<div class="card-r">${head}<p style="margin:6px 0 0">${it.status === "unknown" ? "❔ رقم وصل غير معروف." : "⏳ في انتظار مراجعة الأستاذ."}</p></div>`;
        const per = (it.per || []).map((m, i) => `<li>التمرين ${i + 1}: <b>${esc(m)}</b></li>`).join("");
        const page = it.page || x.page;
        return `<div class="card-r">${head}
<p style="margin:6px 0;font-size:1.25rem"><b>${esc(it.total)}</b> / ${esc(it.max)}</p>${per ? `<ul style="margin:0 0 6px;padding-inline-start:20px">${per}</ul>` : ""}
${it.feedback ? `<p style="white-space:pre-line;margin:0 0 6px">${esc(it.feedback)}</p>` : ""}${it.note ? `<p style="margin:0 0 6px">📝 <b>ملاحظة الأستاذ:</b> ${esc(it.note)}</p>` : ""}
${page ? `<button class="sol" data-page="${esc(page)}">📘 الحل النموذجي</button>` : ""}</div>`;
      }).join("");
      list.querySelectorAll("button.sol").forEach(bt => bt.onclick = () => solution(bt.dataset.page, bt));
    }).catch(() => { list.innerHTML = ""; msg(b, "err", "تعذّر الاتصال بالخادم. أعد المحاولة بعد قليل."); });
  }

  /* the model answer and marking scheme already printed in the paper's page (#solpaper), shown under the mark */
  function solution(page, bt) {
    if (!/^[1-4]m\/t[1-3]\/(fard|ikhtibar|wadjib)\/[a-z0-9\-]+\.html$/.test(page)) return;
    const box = h("div", { className: "solbox" }, '<p>جارٍ التحميل<span class="spin"></span></p>');
    bt.replaceWith(box);
    fetch(page).then(r => r.text()).then(t => {
      const doc = new DOMParser().parseFromString(t, "text/html"), sp = doc.getElementById("solpaper");
      if (!sp) throw new Error("none");
      sp.querySelectorAll("script,style,img[src^='data:image/png;base64'][alt*='QR'],.qr").forEach(x => x.remove());
      sp.querySelectorAll(".ph,.cover").forEach(x => x.remove());
      box.innerHTML = sp.innerHTML;
    }).catch(() => { box.innerHTML = `<a href="${esc(page)}">📘 افتح الورقة</a>`; });
  }

  /* ---------- 4. image tools ---------- */
  function load(file) {
    return new Promise((ok, no) => {
      if (!/^image\//.test(file.type || "image/")) return no(new Error("type"));
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => ok(img); img.onerror = () => no(new Error("img")); img.src = url;
    });
  }
  function shrink(img) {
    const s = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    return new Promise(ok => c.toBlob(ok, "image/jpeg", QUALITY));
  }
  function b64(blob) {
    return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = no; r.readAsDataURL(blob); });
  }

  /* ---------- 5. the guard: refuse a photo with a face, or one that is not a paper sheet ---------- */
  /* (a) paper test (always): a sheet photo is mostly light, low-colour pixels (paper) with some dark strokes (ink). */
  function paperTest(img) {
    const W = 320, s = W / Math.max(img.naturalWidth, img.naturalHeight);
    const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
    const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data, n = d.length / 4;
    /* white balance on the brightest 30 % (a lamp makes the paper yellow; this brings it back to white) */
    const Y = new Float32Array(n);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) Y[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const cut = Array.from(Y).sort((a, b) => a - b)[Math.floor(n * 0.7)];
    let sr = 0, sg = 0, sb = 0, k = 0;
    for (let i = 0, j = 0; i < d.length; i += 4, j++) if (Y[j] >= cut) { sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; k++; }
    const m = (sr + sg + sb) / (3 * Math.max(k, 1)), cl = x => Math.min(1.8, Math.max(0.6, x));
    const fr = cl(m / Math.max(sr / k, 1)), fg = cl(m / Math.max(sg / k, 1)), fb = cl(m / Math.max(sb / k, 1));
    let light = 0, skin = 0, lightSum = 0, colour = 0;
    const Yb = new Float32Array(n);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) {
      const r = Math.min(255, d[i] * fr), gg = Math.min(255, d[i + 1] * fg), bb = Math.min(255, d[i + 2] * fb);
      const y = 0.299 * r + 0.587 * gg + 0.114 * bb, mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb);
      Yb[j] = y;
      if (mx - mn > 60) colour++;
      if (y > 120 && mx - mn < 55) { light++; lightSum += y; }
      const cb = 128 - 0.1687 * r - 0.3313 * gg + 0.5 * bb, cr = 128 + 0.5 * r - 0.4187 * gg - 0.0813 * bb;
      if (y > 60 && y < 220 && cb > 80 && cb < 122 && cr > 138 && cr < 170 && mx - mn > 30) skin++;
    }
    /* ink = pixels clearly darker than the paper around them */
    const paper = lightSum / Math.max(light, 1);
    let ink = 0;
    for (let j = 0; j < n; j++) if (Yb[j] < paper - 45) ink++;
    return { light: light / n, ink: ink / n, skin: skin / n, colour: colour / n };
  }
  /* (b) face test (MediaPipe face detector, loaded from this site only, the first time a photo is checked) */
  let detP = null;
  function detector() {
    if (!detP) detP = (async () => {
      const base = new URL(MP, document.baseURI).href;
      const vision = await import(base + "vision_bundle.mjs");
      const fileset = await vision.FilesetResolver.forVisionTasks(base + "wasm");
      return vision.FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: base + "blaze_face_short_range.tflite" }, runningMode: "IMAGE", minDetectionConfidence: 0.5 });
    })().catch(() => null);
    return detP;
  }
  async function faces(img) {
    const det = await detector();
    if (!det) return null;   // could not load: the paper test still runs
    const s = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    try { return det.detect(c).detections.length; } catch (_) { return null; }
  }
  async function guard(img) {
    const t = paperTest(img);
    const f = await faces(img);
    if (f) return { ok: false, why: "🚫 في الصورة وجه شخص. صوّر ورقة إجابتك فقط." };
    if (t.skin > 0.18) return { ok: false, why: "🚫 تبدو في الصورة يد أو شخص. صوّر الورقة وحدها، من الأعلى." };
    if (t.light < 0.55 || t.ink > 0.3 || t.colour > 0.12) return { ok: false, why: "🚫 هذه لا تبدو صورة ورقة. صوّر الورقة كاملة في ضوء جيد." };
    if (t.ink < 0.003) return { ok: false, why: "🚫 الورقة تبدو فارغة أو باهتة. صوّرها في ضوء أفضل." };
    return { ok: true };
  }

  /* for the tests only */
  window.__irsal = { paperTest, faces, guard };
})();
