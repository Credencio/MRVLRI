/* Arranque: roteamento (#sobre (inicial) · #dashboard · #tecnica/submissao · #tecnica/validacao), idioma, carregamento de dados */
(function () {
  const CFG = window.LRI_CONFIG, I = window.I18N, t = I.t, $ = (id) => document.getElementById(id);
  let loaded = false, loading = false, lastUpdate = null, isDemo = false;

  // ---- idioma
  document.querySelectorAll("[data-lang]").forEach((b) => (b.onclick = () => I.set(b.getAttribute("data-lang"))));
  window.addEventListener("lri-lang", () => { showUpdated(); renderCounts(); });

  // ---- links dos iframes (vêm de config.js)
  $("open-survey").href = CFG.surveyUrl;
  $("open-exp").href = CFG.experienceUrl;
  // aplicação de campo Survey123 (abre a app instalada no telemóvel); pode ser mudado em config.js com fieldAppUrl
  $("open-app").href = CFG.fieldAppUrl || "https://survey123.arcgis.app/?itemID=e582f1eafa404ce8b70e5dbc8ec20e56";
  // submissão em tabela (item ArcGIS Online, área restrita: não pode ser embebido, abre noutra janela)
  $("tab-tabela").href = CFG.tableUrl || "https://fndsmoz.maps.arcgis.com/home/item.html?id=587a6421a972400aa48c88993611042c#overview";
  const frames = { survey: false, exp: false };

  // ---- rotas
  function route() {
    const h = (location.hash || "#sobre").replace(/^#/, "");
    const [path, qs] = h.split("?"); // #dashboard?ano=2025&distrito=Bárue
    let [view, tab] = path.split("/");
    const SITE = window.LRI_SITE || {}, TABS = SITE.tabs || {};
    const admin = view === "gestao";
    document.body.classList.toggle("admin-mode", admin);
    $("view-admin").hidden = !admin;
    if (admin) {
      ["view-dashboard", "view-tecnica", "view-docs", "view-about", "view-contact", "view-page"].forEach((id) => ($(id).hidden = true));
      window.LRI_ADMIN.render(tab); window.scrollTo(0, 0); return;
    }
    // separadores desativados na gestão voltam à página inicial
    if ((view === "dashboard" && TABS.dashboard === false) || (view === "documentos" && TABS.docs === false) || (view === "tecnica" && TABS.tecnica === false)) { location.replace("#sobre"); return; }
    if (view === "contacto" && TABS.contact === false) { location.replace("#sobre"); return; }
    const pg = view === "p" ? (SITE.pages || []).find((x) => x.id === tab && x.visible !== false) : null;
    if (view === "p" && !pg) { location.replace("#sobre"); return; }
    const tech = view === "tecnica", docs = view === "documentos", dash = view === "dashboard", contact = view === "contacto", about = !tech && !docs && !dash && !contact && !pg;
    $("view-page").hidden = !pg;
    if (pg) {
      $("page-title").textContent = (I.lang === "en" ? pg.title.en || pg.title.pt : pg.title.pt || pg.title.en) || "";
      ["view-dashboard", "view-tecnica", "view-docs", "view-about", "view-contact"].forEach((id) => ($(id).hidden = true));
      document.querySelectorAll(".nav a").forEach((a) => a.setAttribute("aria-current", a.dataset.key === "p:" + pg.id ? "page" : "false"));
      if (window.LRI_BLOCKS) window.LRI_BLOCKS.render("p:" + pg.id);
      document.title = ((I.lang === "en" ? pg.title.en : pg.title.pt) || pg.title.pt || "") + " · " + baseTitle;
      window.scrollTo(0, 0); return;
    }
    document.title = baseTitle;
    $("view-dashboard").hidden = !dash; $("view-tecnica").hidden = !tech; $("view-docs").hidden = !docs; $("view-about").hidden = !about; $("view-contact").hidden = !contact;
    $("nav-contact").setAttribute("aria-current", contact ? "page" : "false");
    $("nav-dashboard").setAttribute("aria-current", dash ? "page" : "false");
    $("nav-about").setAttribute("aria-current", about ? "page" : "false");
    $("nav-docs").setAttribute("aria-current", docs ? "page" : "false");
    $("nav-tecnica").setAttribute("aria-current", tech ? "page" : "false");
    if (about || contact) { window.scrollTo(0, 0); return; }
    if (docs) { window.LRI_DOCS.load(); if (tab) window.LRI_DOCS.focus(decodeURIComponent(tab)); else window.scrollTo(0, 0); return; }
    if (tech) {
      const which = tab === "validacao" ? "validacao" : "submissao";
      document.querySelectorAll("[data-tab]").forEach((b) => {
        const on = b.getAttribute("data-tab") === which;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      });
      $("pane-submissao").hidden = which !== "submissao"; $("pane-validacao").hidden = which !== "validacao";
      // o iframe só é carregado quando o separador é aberto
      if (which === "submissao" && !frames.survey) { $("frame-survey").src = CFG.surveyUrl; frames.survey = true; }
      if (which === "validacao" && !frames.exp) { $("frame-exp").src = CFG.experienceUrl; frames.exp = true; }
      loadCounts();
    } else if (!loaded && !loading) load();
    else if (loaded && window.DASH) { if (qs) window.DASH.applyHash(qs); else window.DASH.syncHash(); }
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => (location.hash = "#tecnica/" + b.getAttribute("data-tab"))));
  window.addEventListener("hashchange", route);

  // ---- dados
  function showUpdated() { $("updated").textContent = lastUpdate ? `${t("updated")}: ${lastUpdate.toLocaleString(I.lang === "en" ? "en-GB" : "pt-PT")}` : ""; }
  async function load(force) {
    loading = true;
    $("dash").hidden = true;
    $("state").innerHTML = `<div class="load">${t("loading")}</div>`;
    try {
      const res = await window.LRI_DATA.loadValidated(force === true);
      isDemo = res.demo; loaded = true;
      $("demo-banner").hidden = !isDemo;
      $("state").innerHTML = ""; $("dash").hidden = false;
      lastUpdate = res.at ? new Date(res.at) : new Date(); showUpdated();
      window.DASH.set(res.records);
    } catch (e) {
      console.error(e);
      $("state").innerHTML = `<div class="err"><strong>${t("loadError")}</strong><br><small>${String(e.message || e).replace(/</g, "&lt;")}</small><br><br><button class="btn" id="btn-retry" type="button">${t("retry")}</button></div>`;
      $("btn-retry").onclick = load;
    } finally { loading = false; }
  }
  $("btn-refresh").onclick = () => load(true);

  // ---- contagem por estado (Técnica) — só aparece se a camada expuser todos os estados
  let counts = null;
  function renderCounts() {
    const el = $("status-counts");
    if (!counts) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<strong style="align-self:center">${t("statusCounts")}:</strong><span class="p">${t("pending")}: ${counts.pending}</span><span class="v">${t("validated")}: ${counts.validated}</span><span class="r">${t("rejected")}: ${counts.rejected}</span>`;
  }
  async function loadCounts() { counts = await window.LRI_DATA.loadStatusCounts(); renderCounts(); }

  // ---- separadores visíveis (definido em «Gestão do site»)
  function applyTabs() {
    const T = (window.LRI_SITE && window.LRI_SITE.tabs) || {};
    [["dashboard", "nav-dashboard"], ["docs", "nav-docs"], ["tecnica", "nav-tecnica"], ["contact", "nav-contact"]].forEach(([k, id]) => { $(id).hidden = T[k] === false; });
    document.querySelectorAll("[data-tab-link]").forEach((li) => { li.hidden = T[li.getAttribute("data-tab-link")] === false; });
  }

  // ---- contacto e sugestões (texto vem de data/site.js)
  function renderContact() {
    const C = (window.LRI_SITE && window.LRI_SITE.contact) || {};
    const pick = (o) => (o ? (I.lang === "en" ? o.en || o.pt : o.pt || o.en) : "") || "";
    $("contact-tag").textContent = pick(C.tagline);
    $("contact-loc").textContent = pick(C.location);
    $("contact-mail").textContent = C.email || "";
    const ex = $("contact-extra");
    if (ex) {
      const lab = { phone: t("cxPhone"), website: t("cxWeb"), whatsapp: "WhatsApp", linkedin: "LinkedIn", facebook: "Facebook" };
      const href = { phone: (v) => "tel:" + v.replace(/\s+/g, ""), website: (v) => okUrl(/^https?:/.test(v) ? v : "https://" + v), whatsapp: (v) => "https://wa.me/" + v.replace(/\D/g, ""), linkedin: (v) => okUrl(v), facebook: (v) => okUrl(v) };
      ex.innerHTML = Object.keys(lab).filter((k) => C[k]).map((k) => `<a class="chip" href="${href[k](String(C[k]))}" target="_blank" rel="noopener">${lab[k]}</a>`).join("");
    } const row = $("contact-mail-row"); if (row) row.href = C.email ? "mailto:" + C.email : "#";
    if ($("sug-type")) document.querySelectorAll("#sug-type option").forEach((o) => { o.textContent = t(o.value); });
  }
  $("sug-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const C = (window.LRI_SITE && window.LRI_SITE.contact) || {};
    const msg = $("sug-msg").value.trim();
    if (!msg) { $("sug-msg").focus(); $("sug-note").textContent = t("sugErr"); return; }
    const name = $("sug-name").value.trim();
    const subject = `[LRI] ${t($("sug-type").value)}`;
    const org = $("sug-org").value.trim(), em = $("sug-email").value.trim();
    const body = `${msg}\n\n— ${name || "—"}${org ? " · " + org : ""}${em ? "\n" + em : ""}`;
    $("sug-note").textContent = t("sugNote");
    location.href = `mailto:${C.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  window.addEventListener("lri-lang", renderContact);

  // ---- imagens de fundo e galeria (definidas em «Gestão do site → Imagens»)
  function applyImages() {
    const IM = (window.LRI_SITE && window.LRI_SITE.images) || {}, root = document.documentElement.style;
    const abs = (u) => new URL(u, document.baseURI).href;
    root.setProperty("--hero-img", IM.hero ? `url("${abs(IM.hero)}")` : "none");
    root.setProperty("--contact-img", IM.contact ? `url("${abs(IM.contact)}")` : "none");
    const cr = IM.credit ? `${t("photoBy")}: ${IM.credit}` : "";
    ["hero-credit", "contact-credit"].forEach((id) => { if ($(id)) $(id).textContent = cr; });
    const g = $("gallery-grid"), list = IM.gallery || [];
    $("gallery-h").hidden = !list.length;
    const cap = (c) => (c ? (I.lang === "en" ? c.en || c.pt : c.pt || c.en) : "") || "";
    g.innerHTML = list.map((x, i) => `<figure class="ph" data-i="${i}" tabindex="0"><img src="${x.src}" alt="${cap(x.caption).replace(/"/g, "&quot;")}" loading="lazy"><figcaption>${cap(x.caption)}${cr ? `<small>${cr}</small>` : ""}</figcaption></figure>`).join("");
  }
  document.addEventListener("click", (e) => {
    const f = e.target.closest && e.target.closest(".ph"); if (!f) return;
    const img = f.querySelector("img"), ov = document.createElement("div");
    ov.className = "lightbox"; ov.innerHTML = `<img src="${img.src}" alt=""><p>${f.querySelector("figcaption").innerHTML}</p>`;
    ov.onclick = () => ov.remove(); document.body.appendChild(ov);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const o = document.querySelector(".lightbox"); if (o) o.remove(); } });
  window.addEventListener("lri-lang", applyImages);

  // ---- aparência, menu, título, aviso (definidos em «Gestão do site»)
  const baseTitle = document.title;
  const pick = (o) => (o ? (I.lang === "en" ? o.en || o.pt : o.pt || o.en) : "") || "";
  const okUrl = (u) => (/^(https?:\/\/|mailto:|tel:|#)/i.test(String(u || "").trim()) ? u.trim() : "#");
  function applyTheme() {
    const T = (window.LRI_SITE && window.LRI_SITE.theme) || {}, r = document.documentElement.style;
    [["brand", "--brand"], ["brand2", "--brand2"], ["accent", "--accent"], ["bg", "--bg"]].forEach(([k, v]) => { if (T[k]) r.setProperty(v, T[k]); else r.removeProperty(v); });
    if (T.radius) r.setProperty("--radius", T.radius + "px");
    document.body.classList.toggle("no-motion", T.motion === false);
    if (T.motion === false) document.documentElement.classList.remove("js-motion");
  }
  function applySeo() {
    const S = (window.LRI_SITE && window.LRI_SITE.seo) || {};
    if (pick(S.title)) document.title = pick(S.title);
    const m = document.querySelector('meta[name="description"]');
    if (m && pick(S.description)) m.setAttribute("content", pick(S.description));
  }
  function applyBanner() {
    const B = (window.LRI_SITE && window.LRI_SITE.banner) || {}, el = $("site-banner"), txt = pick(B.text);
    const key = "lri_banner_" + txt;
    if (!B.on || !txt || sessionStorage.getItem(key)) { el.hidden = true; return; }
    el.className = "tone-" + (B.tone || "info");
    el.innerHTML = `<span>${txt.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}${B.url ? ` <a href="${okUrl(B.url)}" ${/^http/.test(B.url) ? 'target="_blank" rel="noopener"' : ""}>${pick(B.linkLabel) || "→"}</a>` : ""}</span><button type="button" aria-label="×">×</button>`;
    el.querySelector("button").onclick = () => { sessionStorage.setItem(key, "1"); el.hidden = true; };
    el.hidden = false;
  }
  // menu: ordem, páginas novas e ligações externas
  function applyMenu() {
    const S = window.LRI_SITE || {}, nav = document.querySelector(".nav");
    nav.querySelectorAll(".nav-extra").forEach((a) => a.remove());
    const fixed = { about: "nav-about", dashboard: "nav-dashboard", docs: "nav-docs", tecnica: "nav-tecnica", contact: "nav-contact" };
    Object.keys(fixed).forEach((k) => { $(fixed[k]).dataset.key = k; });
    (S.pages || []).filter((p) => p.visible !== false && p.menu !== false).forEach((p) => {
      const a = document.createElement("a"); a.className = "nav-extra"; a.href = "#p/" + p.id; a.dataset.key = "p:" + p.id; a.textContent = pick(p.title); nav.appendChild(a);
    });
    (S.links || []).forEach((l, i) => {
      const a = document.createElement("a"); a.className = "nav-extra"; a.href = okUrl(l.url); a.dataset.key = "l:" + i; a.textContent = pick(l.label); a.target = "_blank"; a.rel = "noopener"; nav.appendChild(a);
    });
    const order = (S.menu && S.menu.order) || [], keys = [...nav.querySelectorAll("a")].map((a) => a.dataset.key);
    keys.forEach((k, i) => { const j = order.indexOf(k); nav.querySelector(`[data-key="${k}"]`).style.order = j >= 0 ? j : 50 + i; });
  }
  window.addEventListener("lri-lang", () => { applyMenu(); applyBanner(); applySeo(); });

  I.apply();
  applyTabs(); applyTheme(); applyMenu(); applyBanner(); applySeo(); renderContact(); applyImages();
  route();
})();
