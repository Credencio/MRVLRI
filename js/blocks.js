/* Gráficos e tabelas geridos em «Gestão do site»: esconder elementos existentes e acrescentar blocos próprios (sem programar).
   Definição em window.LRI_SITE.blocks = { hidden:[ids], custom:[{...}] } */
(function () {
  const I = window.I18N, S = () => window.LRI_SITE || {}, $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const PAL = ["#1f4d3a", "#2b7fb5", "#e8a317", "#8a6a3b", "#7a5aa6", "#c23b2e", "#7cc48a", "#4d5b54", "#2f6f55", "#d97706"];
  const charts = {};
  const L = (o) => (o ? (I.lang === "en" ? o.en || o.pt : o.pt || o.en) : "") || "";

  // elementos existentes que se podem esconder (id do canvas/tabela/cartão)
  window.LRI_BUILTIN = [
    ["c-ind", "Gráfico · Pontuação por indicador"], ["c-pie", "Gráfico · Distribuição por classe"], ["c-radar", "Gráfico · Radar por indicador"],
    ["c-dist", "Gráfico · Comparação por distrito e pilar"], ["c-evo", "Gráfico · Evolução do LRI"], ["c-scores", "Gráfico · Distribuição das pontuações"],
    ["c-inst", "Gráfico · Contribuição das instituições"], ["t-sub", "Tabela · Detalhe dos sub-indicadores"], ["t-ind", "Tabela · Detalhe dos indicadores"],
    ["map-section", "Mapa dos distritos"], ["method", "Qualidade dos dados / metodologia"],
  ];
  function applyHidden() {
    const hid = (S().blocks && S().blocks.hidden) || [];
    window.LRI_BUILTIN.forEach(([id]) => {
      const el = $(id); if (!el) return;
      const box = el.closest("article") || el;
      box.classList.toggle("blk-off", hid.indexOf(id) >= 0);
    });
  }

  // ---- dados de um bloco
  const GROUPS = { district: "Distrito", institution: "Instituição", year: "Ano", province: "Província", indicatorRaw: "Indicador" };
  function parseManual(txt) {
    return String(txt || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => l.split(/[;\t]|,(?=[^,]*$)/).map((c) => c.trim()));
  }
  function dataset(b) {
    if (b.source === "data") {
      const recs = (window.DASH && window.DASH.S && window.DASH.S.valid) || [];
      const m = {};
      recs.forEach((r) => { const k = r[b.group] == null || r[b.group] === "" ? "—" : String(r[b.group]); (m[k] = m[k] || []).push(r.value); });
      const rows = Object.keys(m).sort().map((k) => {
        const v = m[k].filter((x) => x != null && !isNaN(x));
        return [k, b.measure === "mean" ? (v.length ? v.reduce((a, c) => a + c, 0) / v.length : 0) : m[k].length];
      });
      return { head: [GROUPS[b.group] || b.group, b.measure === "mean" ? "Média" : "Registos"], rows };
    }
    const rows = parseManual(b.data);
    if (!rows.length) return { head: [], rows: [] };
    const hasHead = rows[0].length > 1 && isNaN(parseFloat(String(rows[0][1]).replace(",", ".")));
    return { head: hasHead ? rows[0] : [], rows: hasHead ? rows.slice(1) : rows };
  }
  const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; };

  // ---- texto simples → HTML seguro: **negrito**, _itálico_, [texto](url), listas «- », parágrafos
  const okUrl = (u) => (/^(https?:\/\/|mailto:|tel:|#|assets\/|docs\/)/i.test(String(u || "").trim()) ? String(u).trim() : "#");
  function md(txt) {
    const inl = (x) => esc(x).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|\s)_(.+?)_(?=\s|$|[.,;:])/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, u) => `<a href="${esc(okUrl(u.replace(/&amp;/g, "&")))}" ${/^https?:/i.test(u) ? 'target="_blank" rel="noopener"' : ""}>${a}</a>`);
    return String(txt || "").split(/\n\s*\n/).map((par) => {
      const ls = par.split("\n").map((l) => l.trim()).filter(Boolean);
      if (ls.length && ls.every((l) => /^[-•*]\s+/.test(l))) return "<ul>" + ls.map((l) => "<li>" + inl(l.replace(/^[-•*]\s+/, "")) + "</li>").join("") + "</ul>";
      const h = /^(#{1,3})\s+(.*)$/.exec(par.trim());
      if (h && ls.length === 1) return `<h4>${inl(h[2])}</h4>`;
      return "<p>" + ls.map(inl).join("<br>") + "</p>";
    }).join("");
  }
  // itens em linhas «a | b | c | d» (PT e EN em paralelo)
  function items(b) {
    const P = String((b.items && b.items.pt) || "").split(/\r?\n/).filter((x) => x.trim()), E = String((b.items && b.items.en) || "").split(/\r?\n/).filter((x) => x.trim());
    const sp = (l) => String(l || "").split("|").map((c) => c.trim());
    return P.map((l, i) => ({ pt: sp(l), en: sp(E[i] || l) }));
  }
  const pickF = (it, i) => ((I.lang === "en" ? it.en[i] || it.pt[i] : it.pt[i] || it.en[i]) || "");
  function embedUrl(u) {
    u = String(u || "").trim(); if (!/^https:\/\//i.test(u)) return "";
    const y = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/.exec(u); if (y) return "https://www.youtube.com/embed/" + y[1];
    const v = /vimeo\.com\/(\d+)/.exec(u); if (v) return "https://player.vimeo.com/video/" + v[1];
    return u;
  }
  function buildSimple(b) {
    const art = document.createElement("article"), t = L(b.title), body = md(L(b.body));
    art.className = "card full blk blk-" + b.kind; art.id = "blk-" + b.id;
    const head = t ? `<h3>${esc(t)}</h3>` : "";
    if (b.kind === "text") {
      const img = b.image ? `<img class="blk-img ${b.imgSide === "left" ? "left" : "right"}" src="${esc(b.image)}" alt="${esc(L(b.imgAlt) || t)}" loading="lazy">` : "";
      art.className += " prose" + (b.align === "center" ? " ctr" : ""); art.innerHTML = head + (b.image ? `<div class="blk-split ${b.imgSide === "left" ? "rev" : ""}"><div>${body}</div>${img}</div>` : body);
    } else if (b.kind === "cards") {
      art.innerHTML = head + (body ? `<div class="prose">${body}</div>` : "") + `<div class="mini-grid">${items(b).map((it) => { const u = pickF(it, 3), tag = u ? "a" : "div"; return `<${tag} class="mini" ${u ? `href="${esc(okUrl(u))}" ${/^http/.test(u) ? 'target="_blank" rel="noopener"' : ""}` : ""}><span class="mi">${esc(it.pt[0] || "")}</span><b>${esc(pickF(it, 1))}</b><span>${esc(pickF(it, 2))}</span></${tag}>`; }).join("")}</div>`;
    } else if (b.kind === "kpis") {
      art.innerHTML = head + `<div class="kpi-row">${items(b).map((it) => `<div class="kpi2"><b class="big">${esc(it.pt[0] || "")}</b><span>${esc(pickF(it, 1))}</span></div>`).join("")}</div>`;
    } else if (b.kind === "image") {
      art.className += " flush"; art.innerHTML = head + (b.src ? `<figure class="blk-fig"><img src="${esc(b.src)}" alt="${esc(L(b.caption) || t)}" loading="lazy">${L(b.caption) ? `<figcaption>${esc(L(b.caption))}</figcaption>` : ""}</figure>` : "");
    } else if (b.kind === "embed") {
      const u = embedUrl(b.url);
      art.innerHTML = head + (body ? `<div class="prose">${body}</div>` : "") + (u ? `<div class="blk-embed" style="height:${Math.max(200, Math.min(1200, +b.height || 480))}px"><iframe src="${esc(u)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"></iframe></div>` : "<p class='muted'>—</p>");
    } else if (b.kind === "button") {
      art.className += " ctr"; art.innerHTML = head + (body ? `<div class="prose">${body}</div>` : "") + `<a class="btn" href="${esc(okUrl(b.url))}" ${/^http/.test(b.url || "") ? 'target="_blank" rel="noopener"' : ""}>${esc(L(b.label) || "→")}</a>`;
    } else if (b.kind === "accordion") {
      art.innerHTML = head + items(b).map((it) => `<details class="acc"><summary>${esc(pickF(it, 0))}</summary><div>${md(pickF(it, 1))}</div></details>`).join("");
    } else if (b.kind === "divider") {
      art.className = "blk-div"; art.innerHTML = t ? `<span>${esc(t)}</span>` : "";
    }
    return art;
  }

  function build(b) {
    if (["text", "cards", "kpis", "image", "embed", "button", "accordion", "divider"].indexOf(b.kind) >= 0) return { art: buildSimple(b), d: null };
    const d = dataset(b), id = "blk-" + b.id;
    const art = document.createElement("article");
    art.className = "card full blk"; art.id = id;
    let inner = `<h3>${esc(L(b.title) || "—")}</h3>`;
    if (b.note && L(b.note)) inner += `<p class="muted small">${esc(L(b.note))}</p>`;
    if (b.kind === "table") {
      const cols = Math.max(d.head.length, ...d.rows.map((r) => r.length), 1);
      inner += `<div class="table-wrap"><table class="data">${d.head.length ? `<thead><tr>${d.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>` : ""}<tbody>${d.rows.map((r) => `<tr>${Array.from({ length: cols }, (_, i) => `<td>${esc(r[i] == null ? "" : r[i])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      art.innerHTML = inner;
    } else {
      art.innerHTML = inner + `<div class="chart"><canvas role="img" aria-label="${esc(L(b.title))}"></canvas></div>`;
      if (window.LRI_TOOLS) {
        const bar = document.createElement("div"); bar.className = "tv-bar"; bar.innerHTML = window.LRI_TOOLS.html(true);
        art.insertBefore(bar, art.querySelector(".chart"));
        bar.querySelector(".tb-exp").onclick = () => window.LRI_TOOLS.expand(art, () => charts[b.id]);
        bar.querySelector(".tb-dl").onclick = () => window.LRI_TOOLS.png(art.querySelector("canvas"), window.LRI_TOOLS.name(bar));
        if (window.I18N) I.apply();
      }
    }
    return { art, d };
  }
  function draw(art, b, d) {
    if (b.kind === "table" || !window.Chart) return;
    const cv = art.querySelector("canvas"), type = b.type || "bar", round = type === "pie" || type === "doughnut";
    const labels = d.rows.map((r) => r[0]), vals = d.rows.map((r) => num(r[1]));
    charts[b.id] && charts[b.id].destroy();
    charts[b.id] = new Chart(cv, {
      type: type === "hbar" ? "bar" : type,
      data: { labels, datasets: [{ label: (d.head[1] || L(b.title)), data: vals, backgroundColor: round || type === "bar" || type === "hbar" ? labels.map((_, i) => PAL[i % PAL.length]) : "rgba(31,77,58,.15)", borderColor: round ? "#fff" : PAL[0], borderWidth: round ? 2 : 2, fill: type === "line", tension: .3 }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: type === "hbar" ? "y" : "x", plugins: { legend: { display: round } } },
    });
  }
  function render(pageKey) {
    applyHidden();
    const list = (S().blocks && S().blocks.custom) || [];
    if (typeof pageKey === "string") render.page = pageKey;
    const hosts = { dashboard: $("blocks-dashboard"), sobre: $("blocks-sobre"), contacto: $("blocks-contacto"), page: $("blocks-page") };
    Object.keys(hosts).forEach((pg) => {
      const host = hosts[pg]; if (!host) return;
      Object.keys(charts).forEach((k) => { const c = charts[k]; if (c && c.canvas && host.contains(c.canvas)) { c.destroy(); delete charts[k]; } });
      host.innerHTML = "";
      const want = pg === "page" ? render.page : pg;
      list.filter((b) => (b.page || "dashboard") === want && b.visible !== false).forEach((b) => {
        const { art, d } = build(b); host.appendChild(art); if (d) draw(art, b, d);
      });
    });
    if (window.I18N) I.apply();
  }
  window.LRI_BLOCKS = { render };
  window.addEventListener("lri-lang", () => render());
  if (window.DASH) { const o = window.DASH.set; window.DASH.set = (v) => { o(v); render(); }; }
  render();
})();
