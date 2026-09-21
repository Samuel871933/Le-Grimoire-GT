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
    intro.textContent = 'Choisis un script à lancer. Vérifie qu’il est autorisé sur ton marché et contrôle toujours les données avant validation.';
    intro.style.cssText = 'margin:0;padding:16px 18px 8px;color:#6c5845;font-size:12px;line-height:1.5;';
    panel.appendChild(intro);

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
        const button = document.createElement('button');
        button.type = 'button';
        button.style.cssText = 'padding:12px;text-align:left;color:#3b291c;background:#fff8e7;border:1px solid #c9ad7d;cursor:pointer;';
        const name = document.createElement('strong');
        name.textContent = script.title || script.id;
        name.style.cssText = 'display:block;margin-bottom:4px;font-size:13px;';
        const description = document.createElement('span');
        description.textContent = script.description || '';
        description.style.cssText = 'display:block;color:#776653;font-size:10px;line-height:1.35;';
        button.append(name, description);
        button.addEventListener('click', () => {
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
        });
        list.appendChild(button);
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
