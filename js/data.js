/* Leitura do Feature Service (paginada) + dados de demonstração (?demo=1) */
(function () {
  const CFG = window.LRI_CONFIG, F = CFG.fields;

  const pick = (attrs, name) => {
    if (name in attrs) return attrs[name];
    const k = Object.keys(attrs).find((x) => x.toLowerCase() === name.toLowerCase());
    return k ? attrs[k] : null;
  };
  const toDate = (v) => (v == null || v === "" ? null : new Date(typeof v === "number" ? v : Date.parse(v)));

  function toRecord(attrs, geom) {
    const num = pick(attrs, F.value);
    const cd = toDate(pick(attrs, F.collectDate)), sd = toDate(pick(attrs, F.submitDate));
    const ref = cd || sd;
    const r = {
      id: pick(attrs, F.id),
      province: pick(attrs, F.province) || "",
      district: pick(attrs, F.district) || "",
      indicatorRaw: pick(attrs, F.indicator) || "",
      subRaw: pick(attrs, F.subIndicator) || "",
      value: num == null || num === "" ? null : Number(num),
      source: pick(attrs, F.source) || "",
      season: pick(attrs, F.season) || "",
      collectDate: cd, submitDate: sd,
      institution: pick(attrs, F.institution) || "",
      statusRaw: pick(attrs, F.status),
      year: ref && !isNaN(ref) ? ref.getFullYear() : null,
      lon: null, lat: null
    };
    // coordenadas do ponto (campo geopoint "location_gps" do Survey123 → geometria da camada, em WGS84)
    if (geom && isFinite(geom.x) && isFinite(geom.y) && Math.abs(geom.x) <= 180 && Math.abs(geom.y) <= 90 && !(geom.x === 0 && geom.y === 0)) { r.lon = +geom.x; r.lat = +geom.y; }
    r.statusKey = window.LRI.statusKey(r.statusRaw);
    return window.LRI.enrich(r);
  }

  // só os campos usados (mais leve); se a camada recusar algum nome, repete-se com "*"
  const FIELDS = [...new Set(Object.values(F).filter((v) => typeof v === "string" && v))].join(",");

  async function queryPage(where, offset, outFields) {
    const p = new URLSearchParams({
      where, outFields: outFields || "*", returnGeometry: "true", outSR: "4326", f: "json",
      resultOffset: String(offset), resultRecordCount: String(CFG.pageSize), orderByFields: F.id
    });
    const url = `${CFG.featureService}/${CFG.layerId}/query?${p}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    if (j.error) throw new Error(j.error.message || "ArcGIS error");
    return j;
  }

  // Só carrega registos VALIDADOS — nada de pendentes/rejeitados chega ao dashboard.
  // cache curto na sessão do navegador (config.js: cacheMinutes, por omissão 10; 0 desliga)
  const TTL = (CFG.cacheMinutes != null ? +CFG.cacheMinutes : 10) * 60000;
  const CKEY = "lri_cache_v1";
  const cacheId = () => [CFG.featureService, CFG.layerId, JSON.stringify(CFG.status.validated)].join("|");
  function readCache() {
    if (!(TTL > 0)) return null;
    try {
      const j = JSON.parse(sessionStorage.getItem(CKEY) || "null");
      if (j && j.id === cacheId() && Date.now() - j.t < TTL && Array.isArray(j.f)) return j;
    } catch (e) {}
    return null;
  }
  function writeCache(f) {
    if (!(TTL > 0)) return;
    try { sessionStorage.setItem(CKEY, JSON.stringify({ id: cacheId(), t: Date.now(), f })); }
    catch (e) { try { sessionStorage.removeItem(CKEY); } catch (_) {} } // sem espaço: segue sem cache
  }

  // force = true (botão «Atualizar») ignora o cache
  async function loadValidated(force) {
    if (new URLSearchParams(location.search).get("demo")) return { records: demo(), demo: true };
    const hit = force ? null : readCache();
    let feats, at;
    if (hit) { feats = hit.f; at = hit.t; }
    else {
      const clause = CFG.status.validated.map((v) => `${F.status}='${String(v).replace(/'/g, "''")}'`).join(" OR ");
      let fields = FIELDS;
      feats = []; at = Date.now();
      for (let guard = 0, offset = 0; guard < 200; guard++) {
        let j;
        try { j = await queryPage(clause, offset, fields); }
        catch (e) { if (fields === "*" || offset) throw e; fields = "*"; j = await queryPage(clause, offset, fields); }
        const page = j.features || [];
        page.forEach((f) => feats.push({ attributes: f.attributes, geometry: f.geometry ? { x: f.geometry.x, y: f.geometry.y } : null }));
        if (!j.exceededTransferLimit || !page.length) break;
        offset += page.length;
      }
      writeCache(feats);
    }
    const all = feats.map((f) => toRecord(f.attributes, f.geometry));
    return { records: all.filter((r) => r.statusKey === "validated"), demo: false, at };
  }

  // Contagem por estado (opcional — falha em silêncio se a camada pública só expõe validados)
  async function loadStatusCounts() {
    try {
      const p = new URLSearchParams({
        where: "1=1", groupByFieldsForStatistics: F.status, f: "json",
        outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: F.id, outStatisticFieldName: "n" }])
      });
      const res = await fetch(`${CFG.featureService}/${CFG.layerId}/query?${p}`);
      const j = await res.json();
      if (j.error || !j.features) return null;
      const out = { validated: 0, pending: 0, rejected: 0 };
      j.features.forEach((f) => {
        const a = f.attributes; out[window.LRI.statusKey(pick(a, F.status))] += pick(a, "n") || 0;
      });
      return out;
    } catch (e) { return null; }
  }

  // ---------- DEMO (dados fictícios, só para pré-visualizar o layout) ----------
  function demo() {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const C = window.LRI_CATALOG, out = [];
    let id = 1;
    // centro aproximado de cada distrito (do shapefile embebido) para pontos de demonstração
    const centre = (name) => {
      const f = (window.LRI_DISTRICTS || []).find((x) => String(x.d).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/_/g, " ") === name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
      if (!f) return null; const pts = f.r.flat(); const n = pts.length;
      return { x: pts.reduce((s, p) => s + p[0], 0) / n, y: pts.reduce((s, p) => s + p[1], 0) / n };
    };
    ["Bárue", "Vanduzi"].forEach((d, di) => {
      const c0 = centre(d);
      [2025, 2026].forEach((y, yi) => {
        C.IND.forEach((ind) => {
          ind.subs.forEach((sub) => {
            if (rnd() < 0.15) return;
            const r = sub.rule; let lo, hi;
            if (r.t === "rng") { lo = r.m[0][0] * 0.6; hi = r.e[0][1] * 1.2; }
            else { const [a, , c] = r.th; lo = Math.min(a, c) * 0.5; hi = Math.max(a, c) * 1.5; }
            for (let k = 0; k < 2; k++) {
              const v = +(lo + rnd() * (hi - lo) + yi * (hi - lo) * 0.03).toFixed(2);
              out.push(window.LRI.enrich({
                id: id++, province: "Manica", district: d, indicatorRaw: ind.pt, subRaw: sub.pt, value: v,
                source: rnd() < 0.5 ? "Campo" : "Laboratorio", season: rnd() < 0.5 ? "Seca" : "Chuvosa",
                collectDate: new Date(y, 5 + k, 10), submitDate: new Date(y, 6 + k, 2), institution: k ? "DEMO B" : "DEMO A", lon: c0 ? c0.x + (rnd() - 0.5) * 0.3 : null, lat: c0 ? c0.y + (rnd() - 0.5) * 0.3 : null,
                statusRaw: "Validado", statusKey: "validated", year: y
              }));
            }
          });
        });
      });
    });
    return out;
  }

  window.LRI_DATA = { loadValidated, loadStatusCounts };
})();
