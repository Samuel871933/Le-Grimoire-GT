(function launchGrimoire() {
  'use strict';

  const baseUrl = window.GRIMOIRE_BASE;
  const existing = document.querySelector('#grimoire-gt-launcher');
  if (existing) {
    existing.remove();
    return;
  }

  function notify(message, type = 'info') {
    if (window.UI?.SuccessMessage && type === 'success') window.UI.SuccessMessage(message);
    else if (window.UI?.ErrorMessage && type === 'error') window.UI.ErrorMessage(message);
    else window.alert(message);
  }

  function validBase(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url : null;
    } catch {
      return null;
    }
  }

  function scriptUrlFrom(code) {
    const match = String(code || '').match(/https:\/\/[^'"\s)]+\.js(?:\?[^'"\s)]*)?/i);
    if (!match) return null;
    try {
      const url = new URL(match[0]);
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }

  // Le champ « lien » de la barre de raccourcis attend le bookmarklet complet.
  // On repart du code publié dans la bibliothèque, en vérifiant qu'il est bien
  // un javascript: pointant vers une source HTTPS.
  function bookmarkletFrom(script) {
    const code = String(script.code || '').trim();
    if (!/^javascript:/i.test(code)) return null;
    return scriptUrlFrom(code) ? code : null;
  }

  function applyKnownConfiguration(script) {
    const configurations = {
      'support-sender': { heavyCav: 6 },
      'split-defense': { heavyCav: 4 },
      bottenkraker: {
        timeColor: 'green',
        waitingColor: '#ff9933',
        noDateColor: 'green',
        timeBarWidth: false
      }
    };
    const selected = configurations[script.id] || {};
    Object.entries(selected).forEach(([key, value]) => {
      if (/^[A-Za-z_$][\w$]*$/.test(key)) window[key] = value;
    });
  }

  function closeLauncher() {
    document.querySelector('#grimoire-gt-launcher')?.remove();
  }

  // mode=quickbar affiche la liste des entrees ; le formulaire d'ajout vit sur
  // mode=quickbar_edit. C'est cette page que l'on ouvre pour l'utilisateur.
  function quickbarUrl(mode = 'quickbar_edit') {
    const url = new URL('/game.php', window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const village = params.get('village');
    if (village) url.searchParams.set('village', village);
    url.searchParams.set('screen', 'settings');
    url.searchParams.set('mode', mode);
    return url.href;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Repli pour les contextes ou l'API presse-papiers est refusee.
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
      return ok;
    }
  }

  // L'ajout d'une entree se fait dans le formulaire officiel du jeu : le
  // lanceur prepare le code et ouvre la page, l'utilisateur valide lui-meme.
  // On ne remplit ni ne soumet le formulaire de reglages a sa place.
  async function installToQuickbar(script, statusLine) {
    const bookmarklet = bookmarkletFrom(script);
    if (!bookmarklet) {
      notify(`Le code de ${script.title} n'est pas un raccourci installable.`, 'error');
      return;
    }

    const copied = await copyToClipboard(bookmarklet);
    const label = `Grimoire · ${script.title}`;

    statusLine.textContent = copied
      ? `Code de ${script.title} copié. Dans l'onglet qui s'ouvre : nom « ${label} », colle le code dans « URL cible », puis Sauvegarder.`
      : `Copie automatique refusée : copie le code affiché ci-dessous pour ${script.title}.`;

    if (!copied) {
      const area = document.createElement('textarea');
      area.readOnly = true;
      area.value = bookmarklet;
      area.style.cssText = 'width:calc(100% - 36px);margin:8px 18px;height:70px;font-size:10px;';
      statusLine.after(area);
      area.select();
    }

    window.open(quickbarUrl(), '_blank', 'noopener');
  }

  function runScript(script) {
    const url = scriptUrlFrom(script.code);
    if (!url) {
      notify(`Aucune source HTTPS valide pour ${script.title}.`, 'error');
      return;
    }
    if (!window.jQuery?.getScript) {
      notify('Le chargeur jQuery de Guerre Tribale est indisponible.', 'error');
      return;
    }
    applyKnownConfiguration(script);
    closeLauncher();
    window.jQuery.getScript(url)
      .done(() => notify(`${script.title} a été chargé.`, 'success'))
      .fail(() => notify(`Impossible de charger ${script.title}.`, 'error'));
  }

  function render(library) {
    if (!library || !Array.isArray(library.scripts) || !Array.isArray(library.categories)) {
      notify('La bibliothèque du Grimoire est invalide.', 'error');
      return;
    }

    const safeId = /^[a-z0-9-]+$/;
    const categories = library.categories.filter((category) => safeId.test(String(category.id)));
    const categoryIds = new Set(categories.map((category) => category.id));
    const scripts = library.scripts.filter((script) => safeId.test(String(script.id)) && categoryIds.has(script.category));

    const overlay = document.createElement('div');
    overlay.id = 'grimoire-gt-launcher';
    overlay.style.cssText = 'position:fixed;z-index:999999;inset:0;background:rgba(20,15,11,.72);display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif;';

    const panel = document.createElement('section');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Lanceur Grimoire GT');
    panel.style.cssText = 'width:min(620px,100%);max-height:85vh;overflow:auto;background:#f3e7c5;border:3px solid #6d3c20;box-shadow:0 18px 60px #0008;color:#3b291c;';

    const header = document.createElement('header');
    header.style.cssText = 'position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:15px;padding:15px 18px;background:#35241a;color:#f5dfae;border-bottom:3px solid #9b642c;';
    const title = document.createElement('strong');
    title.textContent = 'Le Grimoire GT — Lanceur';
    title.style.cssText = 'font-size:17px;';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Fermer');
    close.style.cssText = 'width:34px;height:34px;color:#fff;background:#7e2d23;border:1px solid #b06b4e;cursor:pointer;font-size:22px;';
    close.addEventListener('click', closeLauncher);
    header.append(title, close);
    panel.appendChild(header);

    const intro = document.createElement('p');
    intro.textContent = '« Lancer » exécute le script pour cette session seulement. « Copier + ouvrir » copie le code et ouvre la page « Barre de raccourcis » : c’est toi qui colles et enregistres l’entrée. Vérifie que le script est autorisé sur ton marché avant de l’utiliser.';
    intro.style.cssText = 'margin:0;padding:16px 18px 8px;color:#6c5845;font-size:12px;line-height:1.5;';
    panel.appendChild(intro);

    const statusLine = document.createElement('p');
    statusLine.setAttribute('role', 'status');
    statusLine.setAttribute('aria-live', 'polite');
    statusLine.style.cssText = 'margin:0;padding:0 18px;min-height:16px;color:#7e2d23;font-size:11px;';
    panel.appendChild(statusLine);

    categories.forEach((category) => {
      const categoryScripts = scripts.filter((script) => script.category === category.id);
      if (!categoryScripts.length) return;
      const heading = document.createElement('h3');
      heading.textContent = `${category.icon || '◆'} ${category.label || 'Autre'}`;
      heading.style.cssText = 'margin:12px 18px 7px;color:#7e2d23;font-size:12px;text-transform:uppercase;letter-spacing:.08em;';
      panel.appendChild(heading);

      const list = document.createElement('div');
      list.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;padding:0 18px 10px;';
      categoryScripts.forEach((script) => {
        const card = document.createElement('div');
        card.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:12px;background:#fff8e7;border:1px solid #c9ad7d;';

        const name = document.createElement('strong');
        name.textContent = script.title || script.id;
        name.style.cssText = 'font-size:13px;';
        const description = document.createElement('span');
        description.textContent = script.description || '';
        description.style.cssText = 'flex:1;color:#776653;font-size:10px;line-height:1.35;';

        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:6px;';

        const runButton = document.createElement('button');
        runButton.type = 'button';
        runButton.textContent = 'Lancer';
        runButton.style.cssText = 'flex:1;padding:7px;color:#3b291c;background:#e4d2aa;border:1px solid #b8975f;cursor:pointer;font-size:11px;';
        runButton.addEventListener('click', () => runScript(script));

        const installButton = document.createElement('button');
        installButton.type = 'button';
        installButton.textContent = 'Copier + ouvrir';
        installButton.style.cssText = 'flex:1;padding:7px;color:#f5dfae;background:#5c7e3a;border:1px solid #3f5a26;cursor:pointer;font-size:11px;';
        installButton.addEventListener('click', async () => {
          installButton.disabled = true;
          installButton.textContent = '…';
          try {
            await installToQuickbar(script, statusLine);
          } finally {
            installButton.disabled = false;
            installButton.textContent = 'Copier + ouvrir';
          }
        });

        actions.append(runButton, installButton);
        card.append(name, description, actions);
        list.appendChild(card);
      });
      panel.appendChild(list);
    });

    const footer = document.createElement('footer');
    footer.textContent = 'Powered by DEADLY/NOPNUT · Bibliothèque chargée depuis le Grimoire';
    footer.style.cssText = 'padding:12px 18px;color:#8b745d;background:#e4d2aa;border-top:1px solid #c8aa72;font-size:9px;text-align:center;text-transform:uppercase;letter-spacing:.08em;';
    panel.appendChild(footer);
    overlay.appendChild(panel);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeLauncher(); });
    document.body.appendChild(overlay);
  }

  const safeBase = validBase(baseUrl);
  if (!safeBase || !window.jQuery?.getScript) {
    notify('Le lanceur nécessite une URL HTTPS valide et doit être ouvert depuis Guerre Tribale.', 'error');
    return;
  }

  window.jQuery.getScript(new URL('data/scripts-data.js', safeBase).href)
    .done(() => render(window.GT_LIBRARY))
    .fail(() => notify('Impossible de charger la bibliothèque du Grimoire.', 'error'));
})();
