/* CAL Novidades — favoritos + nav
 * Storage key: cal:favs
 * Estrutura: { "<aid>": { aid, edition, editionTitle, editionDate, editionUrl, title, summary, savedAt } }
 */
(function(){
  const KEY = "cal:favs";

  function loadFavs(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch(e){ return {}; }
  }
  function saveFavs(obj){ localStorage.setItem(KEY, JSON.stringify(obj)); }
  function countFavs(){ return Object.keys(loadFavs()).length; }

  function updateBadge(){
    const b = document.getElementById("fav-count");
    if(!b) return;
    const n = countFavs();
    b.textContent = n;
    b.style.display = n ? "inline-block" : "none";
  }

  function paintArticle(article, fav){
    if(fav) article.classList.add("favorited");
    else article.classList.remove("favorited");
    const btn = article.querySelector("button.star");
    if(btn){
      btn.classList.toggle("active", !!fav);
      btn.querySelector(".label").textContent = fav ? "Favorito" : "Favoritar";
      btn.setAttribute("aria-pressed", fav ? "true" : "false");
    }
  }

  function attachStars(){
    const editionMeta = window.__CAL_EDITION__ || null;
    if(!editionMeta) return;
    const favs = loadFavs();
    document.querySelectorAll("article.item[data-aid]").forEach(article => {
      const aid = article.getAttribute("data-aid");
      // Star button injected once
      let btn = article.querySelector("button.star");
      if(!btn){
        btn = document.createElement("button");
        btn.className = "star";
        btn.type = "button";
        btn.innerHTML = '<span class="glyph"></span><span class="label">Favoritar</span>';
        const headerRow = article.querySelector(".header-row");
        if(headerRow) headerRow.appendChild(btn);
        else article.prepend(btn);
      }
      paintArticle(article, !!favs[aid]);
      btn.addEventListener("click", () => {
        const f = loadFavs();
        if(f[aid]){
          delete f[aid];
        } else {
          const titleEl = article.querySelector("h3");
          const sumEl = article.querySelector("p strong");
          let summary = "";
          if(sumEl && sumEl.parentNode){
            const txt = sumEl.parentNode.textContent || "";
            summary = txt.replace(/^\s*Resumo\.\s*/,"").trim().slice(0,260);
          }
          f[aid] = {
            aid,
            edition: editionMeta.id,
            editionTitle: editionMeta.title,
            editionDate: editionMeta.date,
            editionUrl: editionMeta.url,
            anchor: article.id || aid,
            title: titleEl ? titleEl.textContent.trim() : aid,
            summary,
            savedAt: new Date().toISOString()
          };
        }
        saveFavs(f);
        paintArticle(article, !!f[aid]);
        updateBadge();
      });
    });
  }

  async function buildEditionsMenu(){
    const sel = document.getElementById("ed-select");
    if(!sel) return;
    try {
      const r = await fetch("/edicoes.json", {cache:"no-store"});
      const list = await r.json();
      sel.innerHTML = '<option value="">Edições…</option>' +
        list.filter(e=>!e.upcoming).map(e=>`<option value="${e.url}">${e.id} · ${e.shortTitle}</option>`).join("");
      sel.addEventListener("change", () => {
        if(sel.value) window.location.href = sel.value;
      });
    } catch(e){ console.warn("Falha ao carregar manifesto de edições", e); }
  }

  function renderFavoritesPage(){
    const wrap = document.getElementById("fav-list");
    if(!wrap) return;
    const favs = loadFavs();
    const items = Object.values(favs).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
    const empty = document.getElementById("fav-empty");
    if(items.length === 0){
      if(empty) empty.style.display = "block";
      wrap.innerHTML = "";
      return;
    }
    if(empty) empty.style.display = "none";
    wrap.innerHTML = items.map(f => `
      <div class="fav-card" data-aid="${f.aid}">
        <div class="body">
          <div class="meta">${f.editionTitle} · ${f.editionDate}</div>
          <h4><a href="${f.editionUrl}#${f.anchor}">${escapeHtml(f.title)}</a></h4>
          ${f.summary ? `<p class="sum">${escapeHtml(f.summary)}…</p>` : ""}
        </div>
        <button class="remove" type="button" title="Remover dos favoritos" aria-label="Remover">×</button>
      </div>
    `).join("");
    wrap.querySelectorAll(".fav-card").forEach(card => {
      card.querySelector("button.remove").addEventListener("click", () => {
        const aid = card.getAttribute("data-aid");
        const f = loadFavs();
        delete f[aid];
        saveFavs(f);
        renderFavoritesPage();
        updateBadge();
      });
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    attachStars();
    buildEditionsMenu();
    updateBadge();
    renderFavoritesPage();
  });

  // Expose for debug
  window.CAL = { loadFavs, saveFavs, countFavs };
})();
