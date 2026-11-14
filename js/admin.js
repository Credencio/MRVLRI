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
  const save = () => ls.set(K_DRAFT, D);
  const GH = () => ls.get(K_GH) || { owner: "", repo: "", branch: "main", token: "" };
  const baseParts = () => ls.get(K_BASE) || [JSON.stringify(PUB.site), JSON.stringify(PUB.docs)];
  const baseSnap = () => JSON.stringify([JSON.parse(baseParts()[0]), JSON.parse(baseParts()[1])]);
  const snap = () => JSON.stringify([D.site, D.docs]);
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
    t[last] = v;
  }
  const bind = (store, path) => `data-b="${store}:${path}"`;
  const inp = (label, store, path, val, type) => `<label>${label}<input type="${type || "text"}" ${bind(store, path)} value="${esc(val)}"></label>`;
  const area = (label, store, path, val, rows) => `<label>${label}<textarea rows="${rows || 4}" ${bind(store, path)}>${esc(val)}</textarea></label>`;
  const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ---- secções
  const SECTIONS = [["resumo", "Início", "🏠"], ["textos", "Textos", "✏️"], ["abas", "Abas e menu", "🧭"], ["graficos", "Gráficos e tabelas", "📊"], ["imagens", "Imagens", "🖼️"], ["documentos", "Documentos", "📄"], ["contacto", "Contacto", "✉️"], ["publicar", "Publicar", "🚀"], ["github", "Ligação GitHub", "🔑"]];
  let cur = "resumo", msg = null;

  const views = {
    resumo() {
      const g = GH(), n = D.docs.documents.length, nb = D.site.blocks.custom.length;
      const tile = (k, ic, t, d) => `<a class="adm-tile" href="#gestao/${k}"><div class="ic">${ic}</div><b>${t}</b><span>${d}</span></a>`;
      return `<div class="adm-hero"><h1>Olá! Bem-vindo à gestão do portal</h1><p>Aqui pode mudar textos, mostrar ou esconder gráficos, criar novas tabelas e carregar documentos — sem programar.</p></div>
        <div class="adm-steps"><div class="adm-step"><b class="n">1</b><div><b>Edite</b><br><small class="muted">textos, gráficos, documentos</small></div></div>
          <div class="adm-step"><b class="n">2</b><div><b>Pré-visualize</b><br><small class="muted">veja antes de publicar</small></div></div>
          <div class="adm-step"><b class="n">3</b><div><b>Publique</b><br><small class="muted">um clique e o site atualiza</small></div></div></div>
        <div class="adm-tiles">${tile("textos", "✏️", "Textos", "PT e EN, em todo o site")}${tile("graficos", "📊", "Gráficos e tabelas", `${nb} criado(s) · esconder os existentes`)}${tile("imagens", "🖼️", "Imagens", "fundos e galeria de fotos")}${tile("documentos", "📄", "Documentos", `${n} na biblioteca · arraste um PDF`)}${tile("contacto", "✉️", "Contacto", "email, localização, apresentação")}</div>
        <div class="adm-grid"><div class="adm-stat"><b>${dirty() ? "Sim" : "Não"}</b><span>Alterações por publicar</span></div>
          <div class="adm-stat"><b>${g.token ? "Ligado" : "Por ligar"}</b><span>GitHub ${g.owner ? esc(g.owner + "/" + g.repo) : ""}</span></div></div>
        ${g.token ? "" : `<p class="adm-msg info">Para publicar, ligue primeiro o GitHub em «Ligação GitHub».</p>`}`;
    },
    graficos() {
      const hid = D.site.blocks.hidden, B = window.LRI_BUILTIN || [];
      const rows = B.map(([id, l]) => `<div class="adm-switch"><input type="checkbox" id="vis-${id}" data-hid="${id}" ${hid.indexOf(id) < 0 ? "checked" : ""}><label for="vis-${id}">${esc(l)}</label></div>`).join("");
      const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? "selected" : ""}>${l}</option>`;
      const list = D.site.blocks.custom.map((b, i) => {
        const p = `blocks.custom.${i}`, rr = ' data-rr="1"';
        return `<details class="adm-doc" ${b._new ? "open" : ""}><summary>${b.kind === "table" ? "📋" : "📈"} ${esc((b.title && b.title.pt) || "Novo bloco")}</summary>
          <div class="adm-cols"><label>Tipo<select ${bind("site", p + ".kind")}${rr}>${opt("chart", "Gráfico", b.kind)}${opt("table", "Tabela", b.kind)}</select></label>
          <label>Onde aparece<select ${bind("site", p + ".page")}>${opt("dashboard", "No Dashboard", b.page || "dashboard")}${opt("sobre", "Na aba Sobre o LRI", b.page)}</select></label></div>
          ${b.kind === "table" ? "" : `<label>Forma do gráfico<select ${bind("site", p + ".type")}>${opt("bar", "Barras", b.type || "bar")}${opt("hbar", "Barras horizontais", b.type)}${opt("line", "Linhas", b.type)}${opt("pie", "Circular", b.type)}${opt("doughnut", "Rosca", b.type)}</select></label>`}
          <div class="adm-cols">${inp("Título (PT)", "site", p + ".title.pt", b.title && b.title.pt)}${inp("Título (EN)", "site", p + ".title.en", b.title && b.title.en)}</div>
          <div class="adm-cols">${inp("Nota (PT, opcional)", "site", p + ".note.pt", b.note && b.note.pt)}${inp("Nota (EN, opcional)", "site", p + ".note.en", b.note && b.note.en)}</div>
          <label>De onde vêm os dados<select ${bind("site", p + ".source")}${rr}>${opt("manual", "Escrevo os dados aqui", b.source || "manual")}${opt("data", "Dados da plataforma (registos validados)", b.source)}</select></label>
          ${b.source === "data" ? `<div class="adm-cols"><label>Agrupar por<select ${bind("site", p + ".group")}>${[["district", "Distrito"], ["institution", "Instituição"], ["year", "Ano"], ["province", "Província"], ["indicatorRaw", "Indicador"]].map(([v, l]) => opt(v, l, b.group || "district")).join("")}</select></label>
            <label>Medida<select ${bind("site", p + ".measure")}>${opt("count", "Número de registos", b.measure || "count")}${opt("mean", "Valor médio", b.measure)}</select></label></div>`
          : area("Dados — uma linha por item, «Nome;Valor». Para tabelas, a 1.ª linha pode ser o cabeçalho e pode ter mais colunas.", "site", p + ".data", b.data, 6)}
          <label class="adm-switch" style="border:0"><span style="flex:1">Mostrar no site</span><input type="checkbox" ${bind("site", p + ".visible")} ${b.visible !== false ? "checked" : ""}></label>
          <button class="adm-btn red" data-act="delblk" data-i="${i}">Remover</button></details>`;
      }).join("");
      return `<h1 class="plain">Gráficos e tabelas</h1><p class="sub">Escolha o que aparece no portal e crie os seus próprios gráficos e tabelas.</p>
        <div class="adm-card"><h3>Elementos que já existem</h3><p class="muted small">Desligue o que não quer mostrar.</p>${rows}</div>
        <div class="adm-card"><h3>Os meus gráficos e tabelas</h3>${list || "<p class='muted'>Ainda não criou nenhum.</p>"}
        <p><button class="adm-btn" data-act="addblk">+ Novo gráfico ou tabela</button></p></div>`;
    },
    abas() {
      const T = D.site.tabs, row = (k, l) => `<div class="adm-switch"><input type="checkbox" id="tab-${k}" ${bind("site", "tabs." + k)} ${T[k] !== false ? "checked" : ""}><label for="tab-${k}" style="margin:0">${l}</label></div>`;
      return `<h1 class="plain">Abas e menu</h1><p class="sub">Escolha que separadores aparecem no site. «Sobre o LRI» está sempre visível.</p>
        <div class="adm-card">${row("dashboard", "Dashboard")}${row("docs", "Documentos")}${row("tecnica", "Técnica")}
        <p class="muted small">Os nomes dos separadores editam-se em «Textos».</p></div>`;
    },
    textos() {
      const B = window.I18N.base, X = D.site.texts;
      return `<h1 class="plain">Textos</h1><p class="sub">Altere os textos principais em português e inglês. Deixe vazio para voltar ao original.</p>` +
        TEXTS.map(([k, l, ml]) => `<div class="adm-card"><h3>${esc(l)} <small class="muted">(${k})</small></h3><div class="adm-cols">` +
          ["pt", "en"].map((lg) => (ml ? area : inp)(lg.toUpperCase(), "site", `texts.${lg}.${k}`, (X[lg] && X[lg][k]) != null ? X[lg][k] : B[lg][k], ml ? 4 : undefined)).join("") + `</div></div>`).join("");
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
          <label>Ficheiro PDF <small class="muted">${esc(d.file || "—")}${D.files[d.file] ? " · por publicar" : ""}</small><input type="file" accept="application/pdf" data-file="${i}"></label>
          <button class="adm-btn red" data-act="deldoc" data-i="${i}">Remover documento</button></details>`;
      }).join("");
      return `<h1 class="plain">Documentos</h1><p class="sub">Adicione, edite ou remova documentos da aba «Documentos». Os PDF são gravados em <code>docs/</code> ao publicar.</p>
        <label class="adm-card drop" id="dz"><span class="big">⬆️</span>Arraste PDF para aqui ou clique para escolher<small class="muted">Cada PDF vira um documento novo; depois preencha o título e a descrição.</small><input type="file" accept="application/pdf" multiple data-newdocs></label>
        <div class="adm-card">${rows || "<p class='muted'>Sem documentos.</p>"}<p><button class="adm-btn sec" data-act="adddoc">+ Documento sem ficheiro</button></p></div>`;
    },
    contacto() {
      const C = D.site.contact;
      return `<h1 class="plain">Contacto</h1><p class="sub">Aparece no fim da aba «Sobre o LRI» e recebe as sugestões enviadas.</p>
        <div class="adm-card">${inp("Email de contacto", "site", "contact.email", C.email, "email")}
        <div class="adm-cols">${inp("Localização (PT)", "site", "contact.location.pt", C.location && C.location.pt)}${inp("Localização (EN)", "site", "contact.location.en", C.location && C.location.en)}</div>
        <div class="adm-cols">${area("Apresentação (PT)", "site", "contact.tagline.pt", C.tagline && C.tagline.pt, 3)}${area("Apresentação (EN)", "site", "contact.tagline.en", C.tagline && C.tagline.en, 3)}</div></div>`;
    },
    publicar() {
      const items = [];
      const bp = baseParts();
      if (JSON.stringify(D.site) !== JSON.stringify(JSON.parse(bp[0]))) items.push("data/site.js (definições e textos)");
      if (JSON.stringify(D.docs) !== JSON.stringify(JSON.parse(bp[1]))) items.push("data/documents.js (lista de documentos)");
      pendingFiles().forEach((f) => items.push(f + " (PDF)"));
      const g = GH();
      return `<h1 class="plain">Publicar</h1><p class="sub">Grava as alterações no GitHub num único commit.</p>
        <div class="adm-card"><h3>Alterações</h3>${dirty() ? `<ul class="adm-list">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="muted">Não há alterações por publicar.</p>`}
        <label style="margin-top:12px">Mensagem do commit<input type="text" id="commit-msg" value="Gestão do site: atualização de conteúdos"></label>
        <div class="adm-row"><button class="adm-btn" data-act="publish" ${dirty() && g.token ? "" : "disabled"}>Publicar alterações</button>
          <button class="adm-btn sec" data-act="preview">Pré-visualizar</button>
          <button class="adm-btn sec" data-act="discard" ${dirty() ? "" : "disabled"}>Descartar rascunho</button></div>
        ${g.token ? "" : `<p class="adm-msg info">Falta ligar o GitHub (menu «Ligação GitHub»).</p>`}</div>`;
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
    if (el.getAttribute && el.getAttribute("data-hid")) { const id = el.getAttribute("data-hid"), h = D.site.blocks.hidden, k = h.indexOf(id); if (el.checked && k >= 0) h.splice(k, 1); if (!el.checked && k < 0) h.push(id); save(); return; }
    const b = el.getAttribute && el.getAttribute("data-b");
    if (!b) return;
    const [store, path] = [b.slice(0, b.indexOf(":")), b.slice(b.indexOf(":") + 1)];
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
    const site = clone(D.site); site.blocks.custom.forEach((x) => delete x._new);
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
    D.files = {}; D.docs = docs; save(); ls.set(K_BASE, [JSON.stringify(D.site), JSON.stringify(D.docs)]);
    msg = { k: "ok", t: `Publicado (commit ${c.sha.slice(0, 7)}). O site atualiza em cerca de 1 minuto.` };
    render("publicar");
  }

  window.LRI_ADMIN = { render };
})();
