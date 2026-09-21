const scriptId = document.body.dataset.scriptId;
const pageRoot = document.querySelector('#scriptPage');

if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
  const policy = document.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.content = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";
  document.head.prepend(policy);
}

const sidebarScript = document.createElement('script');
sidebarScript.src = '../site-sidebar.js';
document.head.appendChild(sidebarScript);

const escapePageHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

async function getLibrary() {
  if (window.location.protocol !== 'file:') {
    try {
      const response = await fetch('../data/scripts.json');
      if (response.ok) return response.json();
    } catch (error) {
      console.warn('Chargement JSON impossible, utilisation du secours local.', error);
    }
  }
  return window.GT_LIBRARY;
}

function renderScriptPage(library) {
  if (!/^[a-z0-9-]+$/.test(scriptId || '') || !Array.isArray(library?.scripts) || !Array.isArray(library?.categories)) {
    pageRoot.innerHTML = '<p class="doc-loading">Cette fiche est invalide.</p>';
    return;
  }
  const script = library?.scripts?.find((entry) => entry.id === scriptId);
  const category = library?.categories?.find((entry) => entry.id === script?.category);
  if (!script || !category) {
    pageRoot.innerHTML = '<p class="doc-loading">Cette fiche est introuvable.</p>';
    return;
  }

  document.querySelector('#pageCategory').textContent = category.label;
  document.querySelector('#pageCategory').className = `badge badge-${category.color}`;
  document.querySelector('#pageIcon').textContent = category.icon;
  document.querySelector('#pageTitle').textContent = script.title;
  document.querySelector('#pageDescription').textContent = script.description;
  document.querySelector('#pageFeatures').innerHTML = script.features.map((feature) => `<li>${escapePageHtml(feature)}</li>`).join('');
  document.querySelector('#pageTutorial').textContent = script.tutorial;
  document.querySelector('#pageCode').textContent = script.code;
  document.querySelector('#pageSource').textContent = script.source;
  document.querySelector('#pageAuthor').textContent = script.author || 'Non renseigné';

  document.querySelector('#copyPageCode').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(script.code);
      event.currentTarget.textContent = 'Copié !';
      window.setTimeout(() => { event.currentTarget.textContent = 'Copier'; }, 1800);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('#pageCode'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      event.currentTarget.textContent = 'Sélectionné';
    }
  });

  pageRoot.hidden = false;
  document.querySelector('#pageLoading').hidden = true;
}

getLibrary().then(renderScriptPage).catch(() => {
  document.querySelector('#pageLoading').textContent = 'Impossible de charger cette fiche.';
});
