/* Dinamismo: revelação ao rolar, contagem animada dos KPI, transição entre abas, barra de progresso, sombra do cabeçalho, voltar ao topo.
   Respeita «reduzir movimento» do sistema. Nada aqui é necessário para o site funcionar. */
(function () {
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  if (reduce) return;
  document.documentElement.classList.add("js-motion");

  // ---- revelar cartões ao entrar no ecrã
  const SEL = ".view:not([hidden]) .card, .view:not([hidden]) .kpi, .view:not([hidden]) .doc, .view:not([hidden]) .sec, .view:not([hidden]) .note, .view:not([hidden]) .cc, .view:not([hidden]) .hero";
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
  }
  let pending = false;
  function scan() {
    pending = false;
    if (!io) return;
    document.querySelectorAll(SEL).forEach((el) => {
      if (el.dataset.rv) return;
      el.dataset.rv = "1"; el.classList.add("rv");
      const sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sib, 6) * 50 + "ms";
      io.observe(el);
    });
  }
  const queue = () => { if (!pending) { pending = true; setTimeout(scan, 60); } };
  new MutationObserver(queue).observe($("main"), { childList: true, subtree: true });
  window.addEventListener("hashchange", () => {
    queue();
    const v = document.querySelector(".view:not([hidden])");
    if (v) { v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in"); }
  });
  queue();

  // ---- contagem animada dos KPI (só números com casas decimais)
  const kp = $("kpis");
  if (kp) {
    new MutationObserver(() => {
      kp.querySelectorAll(".big").forEach((el) => {
        if (el.dataset.cu) return;
        el.dataset.cu = "1";
        const txt = el.textContent.trim(), m = /^(-?\d+)([.,])(\d+)$/.exec(txt);
        if (!m) return;
        const target = parseFloat(m[1] + "." + m[3]), dec = m[3].length, sep = m[2], t0 = performance.now(), dur = 800;
        (function step(now) {
          const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * e).toFixed(dec).replace(".", sep);
          if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
        })(t0);
      });
    }).observe(kp, { childList: true });
  }

  // ---- progresso de leitura, sombra do cabeçalho, voltar ao topo
  const bar = $("progress"), top = $("to-top"), head = document.querySelector(".topbar");
  let tick = false;
  function onScroll() {
    tick = false;
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
    if (head) head.classList.toggle("scrolled", y > 8);
    if (top) top.hidden = y < 500;
  }
  window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (top) top.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  onScroll();
})();
