(() => {
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rich = t => esc(t).replace(/`([^`]+)`/g,'<code>$1</code>');
const store = {
  get(k, d) { try { const v = localStorage.getItem('kib:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('kib:' + k, JSON.stringify(v)); } catch {} }
};
let D, docs = [];
const main = $('#main'), nav = $('#nav');

fetch('data/content.json').then(r => r.json()).then(d => { D = d; build(); route(); });

function build() {
  const S = D.sections;
  S.forEach(s => docs.push({ id: s.id, kind: s.kind, title: s.title, num: s.num, sec: s }));
  docs.push({ id: 'wb', kind: 'wb', title: 'Radna bilježnica', num: '' });
  D.exercises.forEach(e => docs.push({ id: 'ex' + e.n, kind: 'ex', title: e.title, num: String(e.n).padStart(2, '0'), ex: e }));
  const group = (h, kinds, fmt) => '<h4>' + h + '</h4>' + docs.filter(d => kinds.includes(d.kind)).map(d =>
    `<a href="#/${d.id}" data-id="${d.id}"><b>${fmt(d)}</b><span>${esc(d.title)}</span></a>`).join('');
  nav.innerHTML = group('Uvod', ['front'], () => '•') + group('Poglavlja', ['chapter'], d => d.num) +
    group('Dodaci', ['appendix'], d => d.num) + group('Radna bilježnica', ['wb', 'ex'], d => d.num || '★');
  markDone();
}
const done = () => store.get('done', {});
function markDone() {
  const dn = done();
  nav.querySelectorAll('a').forEach(a => a.classList.toggle('done', !!dn[a.dataset.id]));
}
function progress() {
  const dn = done(), ch = docs.filter(d => d.kind === 'chapter'), ex = docs.filter(d => d.kind === 'ex');
  return { c: ch.filter(d => dn[d.id]).length, ct: ch.length, e: ex.filter(d => dn[d.id]).length, et: ex.length };
}

function blocks(bs) {
  return bs.map(b => {
    switch (b.t) {
      case 'h2': return `<h2>${esc(b.text)}</h2>`;
      case 'p': return `<p>${rich(b.text)}</p>`;
      case 'goal': return `<div class="goal"><div class="label">Cilj poglavlja</div>${rich(b.text)}</div>`;
      case 'callout': return `<div class="box ${b.kind}"><div class="label">${esc(b.label)}</div><p>${rich(b.text)}</p></div>`;
      case 'summary': return `<div class="summary"><div class="label">Sažetak poglavlja</div><p>${rich(b.text)}</p></div>`;
      case 'quote': return `<div class="quote">${esc(b.text)}</div>`;
      case 'questions': return `<ol class="q">${b.items.map(i => `<li>${rich(i)}</li>`).join('')}</ol>`;
      case 'table': return `<table><tr><th>${esc(b.head[0])}</th><th>${esc(b.head[1])}</th></tr>${b.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${rich(r[1])}</td></tr>`).join('')}</table>`;
      case 'links': return b.items.map(i => `<a class="link" href="${esc(i.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(i.name)}</b><small>${esc(i.url)}</small>${esc(i.desc)}</a>`).join('');
      case 'cmds': return b.entries.map(e => `<div class="cmd"><div>${e.cmds.map(esc).join('<br>')}</div><div>${esc(e.desc)}</div></div>`).join('');
      case 'check': return b.items.map((i, k) => chk('apxA:' + k, i)).join('');
    }
    return '';
  }).join('');
}
function chk(key, text) {
  return `<label class="chk"><input type="checkbox" data-k="${key}" ${store.get('c:' + key, false) ? 'checked' : ''}><span>${esc(text)}</span></label>`;
}

function view(d) {
  if (!d) return home();
  if (d.kind === 'wb') return wb();
  if (d.kind === 'ex') return exercise(d.ex);
  const kick = d.kind === 'chapter' ? 'Poglavlje ' + d.num : d.kind === 'appendix' ? 'Dodatak ' + d.num : 'Uvod';
  let h = `<div class="kicker">${kick}</div><h1>${esc(d.title)}</h1>` + blocks(d.sec.blocks);
  if (d.kind === 'chapter') {
    const ex = D.exercises.filter(e => e.chapter === d.sec.num);
    h += `<h2>Vježbe za ovo poglavlje</h2><div class="grid">${ex.map(e => `<a class="card" href="#/ex${e.n}"><b>Vježba ${String(e.n).padStart(2, '0')}</b><br>${esc(e.title)}</a>`).join('')}</div>`;
    h += `<p style="margin-top:24px"><button class="btn" id="mark">${done()[d.id] ? 'Označi kao nepročitano' : 'Označi kao pročitano ✓'}</button></p>`;
  }
  return h;
}
function home() {
  const p = progress();
  return `<div class="hero"><div class="kicker" style="color:#4CC9E0">Praktični udžbenik za samostalno učenje</div>
    <h1>Hakiranje i kibernetička sigurnost</h1><p>Prošireno izdanje — od računalnih i mrežnih temelja do etičkog penetracijskog testiranja, obrane sustava i digitalne forenzike.</p>
    <a class="btn" href="#/ch1">Započni čitanje</a></div>
    <div class="box warn"><div class="label">Važno pravilo</div><p>Sve aktivne provjere provode se isključivo na vlastitim sustavima ili uz izričito pisano odobrenje vlasnika.</p></div>
    <h2>Tvoj napredak</h2>
    <div class="label">Poglavlja ${p.c}/${p.ct}</div><div class="bar"><i style="width:${p.c / p.ct * 100}%"></i></div>
    <div class="label" style="margin-top:12px">Vježbe ${p.e}/${p.et}</div><div class="bar"><i style="width:${p.e / p.et * 100}%"></i></div>
    <h2>Poglavlja</h2><div class="grid">${docs.filter(d => d.kind === 'chapter').map(d => `<a class="card" href="#/${d.id}"><b>${d.num}</b> ${esc(d.title)}</a>`).join('')}</div>`;
}
function wb() {
  return `<div class="kicker">Dodatak</div><h1>Radna bilježnica</h1><div class="box"><div class="label">O radnoj bilježnici</div><p>${esc(D.workbook.intro)}</p></div>
  <h3>Kako koristiti radnu bilježnicu</h3><p>${esc(D.workbook.how)}</p>
  <div class="box"><div class="label">Spremanje</div><p>Bilješke i kvačice spremaju se u tvom pregledniku (localStorage) i ostaju samo na ovom uređaju.</p></div>
  <h2>Sve vježbe</h2><div class="grid">${D.exercises.map(e => `<a class="card" href="#/ex${e.n}"><b>${String(e.n).padStart(2, '0')}</b> ${esc(e.title)}</a>`).join('')}</div>`;
}
const NOTES = ['Hipoteza / pitanje koje provjeravam', 'Okruženje i opseg', 'Opažanja i dokazi', 'Rizik i preporuka', 'Što bih sljedeće provjerio'];
const CHECKS = ['Opseg je jasan', 'Korišteni su testni podaci', 'Dokazi ne otkrivaju tajne', 'Rezultat je ponovljiv', 'Predložena je konkretna zaštita'];
function exercise(e) {
  const ch = docs.find(d => d.id === 'ch' + e.chapter), id = 'ex' + e.n;
  return `<div class="kicker">Vježba ${String(e.n).padStart(2, '0')} / ${D.exercises.length}</div><h1>${esc(e.title)}</h1>
  <div class="meta"><span>Tematska cjelina: <b>${esc(e.theme)}</b></span><span>Povezano poglavlje: <a href="#/ch${e.chapter}">${e.chapter}. ${esc(ch.title)}</a></span></div>
  <h3>Scenarij</h3><p>${esc(e.scenario)}</p><h3>Cilj učenja</h3><p>${esc(e.goal)}</p>
  <h3>Predloženi postupak</h3><ol class="steps">${e.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  <div class="box"><div class="label">Očekivana predaja</div><p>${esc(e.deliver)}</p></div>
  <h3>Bilježnica</h3>${NOTES.map((n, k) => `<p><label class="label">${n}</label><textarea data-n="${id}:${k}">${esc(store.get('n:' + id + ':' + k, ''))}</textarea></p>`).join('')}
  <h3>Provjera kvalitete</h3>${CHECKS.map((c, k) => chk(id + ':' + k, c)).join('')}
  <p style="margin-top:20px"><button class="btn" id="mark">${done()[id] ? 'Označi kao nezavršeno' : 'Označi vježbu kao završenu ✓'}</button></p>`;
}

function route() {
  const id = (location.hash.replace(/^#\/?/, '') || '').trim();
  const d = docs.find(x => x.id === id);
  document.title = (d ? d.title + ' — ' : '') + 'Hakiranje i kibernetička sigurnost';
  main.innerHTML = view(d) + pager(d);
  nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.id === id));
  nav.classList.remove('open');
  window.scrollTo(0, 0); main.focus({ preventScroll: true });
  const on = nav.querySelector('a.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  const m = $('#mark'); if (m) m.onclick = () => { const dn = done(); dn[d.id] ? delete dn[d.id] : dn[d.id] = 1; store.set('done', dn); markDone(); route(); };
  main.querySelectorAll('input[type=checkbox]').forEach(c => c.onchange = () => store.set('c:' + c.dataset.k, c.checked));
  main.querySelectorAll('textarea').forEach(t => t.oninput = () => store.set('n:' + t.dataset.n, t.value));
}
function pager(d) {
  if (!d) return '';
  const i = docs.indexOf(d), p = docs[i - 1], n = docs[i + 1];
  return `<div class="pager"><span>${p ? `<a href="#/${p.id}">← ${esc(p.title)}</a>` : ''}</span><span>${n ? `<a href="#/${n.id}">${esc(n.title)} →</a>` : ''}</span></div>`;
}

// search (title + text)
function plain(d) {
  if (d.kind === 'ex') return [d.ex.scenario, d.ex.goal, d.ex.steps.join(' '), d.ex.deliver].join(' ');
  if (!d.sec) return '';
  return d.sec.blocks.map(b => b.text || (b.items || []).map(i => i.text || i.desc || i).join(' ') || (b.rows || []).flat().join(' ') || '').join(' ');
}
let timer;
$('#q').addEventListener('input', e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 3) { if (!q) route(); return; }
    const hits = docs.map(d => {
      const t = plain(d), i = t.toLowerCase().indexOf(q), ti = d.title.toLowerCase().includes(q);
      return (i >= 0 || ti) ? { d, snip: i >= 0 ? t.slice(Math.max(0, i - 60), i + 120) : '' } : null;
    }).filter(Boolean);
    main.innerHTML = `<div class="kicker">Pretraga</div><h1>„${esc(q)}” — ${hits.length} rezultata</h1>` +
      hits.slice(0, 40).map(h => `<a class="link" href="#/${h.d.id}"><b>${esc(h.d.title)}</b>${esc(h.snip).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), m => '<mark>' + m + '</mark>')}…</a>`).join('');
  }, 200);
});
$('#menu').onclick = () => nav.classList.toggle('open');
const th = store.get('theme', matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = th;
$('#theme').onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('theme', t); };
addEventListener('hashchange', () => { $('#q').value = ''; if (D) route(); });
})();
