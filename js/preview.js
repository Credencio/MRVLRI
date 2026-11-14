/* Pré-visualização: com ?preview=1 usa o rascunho guardado em «Gestão do site» (só neste navegador). */
(function () {
  if (!/[?&]preview=1/.test(location.search)) return;
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
})();
