/* Gestão do site (#gestao). Rascunho guardado neste navegador; "Publicar" grava um único commit no GitHub (API Git Data).
   O token fica só em localStorage deste navegador — nunca no repositório. */
(function () {
  const root = document.getElementById("admin-root");
  const K_DRAFT = "lri_admin_draft", K_GH = "lri_admin_gh", K_BASE = "lri_admin_base";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ls = { get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  const PUB = { site: clone(window.LRI_SITE || {}), docs: clone(window.LRI_DOCUMENTS || { categories: {}, documents: [] }) };
  let D = ls.get(K_DRAFT);
  if (!D || !D.site || !D.docs) D = { site: clone(PUB.site), docs: clone(PUB.docs), files: {} };
  D.files = D.files || {};
  D.site.tabs = D.site.tabs || { dashboard: true, docs: true, tecnica: true };
  D.site.contact = D.site.contact || { email: "", location: { pt: "", en: "" }, tagline: { pt: "", en: "" } };
  D.site.texts = D.site.texts || { pt: {}, en: {} };
  D.docs.documents = D.docs.documents || [];
  D.site.images = D.site.images || { hero: "", contact: "", credit: "", gallery: [] };
  D.site.images.gallery = D.site.images.gallery || [];
  D.site.blocks = D.site.blocks || { hidden: [], custom: [] };
  D.site.blocks.hidden = D.site.blocks.hidden || []; D.site.blocks.custom = D.site.blocks.custom || [];
  const dflt = (o, k, v) => { if (o[k] == null) o[k] = v; return o[k]; };
  function normalize(site, docs) {
    dflt(site, "tabs", { dashboard: true, docs: true, tecnica: true }); dflt(site, "contact", { email: "", location: { pt: "", en: "" }, tagline: { pt: "", en: "" } });
    dflt(site, "texts", { pt: {}, en: {} }); dflt(site, "images", { hero: "", contact: "", credit: "", gallery: [] }); dflt(site.images, "gallery", []);
    dflt(site, "blocks", { hidden: [], custom: [] }); dflt(site.blocks, "hidden", []); dflt(site.blocks, "custom", []);
    dflt(site, "pages", []); dflt(site, "links", []); dflt(site, "menu", { order: [] }); dflt(site, "theme", {}); dflt(site, "banner", { on: false, text: { pt: "", en: "" }, tone: "info" });
    dflt(site, "seo", { title: { pt: "", en: "" }, description: { pt: "", en: "" } }); dflt(site, "config", {}); dflt(site, "catalog", { p: {}, i: {}, s: {} });
    ["p", "i", "s"].forEach((k) => dflt(site.catalog, k, {}));
    dflt(docs, "categories", {}); dflt(docs, "documents", []);
  }
  normalize(D.site, D.docs); normalize(PUB.site, PUB.docs);
  const sig = (o) => JSON.stringify(o, (k, v) => (k === "_new" ? undefined : v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
  const pubSig = sig([PUB.site, PUB.docs]);
  // O rascunho fica só neste navegador. Se o site publicado mudou entretanto (ex.: um documento acrescentado por ficheiro
  // ou publicado de outro computador), junta essas novidades ao rascunho em vez de as esconder.
  (function rebase() {
    if (D.pub === pubSig) return;
    let old = null; try { old = D.pubStr ? JSON.parse(D.pubStr) : null; } catch (e) {}
    if (old) normalize(old[0], old[1]);
    const oldDocs = old ? Object.fromEntries((old[1].documents || []).map((d) => [d.id, d])) : null;
    const mine = Object.fromEntries(D.docs.documents.map((d) => [d.id, d])), out = [], added = [];
    PUB.docs.documents.forEach((pd) => {
      const d = mine[pd.id];
      if (d) out.push(oldDocs && oldDocs[pd.id] && sig(oldDocs[pd.id]) === sig(d) ? pd : d);
      else if (oldDocs && oldDocs[pd.id]) { /* apagado por si no rascunho */ } else { out.push(pd); added.push(pd); }
    });
    D.docs.documents.forEach((d) => { if (!PUB.docs.documents.some((pd) => pd.id === d.id) && !(oldDocs && oldDocs[d.id] && sig(oldDocs[d.id]) === sig(d))) out.push(d); });
    D.docs.documents = out;
    D.docs.categories = Object.assign({}, PUB.docs.categories, D.docs.categories);
    if (old && sig(D.site) === sig(old[0])) D.site = clone(PUB.site);
    D.pub = pubSig; D.pubStr = JSON.stringify([PUB.site, PUB.docs]); D.files = D.files || {};
    ls.set(K_DRAFT, D);
    if (added.length) window.__admNotice = "Acrescentei ao rascunho " + added.length + " documento(s) que estavam no site mas não na gestão.";
  })();
  // ---- sincronização com o que está publicado: documentos acrescentados à mão (ou por outra pessoa) passam a aparecer aqui
  const K_PUBSNAP = "lri_admin_pubsnap";
  function mergePublished() {
    const prev = ls.get(K_PUBSNAP), ids = (d) => new Set((d.documents || []).map((x) => x.id));
    const have = ids(D.docs), prevIds = prev ? ids(JSON.parse(prev.docs)) : new Set();
    let added = 0;
    PUB.docs.documents.forEach((d) => { if (!have.has(d.id) && (!prev || !prevIds.has(d.id))) { D.docs.documents.push(clone(d)); added++; } });
    Object.keys(PUB.docs.categories || {}).forEach((k) => { if (D.docs.categories[k] == null) D.docs.categories[k] = clone(PUB.docs.categories[k]); });
    if (prev) {
      // documentos alterados no site publicado e não tocados no rascunho
      const pd = JSON.parse(prev.docs).documents || [];
      PUB.docs.documents.forEach((d) => { const o = pd.find((x) => x.id === d.id), i = D.docs.documents.findIndex((x) => x.id === d.id); if (o && i >= 0 && sig(o) !== sig(d) && sig(D.docs.documents[i]) === sig(o)) D.docs.documents[i] = clone(d); });
      if (sig(PUB.site) !== sig(JSON.parse(prev.site)) && sig(D.site) === sig(JSON.parse(prev.site))) D.site = clone(PUB.site);
    }
    if (!prev || sig(PUB.docs) !== sig(JSON.parse(prev.docs)) || sig(PUB.site) !== sig(JSON.parse(prev.site))) ls.set(K_BASE, [JSON.stringify(PUB.site), JSON.stringify(PUB.docs)]);
    ls.set(K_PUBSNAP, { site: JSON.stringify(PUB.site), docs: JSON.stringify(PUB.docs) });
    return added;
  }
  normalize(D.site, D.docs); const addedOnLoad = mergePublished(); normalize(D.site, D.docs); ls.set(K_DRAFT, D);
  dflt(D.site, "pages", []); dflt(D.site, "links", []); dflt(D.site, "menu", { order: [] }); dflt(D.site, "theme", {}); dflt(D.site, "banner", { on: false, text: { pt: "", en: "" }, tone: "info" });
  dflt(D.site, "seo", { title: { pt: "", en: "" }, description: { pt: "", en: "" } }); dflt(D.site, "config", {}); dflt(D.site, "catalog", { p: {}, i: {}, s: {} });
  ["p", "i", "s"].forEach((k) => dflt(D.site.catalog, k, {}));
  D.docs.categories = D.docs.categories || {};
  const save = () => { D.pub = pubSig; D.pubStr = D.pubStr || JSON.stringify([PUB.site, PUB.docs]); ls.set(K_DRAFT, D); };
  const GH = () => ls.get(K_GH) || { owner: "", repo: "", branch: "main", token: "" };
  const baseObjs = () => { const b = ls.get(K_BASE); const o = b && b.parts && b.pub === pubSig ? [JSON.parse(b.parts[0]), JSON.parse(b.parts[1])] : [clone(PUB.site), clone(PUB.docs)]; normalize(o[0], o[1]); return o; };
  const baseParts = () => baseObjs().map((x) => JSON.stringify(x));
  const baseSnap = () => sig(baseObjs());
  const snap = () => sig([D.site, D.docs]);
  const pendingFiles = () => Object.keys(D.files);
  const dirty = () => snap() !== baseSnap() || pendingFiles().length > 0;

  // ---- ficheiros (PDF) guardados no IndexedDB até à publicação
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open("lri_admin", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const idbOp = async (mode, fn) => { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction("f", mode), q = fn(tx.objectStore("f")); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); }); };
  const fPut = (k, b) => idbOp("readwrite", (s) => s.put(b, k)), fGet = (k) => idbOp("readonly", (s) => s.get(k)), fDel = (k) => idbOp("readwrite", (s) => s.delete(k));

  // ---- imagens: reduz no navegador (máx. 1800 px, JPEG) e guarda até à publicação
  const urlCache = {};
  function shrink(file, max) {
    return new Promise((res, rej) => {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob((b) => (b ? res(b) : rej(new Error("imagem inválida"))), "image/jpeg", 0.8); };
      im.onerror = () => rej(new Error("Não foi possível ler a imagem.")); im.src = u;
    });
  }
  async function storeImg(file, max) {
    const blob = await shrink(file, max), name = "assets/photos/" + slug(file.name.replace(/\.[^.]+$/, "")) + "-" + Date.now().toString(36) + ".jpg";
    await fPut(name, blob); D.files[name] = { size: blob.size }; urlCache[name] = URL.createObjectURL(blob); return name;
  }
  // ---- campos editáveis
  const TEXTS = [
    ["appSub", "Subtítulo do cabeçalho", 0], ["aboutGoalH", "Sobre · título «Objetivo»", 0], ["aboutGoalP", "Sobre · objetivo", 1], ["aboutWhatP", "Sobre · o que é o LRI", 1],
    ["aboutFlowH", "Sobre · título «Do terreno ao Dashboard»", 0], ["aboutMethH", "Sobre · título «Metodologia»", 0], ["aboutPolH", "Sobre · título «Alinhamento»", 0],
    ["aboutPlatH", "Sobre · título «Plataforma»", 0], ["docsTitle", "Documentos · título", 0], ["docsIntro", "Documentos · introdução", 1],
    ["navAbout", "Menu · Sobre", 0], ["navDashboard", "Menu · Dashboard", 0], ["navDocs", "Menu · Documentos", 0], ["navTech", "Menu · Técnica", 0],
    ["footer", "Rodapé", 1], ["cTitle1", "Contacto · título (parte 1)", 0], ["cTitle2", "Contacto · título (parte laranja)", 0], ["contactHeadA", "Contacto · título (parte branca)", 0], ["contactHeadB", "Contacto · título (parte laranja)", 0], ["sugH", "Contacto · título do formulário", 0], ["sugIntro", "Contacto · introdução do formulário", 1],
  ];
  const getPath = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  function setPath(o, p, v) {
    const ks = p.split("."); const last = ks.pop();
    const t = ks.reduce((a, k) => (a[k] == null ? (a[k] = {}) : a[k]), o);
    if (ks[0] === "texts" && ks.length === 2) { if (v === "" || v === window.I18N.base[ks[1]][last]) { delete t[last]; return; } }
    if ((ks[0] === "catalog" || ks[0] === "config" || ks[0] === "theme") && v === "") { delete t[last]; return; }
    if (ks[0] === "theme" && last === "radius") v = Math.max(6, Math.min(30, +v || 18));
    t[last] = v;
  }
  const bind = (store, path) => `data-b="${store}:${path}"`;
  const inp = (label, store, path, val, type) => `<label>${label}<input type="${type || "text"}" ${bind(store, path)} value="${esc(val)}"></label>`;
  const area = (label, store, path, val, rows) => `<label>${label}<textarea rows="${rows || 4}" ${bind(store, path)}>${esc(val)}</textarea></label>`;
  const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ---- secções
  const SECTIONS = [["resumo", "Início", "🏠"], ["paginas", "Páginas e menu", "🧭"], ["graficos", "Blocos e conteúdo", "🧩"], ["textos", "Textos", "✏️"], ["imagens", "Imagens", "🖼️"], ["documentos", "Documentos", "📄"], ["aparencia", "Aparência e aviso", "🎨"], ["indicadores", "Indicadores", "🌿"], ["ligacoes", "Ligações de dados", "🔗"], ["contacto", "Contacto", "✉️"], ["publicar", "Publicar", "🚀"], ["github", "Ligação GitHub", "🔑"]];
  const BLOCK_TYPES = { chart: ["📈", "Gráfico"], table: ["📋", "Tabela"], text: ["📝", "Texto"], cards: ["🗂️", "Cartões"], kpis: ["🔢", "Números em destaque"], image: ["🖼️", "Fotografia"], embed: ["▶️", "Vídeo ou mapa incorporado"], button: ["🔘", "Botão"], accordion: ["❓", "Perguntas frequentes"], divider: ["➖", "Separador"] };
  let blkFilter = "*", textQ = "";
  const pageList = () => [["dashboard", "Dashboard"], ["sobre", "Sobre o LRI"], ["contacto", "Contacto"]].concat(D.site.pages.map((p) => ["p:" + p.id, "Página: " + ((p.title && p.title.pt) || p.id)]));
  const pageName = (id) => (pageList().find((x) => x[0] === id) || [0, id])[1];
  function menuItems() {
    const S = D.site, tabLbl = { about: ["🏠", "Sobre o LRI", null], dashboard: ["📊", "Dashboard", "tabs.dashboard"], docs: ["📄", "Documentos", "tabs.docs"], tecnica: ["🛠️", "Técnica", "tabs.tecnica"], contact: ["✉️", "Contacto", "tabs.contact"] };
    const all = Object.keys(tabLbl).map((k) => ({ key: k, ic: tabLbl[k][0], label: tabLbl[k][1], toggle: tabLbl[k][2] }))
      .concat(S.pages.map((p, i) => ({ key: "p:" + p.id, ic: "📄", label: "Página: " + ((p.title && p.title.pt) || p.id), toggle: `pages.${i}.menu` })))
      .concat(S.links.map((l, i) => ({ key: "l:" + i, ic: "🔗", label: "Ligação: " + ((l.label && l.label.pt) || l.url || "—"), toggle: null })));
    const o = S.menu.order || [];
    return all.slice().sort((a, b) => { const x = o.indexOf(a.key), y = o.indexOf(b.key); return (x < 0 ? 99 + all.indexOf(a) : x) - (y < 0 ? 99 + all.indexOf(b) : y); });
  }
  const blockTemplate = (k, page) => Object.assign({ id: "b" + Date.now().toString(36) + Math.floor(Math.random() * 99), kind: k, page: page, visible: true, title: { pt: "", en: "" }, _new: true },
    k === "chart" ? { type: "bar", source: "manual", note: { pt: "", en: "" }, data: "Exemplo A;10\nExemplo B;20\nExemplo C;15" }
    : k === "table" ? { source: "manual", note: { pt: "", en: "" }, data: "Nome;Valor\nExemplo A;10\nExemplo B;20" }
    : k === "text" ? { body: { pt: "", en: "" }, align: "left", imgSide: "right" }
    : k === "cards" ? { body: { pt: "", en: "" }, items: { pt: "🌱 | Terra | Solos e biodiversidade | \n💧 | Água | Qualidade e disponibilidade | \n🤝 | Pessoas | Capacidade adaptativa | ", en: "🌱 | Land | Soils and biodiversity | \n💧 | Water | Quality and availability | \n🤝 | People | Adaptive capacity | " } }
    : k === "kpis" ? { items: { pt: "1 200 | agricultores\n2 | distritos\n17 | indicadores", en: "1,200 | farmers\n2 | districts\n17 | indicators" } }
    : k === "image" ? { src: "", caption: { pt: "", en: "" } }
    : k === "embed" ? { url: "", height: 480, body: { pt: "", en: "" } }
    : k === "button" ? { label: { pt: "Saber mais", en: "Learn more" }, url: "", body: { pt: "", en: "" } }
    : k === "accordion" ? { items: { pt: "Pergunta 1 | Resposta 1\nPergunta 2 | Resposta 2", en: "Question 1 | Answer 1\nQuestion 2 | Answer 2" } } : {});
  const textRows = (keys) => {
    const B = window.I18N.base, X = D.site.texts, tl = Object.fromEntries(TEXTS.map((x) => [x[0], x[1]]));
    return keys.slice(0, 60).map((k) => {
      const html = /<[a-z]/i.test(B.pt[k] || ""), big = html || String(B.pt[k] || "").length > 90;
      return `<div class="adm-card"><h3>${esc(tl[k] || k)} <small class="muted">(${esc(k)})</small></h3><div class="adm-cols">` +
        ["pt", "en"].map((lg) => (big ? area : inp)(lg.toUpperCase(), "site", `texts.${lg}.${k}`, (X[lg] && X[lg][k]) != null ? X[lg][k] : (B[lg][k] || ""), big ? 5 : undefined)).join("") +
        `</div>${html ? '<p class="muted small">Este texto usa marcação HTML (<code>&lt;b&gt;</code>, <code>&lt;a&gt;</code>…). Mantenha as marcas.</p>' : ""}</div>`;
    }).join("") + (keys.length > 60 ? `<p class="muted">A mostrar 60 de ${keys.length}. Refine a pesquisa.</p>` : "") + (keys.length ? "" : "<p class='muted'>Nada encontrado.</p>");
  };
  let cur = "resumo", msg = null;

  const views = {
    resumo() {
      const g = GH(), n = D.docs.documents.length, nb = D.site.blocks.custom.length, np = D.site.pages.length;
      const tile = (k, ic, t, d) => `<a class="adm-tile" href="#gestao/${k}"><div class="ic">${ic}</div><b>${t}</b><span>${d}</span></a>`;
      return `<div class="adm-hero"><h1>Olá! Bem-vindo à gestão do portal</h1><p>Mude textos, crie páginas e blocos, carregue documentos e fotografias, ajuste cores e ligações — sem programar.</p></div>
        <div class="adm-steps"><div class="adm-step"><b class="n">1</b><div><b>Edite</b><br><small class="muted">páginas, blocos, textos, imagens</small></div></div>
          <div class="adm-step"><b class="n">2</b><div><b>Pré-visualize</b><br><small class="muted">veja antes de publicar</small></div></div>
          <div class="adm-step"><b class="n">3</b><div><b>Publique</b><br><small class="muted">um clique e o site atualiza</small></div></div></div>
        <div class="adm-tiles">${tile("paginas", "🧭", "Páginas e menu", `${np} página(s) própria(s) · ordem do menu`)}${tile("graficos", "🧩", "Blocos e conteúdo", `${nb} criado(s) · gráficos, texto, cartões…`)}${tile("textos", "✏️", "Textos", "todos os textos, PT e EN")}${tile("imagens", "🖼️", "Imagens", "fundos e galeria")}${tile("documentos", "📄", "Documentos", `${n} na biblioteca`)}${tile("aparencia", "🎨", "Aparência e aviso", "cores, aviso no topo, título")}${tile("indicadores", "🌿", "Indicadores", "nomes dos pilares e indicadores")}${tile("ligacoes", "🔗", "Ligações de dados", "Feature Service e Survey123")}${tile("contacto", "✉️", "Contacto", "email, telefone, redes")}</div>
        <div class="adm-grid"><div class="adm-stat"><b>${dirty() ? "Sim" : "Não"}</b><span>Alterações por publicar</span></div>
          <div class="adm-stat"><b>${g.token ? "Ligado" : "Por ligar"}</b><span>GitHub ${g.owner ? esc(g.owner + "/" + g.repo) : ""}</span></div></div>
        ${g.token ? "" : `<p class="adm-msg info">Para publicar, ligue primeiro o GitHub em «Ligação GitHub».</p>`}`;
    },
    paginas() {
      const items = menuItems(), S = D.site;
      const rows = items.map((it, i) => `<div class="adm-switch"><span style="width:26px">${it.ic}</span><label style="flex:1">${esc(it.label)}</label>
        ${it.toggle ? `<input type="checkbox" title="Mostrar no menu" ${bind("site", it.toggle)} ${getPath(D.site, it.toggle) !== false ? "checked" : ""}>` : `<small class="muted">sempre visível</small>`}
        <button class="adm-btn sec" data-act="mv" data-k="${esc(it.key)}" data-d="-1" ${i === 0 ? "disabled" : ""}>↑</button><button class="adm-btn sec" data-act="mv" data-k="${esc(it.key)}" data-d="1" ${i === items.length - 1 ? "disabled" : ""}>↓</button></div>`).join("");
      const pages = S.pages.map((p, i) => `<details class="adm-doc" ${p._new ? "open" : ""}><summary>📄 ${esc((p.title && p.title.pt) || "Nova página")} <small class="muted">· #p/${esc(p.id)}</small></summary>
        <div class="adm-cols">${inp("Título (PT)", "site", `pages.${i}.title.pt`, p.title && p.title.pt)}${inp("Título (EN)", "site", `pages.${i}.title.en`, p.title && p.title.en)}</div>
        <div class="adm-switch"><input type="checkbox" id="pv${i}" ${bind("site", `pages.${i}.visible`)} ${p.visible !== false ? "checked" : ""}><label for="pv${i}">Página publicada</label></div>
        <div class="adm-switch"><input type="checkbox" id="pm${i}" ${bind("site", `pages.${i}.menu`)} ${p.menu !== false ? "checked" : ""}><label for="pm${i}">Mostrar no menu</label></div>
        <div class="adm-row" style="margin-top:12px"><button class="adm-btn" data-act="editpage" data-p="p:${esc(p.id)}">Editar o conteúdo</button><button class="adm-btn red" data-act="delpage" data-i="${i}">Remover página</button></div></details>`).join("");
      const links = S.links.map((l, i) => `<div class="adm-cols" style="align-items:end">${inp("Nome (PT)", "site", `links.${i}.label.pt`, l.label && l.label.pt)}${inp("Nome (EN)", "site", `links.${i}.label.en`, l.label && l.label.en)}</div>
        <div class="adm-row">${`<label style="flex:1">Endereço (https://…)<input type="text" ${bind("site", `links.${i}.url`)} value="${esc(l.url)}"></label>`}<button class="adm-btn red" data-act="dellink" data-i="${i}">Remover</button></div>`).join("<hr style='border:0;border-top:1px solid #eef1ee;margin:10px 0'>");
      return `<h1 class="plain">Páginas e menu</h1><p class="sub">Ordene o menu, esconda abas, crie páginas novas e acrescente ligações externas.</p>
        <div class="adm-card"><h3>Ordem e visibilidade do menu</h3>${rows}</div>
        <div class="adm-card"><h3>As minhas páginas</h3>${pages || "<p class='muted'>Ainda não criou páginas.</p>"}<p><button class="adm-btn" data-act="addpage">+ Nova página</button></p></div>
        <div class="adm-card"><h3>Ligações externas no menu</h3>${links || "<p class='muted'>Sem ligações.</p>"}<p><button class="adm-btn sec" data-act="addlink">+ Nova ligação</button></p></div>`;
    },
    graficos() {
      const hid = D.site.blocks.hidden, B = window.LRI_BUILTIN || [], f = blkFilter;
      const rows = B.map(([id, l]) => `<div class="adm-switch"><input type="checkbox" id="vis-${id}" data-hid="${id}" ${hid.indexOf(id) < 0 ? "checked" : ""}><label for="vis-${id}">${esc(l)}</label></div>`).join("");
      const opt = (v, l, cur) => `<option value="${esc(v)}" ${cur === v ? "selected" : ""}>${esc(l)}</option>`;
      const pageOpts = (cur) => pageList().map(([v, l]) => opt(v, l, cur)).join("");
      const rr = ' data-rr="1"';
      const list = D.site.blocks.custom.map((b, i) => ({ b, i })).filter((x) => f === "*" || (x.b.page || "dashboard") === f).map(({ b, i }) => {
        const p = `blocks.custom.${i}`, k = b.kind || "chart", T = BLOCK_TYPES[k] || ["📦", k];
        let f2 = "";
        const body = area("Texto (PT) — **negrito**, _itálico_, [link](https://…), linhas «- » para listas", "site", p + ".body.pt", b.body && b.body.pt, 5) + area("Texto (EN)", "site", p + ".body.en", b.body && b.body.en, 5);
        const itemsF = (hint) => `<p class="muted small">${hint}</p><div class="adm-cols">${area("Itens (PT)", "site", p + ".items.pt", b.items && b.items.pt, 6)}${area("Itens (EN)", "site", p + ".items.en", b.items && b.items.en, 6)}</div>`;
        const imgUp = (field, label) => `<div class="adm-pic"><div class="im" style="background-image:url('${esc(urlCache[b[field]] || b[field] || "")}')"></div><div><b>${label}</b><br><small class="muted">${esc(b[field] || "sem imagem")}</small><br><label class="adm-btn sec" style="display:inline-block;margin:8px 0 0;cursor:pointer">Escolher imagem<input type="file" accept="image/*" hidden data-blkimg="${i}:${field}"></label>${b[field] ? ` <button class="adm-btn sec" data-act="clearimg" data-i="${i}" data-f="${field}">Tirar</button>` : ""}</div></div>`;
        if (k === "chart" || k === "table") {
          f2 = `${k === "table" ? "" : `<label>Forma do gráfico<select ${bind("site", p + ".type")}>${opt("bar", "Barras", b.type || "bar")}${opt("hbar", "Barras horizontais", b.type)}${opt("line", "Linhas", b.type)}${opt("pie", "Circular", b.type)}${opt("doughnut", "Rosca", b.type)}</select></label>`}
          <div class="adm-cols">${inp("Nota (PT, opcional)", "site", p + ".note.pt", b.note && b.note.pt)}${inp("Nota (EN, opcional)", "site", p + ".note.en", b.note && b.note.en)}</div>
          <label>De onde vêm os dados<select ${bind("site", p + ".source")}${rr}>${opt("manual", "Escrevo os dados aqui", b.source || "manual")}${opt("data", "Dados da plataforma (registos validados)", b.source)}</select></label>
          ${b.source === "data" ? `<div class="adm-cols"><label>Agrupar por<select ${bind("site", p + ".group")}>${[["district", "Distrito"], ["institution", "Instituição"], ["year", "Ano"], ["province", "Província"], ["indicatorRaw", "Indicador"]].map(([v, l]) => opt(v, l, b.group || "district")).join("")}</select></label>
            <label>Medida<select ${bind("site", p + ".measure")}>${opt("count", "Número de registos", b.measure || "count")}${opt("mean", "Valor médio", b.measure)}</select></label></div>`
          : area("Dados — uma linha por item, «Nome;Valor». Nas tabelas, a 1.ª linha pode ser o cabeçalho e pode ter mais colunas.", "site", p + ".data", b.data, 6)}`;
        } else if (k === "text") f2 = body + `<div class="adm-cols"><label>Alinhamento<select ${bind("site", p + ".align")}>${opt("left", "Esquerda", b.align || "left")}${opt("center", "Centrado", b.align)}</select></label><label>Imagem ao lado<select ${bind("site", p + ".imgSide")}>${opt("right", "À direita", b.imgSide || "right")}${opt("left", "À esquerda", b.imgSide)}</select></label></div>` + imgUp("image", "Imagem (opcional)");
        else if (k === "cards") f2 = body + itemsF("Um cartão por linha: <code>ícone | título | texto | ligação</code> (ex.: <code>🌱 | Terra | Solos e biodiversidade | https://…</code>). A ligação é opcional.");
        else if (k === "kpis") f2 = itemsF("Um número por linha: <code>valor | rótulo</code> (ex.: <code>1 200 | agricultores</code>).");
        else if (k === "image") f2 = imgUp("src", "Fotografia") + `<div class="adm-cols">${inp("Legenda (PT)", "site", p + ".caption.pt", b.caption && b.caption.pt)}${inp("Legenda (EN)", "site", p + ".caption.en", b.caption && b.caption.en)}</div>`;
        else if (k === "embed") f2 = body + inp("Endereço (https://…) — YouTube, Vimeo, mapas ArcGIS, Power BI…", "site", p + ".url", b.url) + inp("Altura (px)", "site", p + ".height", b.height || 480, "number");
        else if (k === "button") f2 = body + `<div class="adm-cols">${inp("Texto do botão (PT)", "site", p + ".label.pt", b.label && b.label.pt)}${inp("Texto do botão (EN)", "site", p + ".label.en", b.label && b.label.en)}</div>` + inp("Endereço (https://… ou #documentos)", "site", p + ".url", b.url);
        else if (k === "accordion") f2 = itemsF("Uma pergunta por linha: <code>pergunta | resposta</code>.");
        return `<details class="adm-doc" ${b._new ? "open" : ""}><summary>${T[0]} ${esc((b.title && b.title.pt) || T[1])} <small class="muted">· ${T[1]} · ${esc(pageName(b.page || "dashboard"))}${b.visible === false ? " · oculto" : ""}</small></summary>
          <div class="adm-cols"><label>Onde aparece<select ${bind("site", p + ".page")}>${pageOpts(b.page || "dashboard")}</select></label>${inp("Título (PT)", "site", p + ".title.pt", b.title && b.title.pt)}</div>
          ${inp("Título (EN)", "site", p + ".title.en", b.title && b.title.en)}
          ${f2}
          <div class="adm-switch" style="border:0"><input type="checkbox" id="bv${i}" ${bind("site", p + ".visible")} ${b.visible !== false ? "checked" : ""}><label for="bv${i}">Mostrar no site</label></div>
          <div class="adm-row"><button class="adm-btn sec" data-act="mvblk" data-i="${i}" data-d="-1">↑ Subir</button><button class="adm-btn sec" data-act="mvblk" data-i="${i}" data-d="1">↓ Descer</button><button class="adm-btn sec" data-act="dupblk" data-i="${i}">Duplicar</button><button class="adm-btn red" data-act="delblk" data-i="${i}">Remover</button></div></details>`;
      }).join("");
      return `<h1 class="plain">Blocos e conteúdo</h1><p class="sub">Acrescente gráficos, tabelas, texto, cartões, números, fotografias, vídeos, mapas e perguntas frequentes a qualquer página.</p>
        <div class="adm-card"><h3>Os meus blocos</h3>
          <div class="adm-cols"><label>Ver blocos de<select id="blk-filter"><option value="*" ${f === "*" ? "selected" : ""}>Todas as páginas</option>${pageOpts(f)}</select></label>
          <label>Novo bloco<select id="blk-new"><option value="">Escolher o tipo…</option>${Object.keys(BLOCK_TYPES).map((k) => `<option value="${k}">${BLOCK_TYPES[k][0]} ${BLOCK_TYPES[k][1]}</option>`).join("")}</select></label></div>
          ${list || "<p class='muted'>Sem blocos nesta vista. Escolha um tipo em «Novo bloco».</p>"}</div>
        <div class="adm-card"><h3>Elementos que já existem no Dashboard</h3><p class="muted small">Desligue o que não quer mostrar.</p>${rows}</div>`;
    },
    textos() {
      const q = textQ.toLowerCase();
      const keys = q ? Object.keys(window.I18N.base.pt).filter((k) => k.toLowerCase().includes(q) || String(window.I18N.base.pt[k]).toLowerCase().includes(q) || String(window.I18N.base.en[k] || "").toLowerCase().includes(q)) : TEXTS.map((x) => x[0]);
      return `<h1 class="plain">Textos</h1><p class="sub">Todos os textos do portal, em português e inglês. Pesquise por palavra. Deixe vazio para voltar ao original.</p>
        <div class="adm-card"><label>Pesquisar texto<input type="text" id="txt-q" value="${esc(textQ)}" placeholder="ex.: metodologia, rodapé, exportar…"></label><p class="muted small" id="txt-count"></p></div><div id="txt-list">${textRows(keys)}</div>`;
    },
    imagens() {
      const I = D.site.images, th = (p) => (urlCache[p] || p || "");
      const pic = (label, key) => `<div class="adm-pic"><div class="im" style="background-image:url('${esc(th(I[key]))}')"></div><div><b>${label}</b><br><small class="muted">${esc(I[key] || "sem imagem")}${D.files[I[key]] ? " · por publicar" : ""}</small><br><label class="adm-btn sec" style="display:inline-block;margin:8px 0 0;cursor:pointer">Trocar imagem<input type="file" accept="image/*" hidden data-img="${key}"></label></div></div>`;
      const gal = I.gallery.map((g, i) => `<div class="adm-pic"><div class="im" style="background-image:url('${esc(th(g.src))}')"></div><div style="flex:1">
          <div class="adm-cols">${inp("Legenda (PT)", "site", `images.gallery.${i}.caption.pt`, g.caption && g.caption.pt)}${inp("Legenda (EN)", "site", `images.gallery.${i}.caption.en`, g.caption && g.caption.en)}</div>
          <button class="adm-btn red" data-act="delimg" data-i="${i}">Remover</button></div></div>`).join("");
      return `<h1 class="plain">Imagens</h1><p class="sub">Fundos da página inicial e do Contacto, e a galeria de fotografias da aba Sobre. As fotos são reduzidas automaticamente.</p>
        <div class="adm-card"><h3>Fundos</h3>${pic("Fundo da página inicial (Sobre)", "hero")}${pic("Fundo da aba Contacto", "contact")}
        ${inp("Crédito das fotografias", "site", "images.credit", I.credit)}</div>
        <div class="adm-card"><h3>Galeria</h3>${gal || "<p class='muted'>Sem fotografias.</p>"}
        <label class="drop" id="dzi" style="margin-top:12px"><span class="big">🖼️</span>Arraste fotografias ou clique para adicionar<input type="file" accept="image/*" multiple data-newimgs></label></div>`;
    },
    documentos() {
      const cats = (D.docs.categories) || {};
      const rows = D.docs.documents.map((d, i) => {
        const p = `documents.${i}`;
        return `<details class="adm-doc" ${d._new ? "open" : ""}><summary>${esc((d.title && d.title.pt) || d.id || "Novo documento")} <small class="muted">· ${esc(d.year || "")}</small></summary>
          <div class="adm-cols">${inp("Título (PT)", "docs", p + ".title.pt", d.title && d.title.pt)}${inp("Título (EN)", "docs", p + ".title.en", d.title && d.title.en)}</div>
          <div class="adm-cols">${area("Descrição (PT)", "docs", p + ".description.pt", d.description && d.description.pt, 3)}${area("Descrição (EN)", "docs", p + ".description.en", d.description && d.description.en, 3)}</div>
          <div class="adm-cols"><label>Categoria<select ${bind("docs", p + ".category")}>${Object.keys(cats).filter((k) => k[0] !== "_").map((k) => `<option value="${esc(k)}" ${d.category === k ? "selected" : ""}>${esc((cats[k] && cats[k].pt) || k)}</option>`).join("")}</select></label>
            ${inp("Autores", "docs", p + ".authors", d.authors)}</div>
          <div class="adm-cols">${inp("Entidade editora", "docs", p + ".publisher", d.publisher)}${inp("Ano", "docs", p + ".year", d.year)}</div>
          <div class="adm-cols">${inp("Idioma", "docs", p + ".language", d.language)}${inp("Páginas", "docs", p + ".pages", d.pages)}</div>
          <div class="adm-cols">${inp("Licença", "docs", p + ".license", d.license)}${inp("Tamanho (ex.: 2,1 MB)", "docs", p + ".size", d.size)}</div>
          <div class="adm-pic"><div class="im" style="background-image:url('${esc(urlCache[d.thumb] || d.thumb || "")}')"></div><div><b>Miniatura</b><br><small class="muted">${esc(d.thumb || "sem miniatura")}</small><br><label class="adm-btn sec" style="display:inline-block;margin:8px 0 0;cursor:pointer">Escolher imagem<input type="file" accept="image/*" hidden data-thumb="${i}"></label></div></div>
          <label>Ficheiro PDF <small class="muted">${esc(d.file || "—")}${D.files[d.file] ? " · por publicar" : ""}</small><input type="file" accept="application/pdf" data-file="${i}"></label>
          <button class="adm-btn red" data-act="deldoc" data-i="${i}">Remover documento</button></details>`;
      }).join("");
      return `<h1 class="plain">Documentos</h1><p class="sub">Adicione, edite ou remova documentos da aba «Documentos». Os PDF são gravados em <code>docs/</code> ao publicar.</p>
        <label class="adm-card drop" id="dz"><span class="big">⬆️</span>Arraste PDF para aqui ou clique para escolher<small class="muted">Cada PDF vira um documento novo; depois preencha o título e a descrição.</small><input type="file" accept="application/pdf" multiple data-newdocs></label>
        <div class="adm-card">${rows || "<p class='muted'>Sem documentos.</p>"}<p class="adm-row"><button class="adm-btn sec" data-act="adddoc">+ Documento sem ficheiro</button><button class="adm-btn sec" data-act="syncdocs">↻ Atualizar com os documentos do site</button></p></div>
        <div class="adm-card"><h3>Categorias</h3>${Object.keys(D.docs.categories).filter((k) => k[0] !== "_").map((k) => `<div class="adm-cols" style="align-items:end">${inp("Categoria (PT) — " + esc(k), "docs", `categories.${k}.pt`, D.docs.categories[k].pt)}${inp("(EN)", "docs", `categories.${k}.en`, D.docs.categories[k].en)}</div><p style="margin:-4px 0 10px"><button class="adm-btn sec" data-act="delcat" data-k="${esc(k)}">Remover categoria</button></p>`).join("")}<button class="adm-btn sec" data-act="addcat">+ Nova categoria</button></div>`;
    },
    aparencia() {
      const T = D.site.theme, B = D.site.banner, SE = D.site.seo, def = { brand: "#1f4d3a", brand2: "#2f6f55", accent: "#9bd3a8", bg: "#f4f2ec" };
      const col = (k, l) => `<label>${l}<input type="color" ${bind("site", "theme." + k)} value="${esc(T[k] || def[k])}" style="height:44px;padding:3px"></label>`;
      const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? "selected" : ""}>${l}</option>`;
      return `<h1 class="plain">Aparência e aviso</h1><p class="sub">Cores, cantos, animações, aviso no topo e título do site.</p>
        <div class="adm-card"><h3>Cores e estilo</h3><div class="adm-grid">${col("brand", "Cor principal")}${col("brand2", "Cor secundária")}${col("accent", "Cor de destaque")}${col("bg", "Fundo da página")}</div>
        <div class="adm-cols">${inp("Arredondamento dos cantos (px, 6 a 30)", "site", "theme.radius", T.radius || 18, "number")}<div class="adm-switch" style="border:0;margin-top:22px"><input type="checkbox" id="mo" ${bind("site", "theme.motion")} ${T.motion !== false ? "checked" : ""}><label for="mo">Animações ligadas</label></div></div>
        <button class="adm-btn sec" data-act="resettheme">Repor cores originais</button></div>
        <div class="adm-card"><h3>Aviso no topo do site</h3><div class="adm-switch"><input type="checkbox" id="bn" ${bind("site", "banner.on")} ${B.on ? "checked" : ""}><label for="bn">Mostrar aviso</label></div>
        <div class="adm-cols">${inp("Texto (PT)", "site", "banner.text.pt", B.text && B.text.pt)}${inp("Texto (EN)", "site", "banner.text.en", B.text && B.text.en)}</div>
        <div class="adm-cols">${inp("Ligação (opcional)", "site", "banner.url", B.url)}<label>Tipo<select ${bind("site", "banner.tone")}>${opt("info", "Informação (verde)", B.tone || "info")}${opt("warn", "Atenção (amarelo)", B.tone)}${opt("alert", "Alerta (vermelho)", B.tone)}</select></label></div>
        <div class="adm-cols">${inp("Texto da ligação (PT)", "site", "banner.linkLabel.pt", B.linkLabel && B.linkLabel.pt)}${inp("Texto da ligação (EN)", "site", "banner.linkLabel.en", B.linkLabel && B.linkLabel.en)}</div></div>
        <div class="adm-card"><h3>Título e descrição (separador do navegador e Google)</h3>
        <div class="adm-cols">${inp("Título (PT)", "site", "seo.title.pt", SE.title && SE.title.pt)}${inp("Título (EN)", "site", "seo.title.en", SE.title && SE.title.en)}</div>
        <div class="adm-cols">${area("Descrição (PT)", "site", "seo.description.pt", SE.description && SE.description.pt, 3)}${area("Descrição (EN)", "site", "seo.description.en", SE.description && SE.description.en, 3)}</div></div>`;
    },
    indicadores() {
      const O = window.LRI_CATALOG_ORIG, K = D.site.catalog, gv = (grp, id, f, orig) => (K[grp][id] && K[grp][id][f]) || orig;
      if (!O) return "<p class='adm-msg err'>Catálogo não encontrado.</p>";
      const pill = O.PILLARS.map((p) => `<div class="adm-cols">${inp(`Pilar «${esc(p.pt)}» (PT)`, "site", `catalog.p.${p.id}.pt`, gv("p", p.id, "pt", p.pt))}${inp("(EN)", "site", `catalog.p.${p.id}.en`, gv("p", p.id, "en", p.en))}</div>`).join("");
      const inds = O.IND.map((i) => `<details class="adm-doc"><summary>${i.n}. ${esc(gv("i", i.n, "pt", i.pt))}</summary>
        <div class="adm-cols">${inp("Indicador (PT)", "site", `catalog.i.${i.n}.pt`, gv("i", i.n, "pt", i.pt))}${inp("Indicator (EN)", "site", `catalog.i.${i.n}.en`, gv("i", i.n, "en", i.en))}</div>
        ${i.subs.map((s) => `<div class="adm-cols">${inp(`Sub-indicador ${esc(s.id)} (PT)`, "site", `catalog.s.${s.id}.pt`, gv("s", s.id, "pt", s.pt))}${inp("(EN)", "site", `catalog.s.${s.id}.en`, gv("s", s.id, "en", s.en))}</div>`).join("")}</details>`).join("");
      return `<h1 class="plain">Indicadores</h1><p class="sub">Mude os nomes dos pilares, indicadores e sub-indicadores (aparecem no Dashboard, gráficos e relatórios). As regras de classificação e as fórmulas não mudam aqui.</p>
        <div class="adm-card"><h3>Pilares</h3>${pill}</div><div class="adm-card"><h3>Indicadores e sub-indicadores</h3>${inds}</div>`;
    },
    ligacoes() {
      const C = D.site.config, O = window.LRI_CONFIG_ORIG || {};
      const f = (k, l, ph) => `<label>${l}<input type="text" ${bind("site", "config." + k)} value="${esc(C[k] || "")}" placeholder="${esc(String(O[k] || ph || "")).slice(0, 110)}"></label>`;
      return `<h1 class="plain">Ligações de dados</h1><p class="sub">Endereços do Feature Service e do Survey123. O que deixar vazio usa o valor original do ficheiro <code>js/config.js</code>.</p>
        <div class="adm-card">${f("featureService", "Feature Service (URL da camada)")}<div class="adm-cols">${f("layerId", "Número da camada (layerId)", "0")}${f("pageSize", "Registos por página", "1000")}</div>
        ${f("surveyUrl", "Survey123 — formulário (aba Técnica)")}${f("fieldAppUrl", "Survey123 — aplicação de campo")}${f("experienceUrl", "Experience Builder — validação (aba Técnica)")}${f("tableUrl", "Tabela de dados (ArcGIS Online)")}
        <p class="adm-msg info">Um endereço errado deixa o Dashboard sem dados. Para voltar ao original, apague o campo. O Dashboard precisa de dados públicos.</p></div>`;
    },
    contacto() {
      const C = D.site.contact, fl = (k, l, ph) => inp(l, "site", "contact." + k, C[k] || "").replace("<input", `<input placeholder="${ph}"`);
      return `<h1 class="plain">Contacto</h1><p class="sub">Aparece na aba Contacto e recebe as mensagens do formulário.</p>
        <div class="adm-card">${inp("Email de contacto", "site", "contact.email", C.email, "email")}
        <div class="adm-cols">${inp("Localização (PT)", "site", "contact.location.pt", C.location && C.location.pt)}${inp("Localização (EN)", "site", "contact.location.en", C.location && C.location.en)}</div>
        <div class="adm-cols">${area("Apresentação (PT)", "site", "contact.tagline.pt", C.tagline && C.tagline.pt, 3)}${area("Apresentação (EN)", "site", "contact.tagline.en", C.tagline && C.tagline.en, 3)}</div></div>
        <div class="adm-card"><h3>Outros contactos (opcional)</h3><div class="adm-cols">${fl("phone", "Telefone", "+258 84 000 0000")}${fl("website", "Website", "www.exemplo.org")}${fl("whatsapp", "WhatsApp (número)", "258840000000")}${fl("linkedin", "LinkedIn (endereço)", "https://linkedin.com/…")}</div>${fl("facebook", "Facebook (endereço)", "https://facebook.com/…")}</div>`;
    },
    publicar() {
      const items = [];
      const bo = baseObjs();
      if (sig(D.site) !== sig(bo[0])) items.push("data/site.js (definições, textos, páginas, blocos)");
      if (sig(D.docs) !== sig(bo[1])) items.push("data/documents.js (lista de documentos)");
      pendingFiles().forEach((f) => items.push(f + (/\.pdf$/i.test(f) ? " (PDF)" : " (imagem)")));
      const g = GH();
      return `<h1 class="plain">Publicar</h1><p class="sub">Grava as alterações no GitHub num único commit.</p>
        <div class="adm-card"><h3>Alterações</h3>${dirty() ? `<ul class="adm-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="muted">Não há alterações por publicar.</p>`}
        <label style="margin-top:12px">Mensagem do commit<input type="text" id="commit-msg" value="Gestão do site: atualização de conteúdos"></label>
        <div class="adm-row"><button class="adm-btn" data-act="publish" ${dirty() && g.token ? "" : "disabled"}>Publicar alterações</button>
          <button class="adm-btn sec" data-act="preview">Pré-visualizar</button>
          <button class="adm-btn sec" data-act="discard" ${dirty() ? "" : "disabled"}>Descartar rascunho</button></div>
        ${g.token ? "" : `<p class="adm-msg info">Falta ligar o GitHub (menu «Ligação GitHub»).</p>`}</div>
        <div class="adm-card"><h3>Cópia de segurança</h3><p class="muted small">Guarde as definições do site num ficheiro, ou reponha uma cópia anterior (não inclui PDF nem fotografias).</p>
        <div class="adm-row"><button class="adm-btn sec" data-act="export">Descarregar cópia (.json)</button><label class="adm-btn sec" style="margin:0;cursor:pointer">Repor de uma cópia<input type="file" accept="application/json,.json" hidden data-import></label></div></div>`;
    },
    github() {
      const g = GH();
      return `<h1 class="plain">Ligação GitHub</h1><p class="sub">Necessária só para publicar. Os dados ficam apenas neste navegador.</p>
        <div class="adm-card"><div class="adm-cols">${`<label>Utilizador ou organização<input type="text" id="gh-owner" value="${esc(g.owner)}" placeholder="ex.: minha-conta"></label>`}
        <label>Repositório<input type="text" id="gh-repo" value="${esc(g.repo)}" placeholder="ex.: mrv_lri"></label></div>
        <div class="adm-cols"><label>Ramo (branch)<input type="text" id="gh-branch" value="${esc(g.branch || "main")}"></label>
        <label>Token de acesso pessoal<input type="password" id="gh-token" value="${esc(g.token)}" placeholder="github_pat_…" autocomplete="off"></label></div>
        <div class="adm-row"><button class="adm-btn" data-act="ghsave">Guardar e testar</button><button class="adm-btn sec" data-act="ghclear">Apagar token deste navegador</button></div>
        <p class="muted small" style="margin-top:12px">Crie um token «fine-grained» em GitHub → Settings → Developer settings, limitado a este repositório, com permissão <b>Contents: Read and write</b>. Quem não tiver o token não consegue publicar.</p></div>`;
    },
  };

  function render(section) {
    if (window.__admNotice) { msg = { k: "info", t: window.__admNotice }; window.__admNotice = null; }
    cur = views[section] ? section : "resumo";
    const nav = SECTIONS.map(([k, l, ic]) => `<a href="#gestao/${k}" ${k === cur ? 'aria-current="page"' : ""}><span class="i">${ic}</span>${l}${k === "publicar" && dirty() ? '<span class="adm-badge">●</span>' : ""}</a>`).join("");
    root.innerHTML = `<div class="adm"><aside class="adm-side"><div class="adm-brand"><div class="row"><img class="m" src="assets/logo-moz.svg" alt=""><span class="sep"></span><img class="s" src="assets/logo-sustain.png" alt=""></div><b>Gestão do site</b><small>LRI · MRV</small></div>${nav}<div class="adm-sp"></div>
      <button data-act="preview"><span class="i">👁️</span>Pré-visualizar</button><a href="#sobre"><span class="i">↩️</span>Sair para o site</a></aside>
      <main class="adm-main"><div id="adm-msg">${msg ? `<div class="adm-msg ${msg.k}">${esc(msg.t)}</div>` : ""}</div>${views[cur]()}</main></div>`;
    msg = null;
  }
  const say = (k, t) => { const el = document.getElementById("adm-msg"); if (el) el.innerHTML = `<div class="adm-msg ${k}">${esc(t)}</div>`; };

  // ---- eventos
  function onInput(e) {
    const el = e.target;
    if (el.id === "txt-q") { textQ = el.value.trim(); const ks = textQ ? Object.keys(window.I18N.base.pt).filter((k) => { const q = textQ.toLowerCase(); return k.toLowerCase().includes(q) || String(window.I18N.base.pt[k]).toLowerCase().includes(q) || String(window.I18N.base.en[k] || "").toLowerCase().includes(q); }) : TEXTS.map((x) => x[0]); document.getElementById("txt-list").innerHTML = textRows(ks); return; }
    if (el.id === "blk-filter") { blkFilter = el.value; render("graficos"); return; }
    if (el.id === "blk-new") { if (!el.value) return; D.site.blocks.custom.push(blockTemplate(el.value, blkFilter === "*" ? "dashboard" : blkFilter)); save(); render("graficos"); return; }
    if (el.getAttribute && el.getAttribute("data-hid")) { const id = el.getAttribute("data-hid"), h = D.site.blocks.hidden, k = h.indexOf(id); if (el.checked && k >= 0) h.splice(k, 1); if (!el.checked && k < 0) h.push(id); save(); return; }
    const b = el.getAttribute && el.getAttribute("data-b");
    if (!b) return;
    const [store, path] = [b.slice(0, b.indexOf(":")), b.slice(b.indexOf(":") + 1)];
    if (el.type === "number" && el.value === "") return;
    setPath(store === "site" ? D.site : D.docs, path, el.type === "checkbox" ? el.checked : el.value);
    save();
    if (el.getAttribute("data-rr") && e.type === "change") { render(cur); return; }
    const badge = root.querySelector('a[href="#gestao/publicar"]');
    if (badge) badge.innerHTML = '<span class="i">🚀</span>Publicar' + (dirty() ? '<span class="adm-badge">●</span>' : "");
  }
  root.addEventListener("input", onInput); root.addEventListener("change", onInput);
  async function storePdf(f) {
    const name = "docs/" + slug(f.name.replace(/\.pdf$/i, "")) + ".pdf";
    await fPut(name, f); D.files[name] = { size: f.size };
    return { name, size: (f.size / 1048576).toFixed(1).replace(".", ",") + " MB" };
  }
  async function newDocs(files) {
    const pdfs = Array.from(files).filter((f) => /\.pdf$/i.test(f.name));
    if (!pdfs.length) { say("err", "Só são aceites ficheiros PDF."); return; }
    for (const f of pdfs) {
      const r = await storePdf(f), base = f.name.replace(/\.pdf$/i, "");
      D.docs.documents.unshift({ id: slug(base), file: r.name, thumb: "", category: Object.keys(D.docs.categories || {}).filter((k) => k[0] !== "_").pop() || "outro", title: { pt: base.replace(/[_-]+/g, " "), en: base.replace(/[_-]+/g, " ") }, description: { pt: "", en: "" }, authors: "", publisher: "", year: String(new Date().getFullYear()), language: "PT", pages: "", size: r.size, license: "", _new: true });
    }
    save(); msg = { k: "ok", t: `${pdfs.length} documento(s) adicionado(s). Preencha o título e a descrição e publique.` }; render("documentos");
  }
  root.addEventListener("change", async (e) => {
    const el = e.target; if (!el.hasAttribute) return;
    if (el.hasAttribute("data-newdocs") && el.files.length) { await newDocs(el.files); return; }
    if (el.hasAttribute("data-blkimg") && el.files[0]) { const [i, f] = el.getAttribute("data-blkimg").split(":"); try { D.site.blocks.custom[+i][f] = await storeImg(el.files[0], 1600); save(); render("graficos"); say("ok", "Imagem preparada; será gravada ao publicar."); } catch (er) { say("err", er.message); } return; }
    if (el.hasAttribute("data-thumb") && el.files[0]) { try { D.docs.documents[+el.getAttribute("data-thumb")].thumb = await storeImg(el.files[0], 600); save(); render("documentos"); say("ok", "Miniatura preparada."); } catch (er) { say("err", er.message); } return; }
    if (el.hasAttribute("data-import") && el.files[0]) { try { const j = JSON.parse(await el.files[0].text()); if (!j.site || !j.docs) throw new Error("Ficheiro não reconhecido."); if (confirm("Substituir o rascunho atual por esta cópia?")) { D.site = j.site; D.docs = j.docs; normalize(D.site, D.docs); save(); render("publicar"); say("ok", "Cópia reposta (por publicar)."); } } catch (er) { say("err", "Cópia inválida: " + er.message); } return; }
    if (el.hasAttribute("data-img") && el.files[0]) { try { D.site.images[el.getAttribute("data-img")] = await storeImg(el.files[0], 1800); save(); render("imagens"); say("ok", "Imagem preparada; será gravada ao publicar."); } catch (er) { say("err", er.message); } return; }
    if (el.hasAttribute("data-newimgs") && el.files.length) { try { for (const f of Array.from(el.files)) { const n = await storeImg(f, 1200); D.site.images.gallery.push({ src: n, caption: { pt: "", en: "" } }); } save(); render("imagens"); say("ok", "Fotografias adicionadas. Escreva as legendas e publique."); } catch (er) { say("err", er.message); } return; }
    if (!el.hasAttribute("data-file") || !el.files[0]) return;
    const f = el.files[0], i = +el.getAttribute("data-file"), d = D.docs.documents[i];
    if (!/\.pdf$/i.test(f.name)) { say("err", "Só são aceites ficheiros PDF."); return; }
    const r = await storePdf(f); d.file = r.name; d.size = r.size;
    if (!d.id) d.id = slug(f.name.replace(/\.pdf$/i, ""));
    save(); render(cur); say("ok", `Ficheiro «${f.name}» preparado (será gravado em ${r.name} ao publicar).`);
  });
  root.addEventListener("dragover", (e) => { const z = e.target.closest("#dz, #dzi"); if (z) { e.preventDefault(); z.classList.add("over"); } });
  root.addEventListener("dragleave", (e) => { const z = e.target.closest("#dz, #dzi"); if (z) z.classList.remove("over"); });
  root.addEventListener("drop", async (e) => { const z = e.target.closest("#dzi"); if (z) { e.preventDefault(); const fs = Array.from(e.dataTransfer.files).filter((f) => /^image\//.test(f.type)); for (const f of fs) { const n = await storeImg(f, 1200); D.site.images.gallery.push({ src: n, caption: { pt: "", en: "" } }); } save(); render("imagens"); } });
  root.addEventListener("drop", (e) => { const z = e.target.closest("#dz"); if (z) { e.preventDefault(); newDocs(e.dataTransfer.files); } });
  root.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.getAttribute("data-act");
    if (a === "adddoc") { D.docs.documents.push({ id: "doc-" + Date.now().toString(36), file: "", thumb: "", category: Object.keys(D.docs.categories || {}).filter((k) => k[0] !== "_")[0] || "outro", title: { pt: "", en: "" }, description: { pt: "", en: "" }, authors: "", publisher: "", year: String(new Date().getFullYear()), language: "PT", pages: "", size: "", license: "", _new: true }); save(); render("documentos"); }
    else if (a === "syncdocs") { const n = mergePublished(); normalize(D.site, D.docs); save(); render("documentos"); say(n ? "ok" : "info", n ? `${n} documento(s) do site acrescentado(s) à lista.` : "A lista já está atualizada com o site."); }
    else if (a === "mv") { const ks = menuItems().map((x) => x.key), k = b.getAttribute("data-k"), i = ks.indexOf(k), j = i + +b.getAttribute("data-d"); if (j >= 0 && j < ks.length) { ks.splice(j, 0, ks.splice(i, 1)[0]); D.site.menu.order = ks; save(); render("paginas"); } }
    else if (a === "addpage") { let n = D.site.pages.length + 1, id; do { id = "pagina-" + n++; } while (D.site.pages.some((p) => p.id === id)); D.site.pages.push({ id, title: { pt: "Nova página", en: "New page" }, visible: true, menu: true, _new: true }); save(); render("paginas"); }
    else if (a === "delpage") { const i = +b.getAttribute("data-i"), id = "p:" + D.site.pages[i].id; if (confirm("Remover esta página e os seus blocos?")) { D.site.pages.splice(i, 1); D.site.blocks.custom = D.site.blocks.custom.filter((x) => x.page !== id); save(); render("paginas"); } }
    else if (a === "editpage") { blkFilter = b.getAttribute("data-p"); location.hash = "#gestao/graficos"; }
    else if (a === "addlink") { D.site.links.push({ label: { pt: "Nova ligação", en: "New link" }, url: "https://" }); save(); render("paginas"); }
    else if (a === "dellink") { D.site.links.splice(+b.getAttribute("data-i"), 1); save(); render("paginas"); }
    else if (a === "mvblk") { const L = D.site.blocks.custom, i = +b.getAttribute("data-i"), d = +b.getAttribute("data-d"), pg = L[i].page; let j = i + d; while (j >= 0 && j < L.length && L[j].page !== pg) j += d; if (j >= 0 && j < L.length) { const t = L[i]; L[i] = L[j]; L[j] = t; save(); render("graficos"); } }
    else if (a === "dupblk") { const L = D.site.blocks.custom, c = clone(L[+b.getAttribute("data-i")]); c.id = "b" + Date.now().toString(36); c._new = true; L.splice(+b.getAttribute("data-i") + 1, 0, c); save(); render("graficos"); }
    else if (a === "clearimg") { D.site.blocks.custom[+b.getAttribute("data-i")][b.getAttribute("data-f")] = ""; save(); render("graficos"); }
    else if (a === "resettheme") { D.site.theme = {}; save(); render("aparencia"); }
    else if (a === "addcat") { const k = "cat" + Date.now().toString(36); D.docs.categories[k] = { pt: "Nova categoria", en: "New category" }; save(); render("documentos"); }
    else if (a === "delcat") { const k = b.getAttribute("data-k"); if (D.docs.documents.some((d) => d.category === k)) { say("err", "Há documentos nesta categoria. Mude-os primeiro."); } else { delete D.docs.categories[k]; save(); render("documentos"); } }
    else if (a === "export") { const bl = new Blob([JSON.stringify({ site: D.site, docs: D.docs }, null, 2)], { type: "application/json" }), u = document.createElement("a"); u.href = URL.createObjectURL(bl); u.download = "lri-gestao-copia-" + new Date().toISOString().slice(0, 10) + ".json"; u.click(); setTimeout(() => URL.revokeObjectURL(u.href), 500); }
    else if (a === "addblk") { D.site.blocks.custom.push({ id: "b" + Date.now().toString(36), kind: "chart", type: "bar", page: "dashboard", source: "manual", visible: true, title: { pt: "", en: "" }, note: { pt: "", en: "" }, data: "Exemplo A;10\nExemplo B;20\nExemplo C;15", _new: true }); save(); render("graficos"); }
    else if (a === "delimg") { D.site.images.gallery.splice(+b.getAttribute("data-i"), 1); save(); render("imagens"); }
    else if (a === "delblk") { if (confirm("Remover este bloco?")) { D.site.blocks.custom.splice(+b.getAttribute("data-i"), 1); save(); render("graficos"); } }
    else if (a === "deldoc") { if (confirm("Remover este documento da lista?")) { D.docs.documents.splice(+b.getAttribute("data-i"), 1); save(); render("documentos"); } }
    else if (a === "preview") { save(); window.open(location.pathname + "?preview=1#sobre", "_blank"); }
    else if (a === "discard") { if (confirm("Descartar todas as alterações por publicar?")) { for (const k of Object.keys(D.files)) await fDel(k); const bp = baseParts(); D = { site: JSON.parse(bp[0]), docs: JSON.parse(bp[1]), files: {} }; save(); render("publicar"); say("ok", "Rascunho descartado."); } }
    else if (a === "ghsave") { const g = { owner: val("gh-owner"), repo: val("gh-repo"), branch: val("gh-branch") || "main", token: val("gh-token") }; ls.set(K_GH, g); say("info", "A testar a ligação…"); try { const r = await api(g, "GET", ""); say(r.permissions && r.permissions.push ? "ok" : "err", r.permissions && r.permissions.push ? `Ligação correta a ${r.full_name} (com permissão de escrita).` : "Ligação feita, mas o token não tem permissão de escrita."); } catch (er) { say("err", er.message); } }
    else if (a === "ghclear") { const g = GH(); g.token = ""; ls.set(K_GH, g); render("github"); say("ok", "Token apagado deste navegador."); }
    else if (a === "publish") { b.disabled = true; try { await publish(); } catch (er) { say("err", "Falhou a publicação: " + er.message); b.disabled = false; } }
  });
  const val = (id) => (document.getElementById(id).value || "").trim();

  // ---- GitHub (Git Data API)
  async function api(g, method, path, body) {
    if (!g.owner || !g.repo || !g.token) throw new Error("Preencha utilizador, repositório e token.");
    const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}${path}`, {
      method, headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + g.token, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status === 401 ? "Token inválido ou expirado." : r.status === 404 ? "Repositório não encontrado (ou o token não tem acesso)." : (j.message || "Erro " + r.status));
    return j;
  }
  const b64 = (blob) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); });
  async function publish() {
    const g = GH(), br = encodeURIComponent(g.branch || "main");
    say("info", "A publicar…");
    const files = [];
    const site = clone(D.site); site.blocks.custom.forEach((x) => delete x._new); site.pages.forEach((x) => delete x._new);
    files.push({ path: "data/site.js", content: "/* Definições do site editáveis em «Gestão do site» (#gestao). Este ficheiro é reescrito ao publicar. */\nwindow.LRI_SITE = " + JSON.stringify(site, null, 2) + ";\n", enc: "utf-8" });
    const docs = clone(D.docs); docs.documents.forEach((d) => delete d._new);
    files.push({ path: "data/documents.js", content: "/* Lista de documentos da aba \"Documentos\" — editável em «Gestão do site» ou à mão. */\nwindow.LRI_DOCUMENTS = " + JSON.stringify(docs, null, 2) + ";\n", enc: "utf-8" });
    for (const p of pendingFiles()) { const bl = await fGet(p); if (bl) files.push({ path: p, content: await b64(bl), enc: "base64" }); }
    const ref = await api(g, "GET", `/git/ref/heads/${br}`);
    const head = await api(g, "GET", `/git/commits/${ref.object.sha}`);
    const tree = [];
    for (const f of files) { const bl = await api(g, "POST", "/git/blobs", { content: f.content, encoding: f.enc }); tree.push({ path: f.path, mode: "100644", type: "blob", sha: bl.sha }); }
    const nt = await api(g, "POST", "/git/trees", { base_tree: head.tree.sha, tree });
    const c = await api(g, "POST", "/git/commits", { message: (document.getElementById("commit-msg") || {}).value || "Gestão do site", tree: nt.sha, parents: [ref.object.sha] });
    await api(g, "PATCH", `/git/refs/heads/${br}`, { sha: c.sha });
    for (const p of pendingFiles()) await fDel(p);
    D.files = {}; D.docs = docs; save(); ls.set(K_BASE, { parts: [JSON.stringify(D.site), JSON.stringify(D.docs)], pub: pubSig });
    msg = { k: "ok", t: `Publicado (commit ${c.sha.slice(0, 7)}). O site atualiza em cerca de 1 minuto.` };
    render("publicar");
  }

  window.LRI_ADMIN = { render };
})();
