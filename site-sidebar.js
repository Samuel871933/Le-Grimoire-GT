(function renderSharedSidebar() {
  const sidebar = document.querySelector('.doc-sidebar');
  if (!sidebar) return;

  const root = '../';
  const activeScript = document.body.dataset.scriptId;
  const isTutorials = window.location.pathname.includes('/tutoriels/');
  const library = window.GT_LIBRARY || { scripts: [], categories: [] };
  const safeIdPattern = /^[a-z0-9-]+$/;
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
  const safeCategories = Array.isArray(library.categories) ? library.categories.filter((category) => safeIdPattern.test(category.id)) : [];
  const safeScripts = Array.isArray(library.scripts) ? library.scripts.filter((script) => safeIdPattern.test(script.id)) : [];
  const categoryFor = (id) => safeCategories.find((category) => category.id === id) || { icon: '◇' };
  const scriptLinks = safeScripts.map((script) => {
    const active = script.id === activeScript ? ' active' : '';
    return `<a class="nav-link${active}" href="${root}scripts/${encodeURIComponent(script.id)}.html"><span>${escapeHtml(categoryFor(script.category).icon)}</span> ${escapeHtml(script.title)}</a>`;
  }).join('');

  sidebar.innerHTML = `
    <button class="doc-menu-close" type="button" aria-label="Fermer le menu">×</button>
    <a class="brand" href="${root}index.html" aria-label="Retour à l’accueil">
      <span class="brand-mark">GT</span>
      <span><strong>Le Grimoire</strong><small>Scripts & stratégies</small></span>
    </a>
    <nav aria-label="Navigation principale">
      <p class="nav-label">Commencer</p>
      <a class="nav-link" href="${root}index.html"><span>⌂</span> Accueil</a>
      <a class="nav-link" href="${root}index.html#installation"><span>⚒</span> Installer un script</a>
      <a class="nav-link${isTutorials ? ' active' : ''}" href="${root}tutoriels/index.html"><span>▤</span> Tutoriels</a>
      <p class="nav-label">Bibliothèque</p>
      ${scriptLinks}
    </nav>
    <div class="sidebar-note">
      <span class="status-dot"></span>
      <div><strong>Édition communautaire</strong><small>${safeScripts.length} scripts référencés</small></div>
    </div>
    <p class="powered-by">Powered by <strong>DEADLY/NOPNUT</strong></p>
  `;

  const overlay = document.createElement('button');
  overlay.className = 'doc-menu-overlay';
  overlay.type = 'button';
  overlay.setAttribute('aria-label', 'Fermer le menu');
  document.body.appendChild(overlay);

  const mobileHeader = document.createElement('header');
  mobileHeader.className = 'doc-mobile-header';
  mobileHeader.innerHTML = `
    <button class="doc-menu-button" type="button" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
    <a class="mobile-logo" href="${root}index.html" aria-label="Le Grimoire GT — Accueil"><span>GT</span></a>
    <span class="doc-mobile-title">Le Grimoire</span>
  `;
  document.body.prepend(mobileHeader);

  const menuButton = mobileHeader.querySelector('.doc-menu-button');
  const closeButton = sidebar.querySelector('.doc-menu-close');

  function setMenuOpen(isOpen) {
    sidebar.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    document.body.classList.toggle('doc-menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    if (isOpen) sidebar.focus({ preventScroll: true });
  }

  menuButton.addEventListener('click', () => setMenuOpen(!sidebar.classList.contains('open')));
  closeButton.addEventListener('click', () => setMenuOpen(false));
  overlay.addEventListener('click', () => setMenuOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('open')) setMenuOpen(false);
  });

  sidebar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
})();
