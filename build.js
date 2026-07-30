const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ── Opprett dist-mappe ──
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

// ── Kopier alle eksisterende HTML/CSS/JS/PNG-filer til dist ──
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Kopier alle filer unntatt _arrangementer, node_modules, dist
fs.readdirSync('.').forEach(file => {
  if (['_arrangementer', 'node_modules', 'dist', '.git'].includes(file)) return;
  const stat = fs.statSync(file);
  if (stat.isDirectory()) {
    copyDir(file, path.join('dist', file));
  } else {
    fs.copyFileSync(file, path.join('dist', file));
  }
});

// ── Les arrangementsfiler fra CMS ──
const arrDir = '_arrangementer';
if (!fs.existsSync(arrDir)) {
  console.log('Ingen arrangementer funnet — hopper over generering');
  process.exit(0);
}

const filer = fs.readdirSync(arrDir).filter(f => f.endsWith('.md'));
console.log(`Fant ${filer.length} arrangementer`);

const arrangementer = filer.map(fil => {
  const innhold = fs.readFileSync(path.join(arrDir, fil), 'utf8');
  const { data } = matter(innhold);
  data._fil = fil.replace('.md', '');
  return data;
}).sort((a, b) => {
  // Sorter etter dato (enkel tekstsortering — fungerer for norske datoer)
  return (a.dato || '').localeCompare(b.dato || '');
});

// ── CSS-variabler (delt) ──
const css = `
    :root {
      --black:#080807;--dark:#0e0e0b;--panel:#131310;--olive:#3d3d1f;
      --olive-mid:#5a5a2e;--olive-light:#7a7a3e;--tan:#c4b070;--tan-dim:#8a7a4a;
      --white:#edeade;--muted:rgba(237,234,222,0.55);--red:#8b1e1e;
      --red-bright:#bb2828;--grid:rgba(90,90,46,0.12);--scan:rgba(90,90,46,0.04);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:var(--black);color:var(--white);font-family:'Rajdhani',sans-serif;font-weight:400;overflow-x:hidden}
    body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);
      background-size:48px 48px}
    body::after{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
      background:repeating-linear-gradient(0deg,transparent,transparent 2px,var(--scan) 2px,var(--scan) 4px)}
    nav,main,footer{position:relative;z-index:1}
    nav{display:flex;justify-content:space-between;align-items:center;padding:1rem 4rem;
      border-bottom:1px solid var(--olive);background:rgba(8,8,7,0.95);
      position:sticky;top:0;z-index:100;backdrop-filter:blur(8px)}
    .nav-logo{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.14em;color:var(--tan);text-decoration:none}
    .nav-logo span{color:var(--red-bright)}
    .nav-back{font-family:'Share Tech Mono',monospace;font-size:0.72rem;letter-spacing:0.2em;
      text-transform:uppercase;color:var(--white);text-decoration:none;opacity:0.6;
      display:flex;align-items:center;gap:0.5rem;transition:opacity 0.2s,color 0.2s}
    .nav-back:hover{opacity:1;color:var(--tan)}
    .nav-back::before{content:'←';font-size:1rem}
    main{max-width:900px;margin:0 auto;padding:4rem 2rem 6rem}
    .arr-eyebrow{font-family:'Share Tech Mono',monospace;font-size:0.68rem;letter-spacing:0.3em;
      color:var(--red-bright);margin-bottom:1rem;display:flex;align-items:center;gap:0.8rem}
    .arr-eyebrow::before{content:'//';color:var(--olive-mid)}
    h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,5.5vw,4.5rem);
      line-height:0.95;letter-spacing:0.04em;color:var(--white);margin-bottom:2rem}
    h1 span{color:var(--tan);display:block}
    .arr-meta{display:flex;flex-wrap:wrap;gap:0.6rem;margin-bottom:2.5rem}
    .arr-tag{font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.18em;
      text-transform:uppercase;color:var(--olive-light);border:1px solid rgba(90,90,46,0.45);padding:0.3rem 0.8rem}
    .arr-tag.hi{border-color:var(--tan-dim);color:var(--tan-dim)}
    .arr-tag.red{border-color:rgba(187,40,40,0.5);color:var(--red-bright)}
    .program{margin-bottom:2.5rem}
    .program-title{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.08em;color:var(--white);margin-bottom:1.2rem}
    .timeline{display:flex;flex-direction:column}
    .tl-item{display:grid;grid-template-columns:80px 1fr}
    .tl-time{font-family:'Share Tech Mono',monospace;font-size:0.72rem;letter-spacing:0.1em;
      color:var(--tan-dim);padding:1rem 1rem 1rem 0;border-right:2px solid var(--olive);text-align:right;line-height:1.3}
    .tl-content{padding:0.8rem 0 0.8rem 1.4rem;position:relative}
    .tl-content::before{content:'';position:absolute;left:-5px;top:1.1rem;
      width:8px;height:8px;border-radius:50%;background:var(--olive-mid);border:2px solid var(--black)}
    .tl-item.highlight .tl-content::before{background:var(--tan)}
    .tl-item.highlight .tl-time{color:var(--tan)}
    .tl-heading{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.95rem;
      text-transform:uppercase;letter-spacing:0.07em;color:var(--white);margin-bottom:0.3rem}
    .tl-desc{font-size:0.85rem;line-height:1.65;color:var(--muted)}
    .price-box{background:var(--panel);border:1px solid rgba(61,61,31,0.4);
      border-left:3px solid var(--tan);padding:1.8rem 2rem;margin-bottom:2.5rem;
      display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
    .price-item{display:flex;flex-direction:column;gap:0.3rem}
    .price-label{font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.2em;color:var(--olive-light);text-transform:uppercase}
    .price-amount{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--tan);letter-spacing:0.04em;line-height:1}
    .price-amount.discounted{color:var(--white)}
    .price-note{font-size:0.8rem;color:var(--muted);line-height:1.5}
    .price-note strong{color:var(--tan)}
    .includes{background:rgba(61,61,31,0.15);border:1px solid rgba(61,61,31,0.35);padding:1.4rem 1.8rem;margin-bottom:2.5rem}
    .includes-title{font-family:'Share Tech Mono',monospace;font-size:0.65rem;letter-spacing:0.25em;color:var(--tan-dim);text-transform:uppercase;margin-bottom:1rem}
    .includes-list{display:flex;flex-direction:column;gap:0.5rem}
    .includes-item{font-size:0.88rem;color:var(--muted);display:flex;gap:0.8rem;align-items:baseline}
    .includes-item::before{content:'▸';color:var(--red-bright);font-size:0.75rem}
    .includes-item.extra{color:rgba(237,234,222,0.35)}
    .includes-item.extra::before{content:'○';color:var(--olive-mid)}
    .arr-divider{height:1px;background:linear-gradient(90deg,var(--olive),transparent);margin:2.5rem 0}
    .signup-box{background:var(--panel);border:1px solid rgba(61,61,31,0.4);border-left:3px solid var(--red-bright);padding:2rem 2.2rem}
    .signup-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:0.07em;color:var(--white);margin-bottom:0.5rem}
    .signup-title span{color:var(--tan)}
    .signup-subtitle{font-size:0.85rem;color:var(--muted);margin-bottom:1.5rem}
    .signup-form{display:flex;flex-direction:column;gap:1rem}
    .form-group{display:flex;flex-direction:column;gap:0.45rem}
    .form-group label{font-family:'Share Tech Mono',monospace;font-size:0.65rem;letter-spacing:0.25em;color:var(--tan-dim);text-transform:uppercase}
    .form-group input,.form-group textarea,.form-group select{
      background:rgba(18,18,14,0.9);border:1px solid var(--olive);color:var(--white);
      font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:500;
      padding:0.8rem 1rem;outline:none;transition:border-color 0.2s;appearance:none}
    .form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:var(--tan-dim)}
    .form-group textarea{min-height:80px;resize:vertical}
    .form-group select option{background:var(--panel)}
    .btn-primary{font-family:'Share Tech Mono',monospace;font-size:0.78rem;letter-spacing:0.2em;
      text-transform:uppercase;background:var(--red-bright);color:var(--white);padding:0.9rem 2rem;
      border:none;cursor:pointer;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
      transition:background 0.2s,transform 0.15s)}
    .btn-primary:hover{background:var(--red);transform:translateY(-2px)}
    footer{padding:2rem 4rem;border-top:1px solid var(--olive);display:flex;justify-content:space-between;align-items:center}
    .footer-logo{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:0.14em;color:var(--tan)}
    .footer-logo span{color:var(--red-bright)}
    .footer-copy{font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.18em;color:rgba(237,234,222,0.25)}
    @media(max-width:768px){nav{padding:1rem 1.5rem}main{padding:3rem 1.5rem 4rem}.price-box{grid-template-columns:1fr}footer{padding:2rem 1.5rem;flex-direction:column;gap:1rem;text-align:center}}
`;

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />`;

// ── Generer arrangementside ──
function genererArrSide(arr) {
  const tittelDeler = arr.tittel ? arr.tittel.split('—') : [arr.tittel || '', ''];
  const h1Linje1 = (tittelDeler[0] || '').trim().toUpperCase();
  const h1Linje2 = (tittelDeler[1] || '').trim().toUpperCase();

  const stempelHTML = arr.gjennomfort ? `
  <div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:9999;opacity:0.18;">
    <div style="transform:rotate(-22deg);display:flex;align-items:center;justify-content:center;">
      <div style="border:10px solid var(--tan);border-radius:6px;padding:1.5rem 3rem;position:relative;display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
        <div style="position:absolute;top:10px;left:10px;right:10px;height:5px;background:var(--tan)"></div>
        <div style="position:absolute;bottom:10px;left:10px;right:10px;height:5px;background:var(--tan)"></div>
        <span style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.7rem,1.5vw,1rem);letter-spacing:0.4em;color:var(--tan);text-transform:uppercase;">FeltAkademiet</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:clamp(5rem,12vw,10rem);letter-spacing:0.18em;color:var(--tan);line-height:1;text-align:center;">GJENNOMFØRT</span>
        <span style="font-family:'Share Tech Mono',monospace;font-size:clamp(0.7rem,1.5vw,1rem);letter-spacing:0.4em;color:var(--tan);text-transform:uppercase;">${arr.dato || ''}</span>
      </div>
    </div>
  </div>` : '';

  const programHTML = (arr.program || []).map(p => `
      <div class="tl-item${p.highlight ? ' highlight' : ''}">
        <div class="tl-time">${p.tid || ''}</div>
        <div class="tl-content">
          <div class="tl-heading">${p.tittel || ''}</div>
          <div class="tl-desc">${p.beskrivelse || ''}</div>
        </div>
      </div>`).join('');

  const inkludertHTML = (arr.inkludert || []).map(i =>
    `      <div class="includes-item">${i}</div>`
  ).join('\n');

  const tilleggHTML = (arr.tillegg || []).map(i =>
    `      <div class="includes-item extra">${i}</div>`
  ).join('\n');

  const formName = `paamelding-${arr._fil}`;

  return `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${arr.tittel || ''} — ${arr.dato || ''} — FeltAkademiet</title>
  ${fonts}
  <style>${css}</style>
</head>
<body>

${stempelHTML}

<nav>
  <a class="nav-logo" href="index.html">FELT<span>AKADEMIET</span></a>
  <a class="nav-back" href="index.html#arrangementer">Alle arrangementer</a>
</nav>

<main>
  <div class="arr-eyebrow">Arrangement · ${arr.kurskode || ''} · ${arr.type || ''} · ${arr.dato || ''}</div>
  <h1>${h1Linje1}${h1Linje2 ? `<br><span>${h1Linje2}</span>` : ''}</h1>

  <div class="arr-meta">
    <span class="arr-tag hi">${arr.dato || ''}</span>
    <span class="arr-tag hi">${arr.tid || ''}</span>
    <span class="arr-tag">${arr.kurskode || ''}</span>
    <span class="arr-tag">${arr.type || ''}</span>
    <span class="arr-tag">${arr.varighet || ''}</span>
    <span class="arr-tag">${arr.sted || ''}</span>
    <span class="arr-tag red">${arr.pris || ''} kr</span>
  </div>

  <p style="font-size:1rem;line-height:1.85;color:var(--muted);margin-bottom:2rem">${arr.ingress || ''}</p>

  <div class="program">
    <div class="program-title">Dagens program</div>
    <div class="timeline">
${programHTML}
    </div>
  </div>

  <div class="price-box">
    <div class="price-item">
      <span class="price-label">Pris</span>
      <span class="price-amount">${arr.pris || ''},-</span>
      <span class="price-note">Ordinær pris per deltaker</span>
    </div>
    <div class="price-item">
      <span class="price-label">Returrabatt</span>
      <span class="price-amount discounted">${arr.returrabatt || ''},-</span>
      <span class="price-note"><strong>25% rabatt</strong> for deg som har deltatt på et tidligere FeltAkademiet-arrangement.</span>
    </div>
  </div>

  <div class="includes">
    <div class="includes-title">// Inkludert i prisen</div>
    <div class="includes-list">
${inkludertHTML}
${tilleggHTML}
    </div>
  </div>

  <div class="arr-divider"></div>

  <div class="signup-box">
    <div class="signup-title">Meld deg på — <span>${arr.tittel || ''}</span></div>
    <p class="signup-subtitle">${arr.dato || ''} · ${arr.tid || ''} · ${arr.pris || ''} kr (${arr.returrabatt || ''} kr med returrabatt)</p>
    <form class="signup-form" name="${formName}" method="POST" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="${formName}" />
      <input type="hidden" name="arrangement" value="${arr.tittel || ''} — ${arr.dato || ''}" />
      <p style="display:none"><input name="bot-field" /></p>
      <div class="form-group">
        <label>Navn</label>
        <input type="text" name="navn" placeholder="Ditt fulle navn" required />
      </div>
      <div class="form-group">
        <label>E-post</label>
        <input type="email" name="epost" placeholder="din@epost.no" required />
      </div>
      <div class="form-group">
        <label>Pris</label>
        <select name="pris" required>
          <option value="">— Velg prisklasse —</option>
          <option value="Ordinær — ${arr.pris || ''} kr">Ordinær pris — ${arr.pris || ''} kr</option>
          <option value="Returrabatt — ${arr.returrabatt || ''} kr">Returrabatt (tidligere deltaker) — ${arr.returrabatt || ''} kr</option>
        </select>
      </div>
      <div class="form-group">
        <label>Melding (valgfritt)</label>
        <textarea name="melding" placeholder="Spørsmål eller kommentarer…"></textarea>
      </div>
      <button class="btn-primary" type="submit">Meld meg på</button>
    </form>
  </div>
</main>

<footer>
  <div class="footer-logo">FELT<span>AKADEMIET</span></div>
  <div class="footer-copy">© 2025 · Norge · Alle rettigheter forbeholdt</div>
</footer>

</body>
</html>`;
}

// ── Oppdater event-listen i index.html ──
function oppdaterIndex(arrangementer) {
  const indexPath = path.join('dist', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('Finner ikke dist/index.html — hopper over oppdatering av arrangementsliste');
    return;
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  const eventListeHTML = arrangementer.map(arr => {
    const dag = (arr.dato || '').match(/\d+/)?.[0] || '00';
    const mndMatch = (arr.dato || '').match(/\b(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)\b/i);
    const mnd = mndMatch ? mndMatch[0].charAt(0).toUpperCase() + mndMatch[0].slice(1) : '';
    const filnavn = `arr-${arr._fil}.html`;
    const plasser = arr.gjennomfort ? 'Gjennomført' : `● ${arr.plasser || '?'} plasser · ${arr.pris || '?'} kr`;
    const spotsClass = arr.gjennomfort ? 'event-spots full' : 'event-spots';

    return `
    <a class="event-item" href="${filnavn}">
      <div class="event-date-box">
        <span class="event-day">${dag}</span>
        <span class="event-month">${mnd}</span>
      </div>
      <div class="event-info">
        <span class="event-title">${arr.tittel || ''}</span>
        <div class="event-meta-row">
          <span class="event-tag">${arr.kurskode || ''} · ${arr.type || ''} · ${arr.varighet || ''}</span>
        </div>
        <div class="event-meta-row">
          <span class="${spotsClass}">${plasser}</span>
        </div>
      </div>
      <span class="event-arrow">›</span>
    </a>`;
  }).join('\n');

  // Erstatt innholdet mellom event-list start og slutt
  html = html.replace(
    /(<div class="event-list">)([\s\S]*?)(<\/div>\s*\n\s*<\/section>\s*\n\s*<!-- CONTACT -->)/,
    `$1\n${eventListeHTML}\n  $3`
  );

  fs.writeFileSync(indexPath, html);
  console.log('index.html oppdatert med arrangementsliste');
}

// ── Kjør alt ──
arrangementer.forEach(arr => {
  const html = genererArrSide(arr);
  const filnavn = `arr-${arr._fil}.html`;
  fs.writeFileSync(path.join('dist', filnavn), html);
  console.log(`Genererte: ${filnavn}`);
});

oppdaterIndex(arrangementer);
console.log('Bygg fullført!');
