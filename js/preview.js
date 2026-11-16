/* Corre depois de data/site.js e antes do resto:
   1) com ?preview=1 usa o rascunho de «Gestão do site» (guardado só neste navegador);
   2) aplica ao portal as ligações (config) e os nomes de pilares/indicadores definidos em data/site.js. */
(function () {
  if (/[?&]preview=1/.test(location.search)) {
    try {
      const d = JSON.parse(localStorage.getItem("lri_admin_draft") || "null");
      if (d && d.site) window.LRI_SITE = d.site;
      if (d && d.docs) window.LRI_DOCUMENTS = d.docs;
    } catch (e) {}
    window.LRI_PREVIEW = true;
    document.addEventListener("DOMContentLoaded", () => {
      const b = document.createElement("div");
      b.className = "preview-bar";
      b.innerHTML = 'Pré-visualização — alterações ainda não publicadas · <a href="#gestao">Voltar à gestão</a>';
      document.body.prepend(b);
      document.body.classList.add("is-preview");
    });
  }
  const S = window.LRI_SITE || {};
  // ligações e parâmetros (só substitui o que estiver preenchido)
  const C = window.LRI_CONFIG, cf = S.config || {};
  window.LRI_CONFIG_ORIG = Object.assign({}, C);
  if (C) Object.keys(cf).forEach((k) => { if (cf[k] !== "" && cf[k] != null) C[k] = k === "layerId" || k === "pageSize" ? Number(cf[k]) : cf[k]; });
  // nomes de pilares, indicadores e sub-indicadores
  const K = window.LRI_CATALOG, o = S.catalog || {};
  if (K) {
    window.LRI_CATALOG_ORIG = JSON.parse(JSON.stringify({ PILLARS: K.PILLARS, IND: K.IND.map((i) => ({ n: i.n, pt: i.pt, en: i.en, subs: i.subs.map((s) => ({ id: s.id, pt: s.pt, en: s.en })) })) }));
    const ap = (t, v) => { if (!v) return; ["pt", "en", "color"].forEach((f) => { if (v[f]) t[f] = v[f]; }); };
    // o reconhecimento das respostas do Survey123 continua a usar os nomes originais dos sub-indicadores
    const oSubs = {}; K.IND.forEach((i) => i.subs.forEach((x) => { oSubs[K.norm(x.pt)] = x; oSubs[K.norm(x.en)] = x; }));
    const m0 = K.matchSub;
    K.matchSub = (ind, text) => { const h = oSubs[K.norm(text)]; return h && ind.subs.indexOf(h) >= 0 ? { sub: h, assumed: false } : m0(ind, text); };
    K.PILLARS.forEach((p) => ap(p, (o.p || {})[p.id]));
    K.IND.forEach((i) => { ap(i, (o.i || {})[i.n]); i.subs.forEach((s) => ap(s, (o.s || {})[s.id])); });
  }
})();
