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

  function build(b) {
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
  function render() {
    applyHidden();
    const list = (S().blocks && S().blocks.custom) || [];
    ["dashboard", "sobre"].forEach((pg) => {
      const host = $("blocks-" + pg); if (!host) return;
      Object.keys(charts).forEach((k) => { const c = charts[k]; if (c && c.canvas && host.contains(c.canvas)) { c.destroy(); delete charts[k]; } });
      host.innerHTML = "";
      list.filter((b) => (b.page || "dashboard") === pg && b.visible !== false).forEach((b) => {
        const { art, d } = build(b); host.appendChild(art); draw(art, b, d);
      });
    });
  }
  window.LRI_BLOCKS = { render };
  window.addEventListener("lri-lang", render);
  if (window.DASH) { const o = window.DASH.set; window.DASH.set = (v) => { o(v); render(); }; }
  render();
})();
