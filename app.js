const searchInput = document.querySelector('#searchInput');
const resultCount = document.querySelector('#resultCount');
const emptyState = document.querySelector('#emptyState');
const scriptGrid = document.querySelector('#scriptGrid');
const scriptDetails = document.querySelector('#scriptDetails');
const categoryFilters = document.querySelector('#categoryFilters');
const scriptNav = document.querySelector('#scriptNav');
const toast = document.querySelector('#toast');
const sidebar = document.querySelector('#sidebar');
const menuButton = document.querySelector('#menuButton');
const scriptCount = document.querySelector('#scriptCount');
const categoryCount = document.querySelector('#categoryCount');
const sidebarCount = document.querySelector('#sidebarCount');
const menuClose = document.querySelector('#menuClose');
const menuOverlay = document.querySelector('#menuOverlay');

let scripts = [];
let categories = [];
let activeCategory = 'all';
const safeIdPattern = /^[a-z0-9-]+$/;
const allowedColors = new Set(['green', 'red', 'gold']);

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const categoryFor = (id) => categories.find((category) => category.id === id) || {
  label: 'Autre', color: 'gold', icon: '◇'
};

function sanitizeLibrary(data) {
  if (!data || !Array.isArray(data.scripts) || !Array.isArray(data.categories)) {
    throw new Error('Format de bibliothèque invalide');
  }
  const safeCategories = data.categories.filter((category) =>
    safeIdPattern.test(category.id) && allowedColors.has(category.color)
  );
  const categoryIds = new Set(safeCategories.map((category) => category.id));
  const safeScripts = data.scripts.filter((script) =>
    safeIdPattern.test(script.id) && categoryIds.has(script.category) &&
    Array.isArray(script.features) && Array.isArray(script.keywords)
  );
  return { categories: safeCategories, scripts: safeScripts };
}

function renderFilters() {
  const filters = [{ id: 'all', label: 'Toutes', count: scripts.length }].concat(
    categories.map((category) => ({
      ...category,
      count: scripts.filter((script) => script.category === category.id).length
    }))
  );

  categoryFilters.innerHTML = filters.map((filter) => `
    <button class="filter-button ${filter.id === activeCategory ? 'active' : ''}" data-category="${escapeHtml(filter.id)}">
      ${escapeHtml(filter.label)} <span>${filter.count}</span>
    </button>
  `).join('');

  categoryFilters.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderFilters();
      renderCards();
    });
  });
}

function filteredScripts() {
  const query = searchInput.value.trim().toLocaleLowerCase('fr');
  return scripts.filter((script) => {
    const categoryMatch = activeCategory === 'all' || script.category === activeCategory;
    const searchable = [script.title, script.description, ...script.features, ...script.keywords]
      .join(' ')
      .toLocaleLowerCase('fr');
    return categoryMatch && searchable.includes(query);
  });
}

function renderCards() {
  const visibleScripts = filteredScripts();
  scriptGrid.innerHTML = visibleScripts.map((script) => {
    const category = categoryFor(script.category);
    return `
      <article class="script-card" id="${escapeHtml(script.id)}">
        <div class="card-top"><span class="script-icon">${escapeHtml(category.icon)}</span><span class="badge badge-${escapeHtml(category.color)}">${escapeHtml(category.label)}</span></div>
        <h3>${escapeHtml(script.title)}</h3>
        <p>${escapeHtml(script.description)}</p>
        <ul class="feature-list">${script.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
        <a class="card-link" href="scripts/${escapeHtml(script.id)}.html">Voir la fiche complète <span>→</span></a>
      </article>
    `;
  }).join('');

  resultCount.textContent = `${visibleScripts.length} résultat${visibleScripts.length > 1 ? 's' : ''}`;
  emptyState.hidden = visibleScripts.length !== 0;
}

function renderDetails() {
  scriptDetails.innerHTML = scripts.map((script) => {
    const category = categoryFor(script.category);
    const attribution = script.author ? ` · Auteur indiqué : ${escapeHtml(script.author)}` : '';
    return `
      <article class="script-detail" id="guide-${escapeHtml(script.id)}">
        <div class="detail-title"><span class="script-icon">${escapeHtml(category.icon)}</span><div><span class="badge badge-${escapeHtml(category.color)}">${escapeHtml(category.label)}</span><h3>${escapeHtml(script.title)}</h3></div></div>
        <p>${escapeHtml(script.tutorial)}</p>
        <div class="code-block"><code>${escapeHtml(script.code)}</code><button class="copy-button" type="button">Copier</button></div>
        <p class="source">Source référencée : <strong>${escapeHtml(script.source)}</strong>${attribution}</p>
      </article>
    `;
  }).join('');

  scriptDetails.querySelectorAll('.copy-button').forEach((button) => {
    button.addEventListener('click', () => copyCode(button));
  });
}

function renderNavigation() {
  scriptNav.innerHTML = scripts.map((script) => {
    const category = categoryFor(script.category);
    return `<a class="nav-link" href="scripts/${escapeHtml(script.id)}.html"><span>${escapeHtml(category.icon)}</span> ${escapeHtml(script.title)}</a>`;
  }).join('');
  bindNavigation();
}

async function copyCode(button) {
  const codeElement = button.parentElement.querySelector('code');
  try {
    await navigator.clipboard.writeText(codeElement.textContent);
    toast.textContent = 'Code copié dans le presse-papiers.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(codeElement);
    selection.removeAllRanges();
    selection.addRange(range);
    toast.textContent = 'Code sélectionné : utilise Ctrl+C.';
  }
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function bindNavigation() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      setMenuOpen(false);
    });
  });
}

function setMenuOpen(isOpen) {
  sidebar.classList.toggle('open', isOpen);
  menuOverlay.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
}

async function loadLibrary() {
  try {
    let data;
    if (window.location.protocol === 'file:') {
      data = window.GT_LIBRARY;
    } else {
      const response = await fetch('data/scripts.json');
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      data = await response.json();
    }
    const safeLibrary = sanitizeLibrary(data);
    scripts = safeLibrary.scripts;
    categories = safeLibrary.categories;
    scriptCount.textContent = String(scripts.length).padStart(2, '0');
    categoryCount.textContent = String(categories.length).padStart(2, '0');
    sidebarCount.textContent = `${scripts.length} scripts référencés`;
    renderFilters();
    renderCards();
    renderDetails();
    renderNavigation();
  } catch (error) {
    if (window.GT_LIBRARY) {
      const safeLibrary = sanitizeLibrary(window.GT_LIBRARY);
      scripts = safeLibrary.scripts;
      categories = safeLibrary.categories;
      scriptCount.textContent = String(scripts.length).padStart(2, '0');
      categoryCount.textContent = String(categories.length).padStart(2, '0');
      sidebarCount.textContent = `${scripts.length} scripts référencés`;
      renderFilters();
      renderCards();
      renderDetails();
      renderNavigation();
    } else {
      resultCount.textContent = 'Erreur de chargement';
      emptyState.hidden = false;
      emptyState.textContent = 'La bibliothèque n’a pas pu être chargée.';
      console.error(error);
    }
  }
}

searchInput.addEventListener('input', renderCards);
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
  }
});
menuButton.addEventListener('click', () => {
  setMenuOpen(!sidebar.classList.contains('open'));
});
menuClose.addEventListener('click', () => setMenuOpen(false));
menuOverlay.addEventListener('click', () => setMenuOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) setMenuOpen(false);
});

bindNavigation();
loadLibrary();
