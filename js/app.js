// Album list, filters and ES/EN switch. Albums live in data/albums.json.
(function () {
  const EN = {
    'nav.albums': 'Albums', 'nav.about': 'About', 'nav.services': 'Services',
    'hero.eyebrow': 'Independent photographer · since 2019',
    'hero.title': 'Bolivian dances all over the world',
    'hero.lead': 'I travel to capture Bolivian dances, whatever the group. Dancers always get their photos for free.',
    'hero.cta': 'Find your album',
    'hero.hint': 'Scroll to speed up',
    'stats.albums': 'albums', 'stats.photos': 'photos', 'stats.countries': 'countries',
    'albums.title': 'Albums',
    'albums.sub': 'Tap an album to see and download the photos on Google Photos.',
    'albums.empty': 'No album matches. Try another search.',
    'albums.missing': 'Is your group missing? Add it here and I will take it into account.',
    'albums.missingCta': 'Add a group',
    'filters.search': 'Search: city, event, group…',
    'filters.year': 'All years', 'filters.country': 'All countries',
    'filters.dance': 'All dances', 'filters.group': 'All groups',
    'magnets.title': 'Take home a unique souvenir!',
    'magnets.p1': 'Dancers always get their photos for free: it is my way to support this culture and help it spread.',
    'magnets.p2': 'But gear, travel and prints have a cost. To keep the photos free, I offer my photos as magnets: small souvenirs of a moment, a smile or a dance.',
    'magnets.cta': 'Order my magnets',
    'about.title': 'Hi! I am Vincent',
    'about.p1': 'I am an independent French photographer 🇫🇷 specialised in the Bolivian carnival. I love travelling the world to photograph Bolivian dances, whatever the group.',
    'about.p2': 'I do not dance 😬 But if I ever do, it will surely be Tinku. My favourite dance to photograph: the Llamerada.',
    'about.gear': '📷 Gear',
    'services.title': 'Dedicated shootings',
    'services.sub': 'Want photos of your group at the next carnival? Sponsor my trip!',
    'services.session': '3-hour session',
    'services.best': 'Best for group pictures. The price does not change with the number of people.',
    'services.i1': 'All high-resolution photos taken during the session',
    'services.i2': 'All pictures enhanced (colour, exposure, vibrance, vignetting)',
    'services.i3': 'The place is set at booking; tell me in advance the poses you want',
    'services.options': 'Options',
    'services.o1': 'Extra hour: 100 €/hour (tell me as soon as you can)',
    'services.o2': 'Custom edits: 10 €/photo',
    'services.o3': 'Far-away places: you cover transport and housing on top of the session',
    'services.free': '🆓 What I do for free',
    'services.f1': 'Share a new carnival promotion',
    'services.f2': 'Share big news about your dance group',
    'services.contact': 'Requests are made on Instagram.',
    'services.cta': 'Message me on Instagram',
    count: (n, t) => n === t ? `${t} albums` : `${n} of ${t} albums`,
    photos: n => `${n.toLocaleString('en')} photos`,
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  const ES_EXTRA = {
    count: (n, t) => n === t ? `${t} álbumes` : `${n} de ${t} álbumes`,
    photos: n => `${n.toLocaleString('es')} fotos`,
    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  };

  // Spanish strings are the ones written in the HTML.
  const ES = { ...ES_EXTRA };
  document.querySelectorAll('[data-i18n]').forEach(el => { ES[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { ES[el.dataset.i18nPlaceholder] = el.placeholder; });

  let lang = 'es';
  try { lang = localStorage.getItem('lang') || 'es'; } catch (e) {}
  const t = () => (lang === 'en' ? EN : ES);

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { const v = t()[el.dataset.i18n]; if (v) el.textContent = v; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t()[el.dataset.i18nPlaceholder]; });
    document.getElementById('lang-toggle').textContent = lang === 'en' ? 'ES' : 'EN';
    render();
  }
  document.getElementById('lang-toggle').addEventListener('click', () => {
    lang = lang === 'en' ? 'es' : 'en';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
  });

  const $ = id => document.getElementById(id);
  const els = { q: $('q'), year: $('f-year'), country: $('f-country'), dance: $('f-dance'), group: $('f-group') };
  let albums = [];

  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const fmtDate = d => { const [y, m] = d.split('-'); return `${t().months[+m - 1]} ${y}`; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function fillSelect(sel, values) {
    values.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); });
  }

  // Filters are kept in the URL (?q=&year=&country=&dance=&group=) so a filtered list can be shared.
  function readUrl() {
    const p = new URLSearchParams(location.search);
    Object.keys(els).forEach(k => { if (p.has(k)) els[k].value = p.get(k); });
  }
  function writeUrl() {
    const p = new URLSearchParams();
    Object.keys(els).forEach(k => { if (els[k].value) p.set(k, els[k].value); });
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}${location.hash}` : location.pathname + location.hash);
  }

  function matches(a) {
    if (els.year.value && !a.date.startsWith(els.year.value)) return false;
    if (els.country.value && a.country !== els.country.value) return false;
    if (els.dance.value && !a.dances.includes(els.dance.value)) return false;
    if (els.group.value && !a.groups.includes(els.group.value)) return false;
    const q = norm(els.q.value).trim();
    if (!q) return true;
    const hay = norm([a.title, a.date, a.country, ...a.dances, ...a.groups].join(' '));
    return q.split(/\s+/).every(w => hay.includes(w));
  }

  function card(a) {
    const meta = [a.country, a.photos ? t().photos(a.photos) : null].filter(Boolean).join(' · ');
    const chips = a.dances.map(d => `<span class="chip">${esc(d)}</span>`).join('');
    return `<a class="album" href="${esc(a.link)}" target="_blank" rel="noopener">
      <div class="album-cover">
        ${a.cover ? `<img src="${esc(a.cover)}" alt="" loading="lazy" width="800" height="600">` : ''}
        <span class="album-date">${fmtDate(a.date)}</span>
      </div>
      <div class="album-body">
        <h3 class="album-title">${esc(a.title)}</h3>
        <p class="album-meta">${esc(meta)}</p>
        ${chips ? `<div class="chips">${chips}</div>` : ''}
      </div>
    </a>`;
  }

  function render() {
    if (!albums.length) return;
    const list = albums.filter(matches);
    $('grid').innerHTML = list.map(card).join('');
    $('empty').hidden = list.length > 0;
    $('count').textContent = t().count(list.length, albums.length);
  }

  function onChange() { writeUrl(); render(); }
  Object.values(els).forEach(el => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', onChange));

  fetch('data/albums.json')
    .then(r => r.json())
    .then(data => {
      albums = data.slice().sort((a, b) => b.date.localeCompare(a.date));
      const uniq = f => [...new Set(albums.flatMap(f))].sort((a, b) => a.localeCompare(b));
      fillSelect(els.year, uniq(a => [a.date.slice(0, 4)]).reverse());
      fillSelect(els.country, uniq(a => [a.country]));
      fillSelect(els.dance, uniq(a => a.dances));
      fillSelect(els.group, uniq(a => a.groups));
      readUrl();

      const photos = albums.reduce((s, a) => s + (a.photos || 0), 0);
      $('stat-albums').textContent = albums.length;
      $('stat-photos').textContent = `${Math.floor(photos / 1000)}k+`;
      $('stat-countries').textContent = new Set(albums.map(a => a.country)).size;

      applyLang();
    })
    .catch(() => { $('count').textContent = 'Error loading albums.'; });
})();
