# Novidades IA · CAL

Boletim pessoal mensal do Dr. Alexandre Lima sobre IA, automação e estratégia para a **Clínica Alexandre Lima**. Curadoria alinhada ao Conselho Administrativo CAL e ao Pacto de Visão 2029–2031.

**Online:** https://novidades-ia-cal.vercel.app

## Estrutura

```
public/
├── index.html               # landing com grid de edições
├── favoritos.html           # matérias estreladas (localStorage)
├── edicoes.json             # manifesto de edições (alimenta menu e grid)
├── assets/
│   ├── styles.css           # paleta verde CAL + tipografia Georgia
│   └── app.js               # favoritos + nav + renderização
└── edicoes/
    └── 01-maio-2026.html    # primeira edição
vercel.json                  # cleanUrls + redirects (/ultima, /edicao/01)
```

## Como publicar a próxima edição

1. Criar `public/edicoes/02-junho-2026.html` (copiar 01 como template).
   - Cada `<article class="item">` precisa de `id="iN"` **e** `data-aid="02-NN"` (edição-matéria).
   - Estrutura interna: `<div class="header-row"><div class="meta">…tag, h3…</div></div>` (o JS injeta a estrela aqui).
   - Antes do `</body>`, definir `window.__CAL_EDITION__ = { id, title, date, url }`.
2. Adicionar entrada em `public/edicoes.json` (`upcoming: false`).
3. `git commit -am "ed 02" && git push` → Vercel publica em ~30s.

## Favoritos

- Salvo em `localStorage` chave `cal:favs`.
- Estrutura: `{ "<aid>": { aid, edition, editionTitle, editionDate, editionUrl, anchor, title, summary, savedAt } }`.
- Export rápido (console): `copy(localStorage.getItem('cal:favs'))`.
- Import: `localStorage.setItem('cal:favs', '<conteúdo>')`.

## Local dev

```bash
npx serve public
# ou
python3 -m http.server -d public 8000
```

## Stack

Vanilla HTML/CSS/JS. Sem build. Vercel serve estático.

---
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
