/* Copyright (c) 2026 Lakshmikantha, to the extent rights subsist and are owned. See LICENSE.txt. */
(() => {
  'use strict';
  const html = document.documentElement;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const base = document.body.dataset.base || './';
  const data = window.SOLENNE || { collections: [] };
  const residences = data.collections.flatMap(c => c.residences.map(r => ({ ...r, collection: c.slug, collectionName: c.name, annualCareInr: c.annualCareInr, description: c.description, image: c.image })));
  const byCode = new Map(residences.map(r => [r.code, r]));
  const int = n => new Intl.NumberFormat('en-IN').format(n);
  const price = n => '₹' + (n / 10000000).toFixed(2) + ' crore';
  const money = n => '₹' + int(n);
  const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const motionOff = () => reduced.matches || connection?.saveData === true || html.dataset.motion === 'off';
  let opener = null;
  let toastTimer;
  let themeTransition = null;
  let themeRevision = 0;
  const uiAnimations = new Set();
  const closingDialogs = new WeakSet();
  html.classList.add('has-js');

  function animateUI(element, frames, options = {}) {
    if (!element?.animate || motionOff() || document.hidden) return null;
    const animation = element.animate(frames, { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards', ...options });
    uiAnimations.add(animation);
    animation.finished.then(() => { uiAnimations.delete(animation); animation.cancel(); }, () => uiAnimations.delete(animation));
    return animation;
  }

  function settleUI() {
    uiAnimations.forEach(animation => animation.cancel());
    uiAnimations.clear();
    themeTransition?.skipTransition();
    themeTransition = null;
  }

  function announce(message) {
    const box = $('#toast');
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.hidden = true; }, 4200);
  }

  function decorateLinks() {
    $$('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('#') || a.hasAttribute('download')) return;
      let url;
      try { url = new URL(raw, location.href); } catch { return; }
      if (url.origin !== location.origin || !/^(https?:|file:)$/.test(url.protocol) || !/\.html$|\/$/.test(url.pathname)) return;
      html.dataset.theme === 'night' ? url.searchParams.set('view', 'night') : url.searchParams.delete('view');
      html.dataset.motion === 'off' ? url.searchParams.set('motion', 'off') : url.searchParams.delete('motion');
      // Preserve relative file portability while carrying visual preferences.
      a.setAttribute('href', raw.split(/[?#]/)[0] + (url.search ? url.search : '') + url.hash);
    });
  }

  function setTheme(theme, write = true) {
    const next = theme === 'night' ? 'night' : 'day';
    html.dataset.theme = next;
    $$('button[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === next)));
    $$('img[data-day-src]').forEach(img => {
      const src = img.dataset[next + 'Src'];
      const set = img.dataset[next + 'Set'];
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
      if (set && img.getAttribute('srcset') !== set) img.setAttribute('srcset', set);
      if (img.dataset[next + 'Alt']) img.alt = img.dataset[next + 'Alt'];
    });
    if (write) {
      const url = new URL(location.href);
      next === 'night' ? url.searchParams.set('view', 'night') : url.searchParams.delete('view');
      history.replaceState(null, '', url);
    }
    decorateLinks();
  }

  function setMotion(off, write = true) {
    html.dataset.motion = off ? 'off' : 'on';
    if (motionOff()) settleUI();
    $$('[data-motion-toggle]').forEach(button => {
      const automatic = reduced.matches || connection?.saveData === true;
      button.textContent = automatic ? 'Reduced motion' : off ? 'Resume motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(automatic || off));
      button.disabled = automatic;
    });
    if (write) {
      const url = new URL(location.href);
      off ? url.searchParams.set('motion', 'off') : url.searchParams.delete('motion');
      history.replaceState(null, '', url);
    }
    decorateLinks();
    window.dispatchEvent(new Event('solenne-motion-change'));
  }

  function chooseTheme(theme) {
    const revision = ++themeRevision;
    themeTransition?.skipTransition();
    if (motionOff() || !document.startViewTransition) { setTheme(theme); return; }
    const transition = document.startViewTransition(() => { if (revision === themeRevision) setTheme(theme); });
    themeTransition = transition;
    transition.finished.catch(() => {}).finally(() => { if (themeTransition === transition) themeTransition = null; });
  }
  $$('button[data-theme-choice]').forEach(button => button.addEventListener('click', () => chooseTheme(button.dataset.themeChoice)));
  $$('[data-motion-toggle]').forEach(button => button.addEventListener('click', () => setMotion(html.dataset.motion !== 'off')));
  reduced.addEventListener('change', () => setMotion(html.dataset.motion === 'off', false));
  connection?.addEventListener?.('change', () => setMotion(html.dataset.motion === 'off', false));
  const initial = new URLSearchParams(location.search);
  setMotion(initial.get('motion') === 'off', false);
  setTheme(initial.get('view'), false);

  function openDialog(dialog, source) {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    $$('dialog[open]').forEach(d => d.close());
    opener = source || document.activeElement;
    dialog.showModal();
    document.body.classList.add('overlay-open');
    if (!motionOff()) {
      if (dialog.classList.contains('menu-dialog')) {
        animateUI(dialog, [{ opacity: 0, transform: 'translateY(16px) scale(.986)' }, { opacity: 1, transform: 'none' }], { duration: 600 });
        $$('nav a', dialog).forEach((link, i) => animateUI(link, [{ opacity: 0, transform: 'translateY(25px)', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0)' }], { duration: 850, delay: 80 + i * 45 }));
        animateUI($('.menu-art figure', dialog), [{ opacity: 0, transform: 'translateY(20px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: 120 });
        animateUI($('.menu-bottom', dialog), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 200 });
      } else animateUI(dialog, [{ opacity: 0, transform: 'translateY(24px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 520 });
    }
    return true;
  }

  function closeDialog(dialog) {
    if (!dialog.open || closingDialogs.has(dialog)) return;
    closingDialogs.add(dialog);
    uiAnimations.forEach(animation => {
      const target = animation.effect?.target;
      if (target === dialog || target && dialog.contains(target)) animation.cancel();
    });
    const finish = () => { closingDialogs.delete(dialog); if (dialog.open) dialog.close(); };
    const animation = animateUI(dialog, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px) scale(.992)' }], { duration: 220, easing: 'cubic-bezier(.4,0,1,1)' });
    if (animation) animation.finished.then(finish, finish);
    else finish();
  }

  $$('dialog').forEach(dialog => {
    dialog.addEventListener('focusin', event => uiAnimations.forEach(animation => {
      const target = animation.effect?.target;
      if (target === dialog || target === event.target || target?.contains(event.target)) animation.cancel();
    }));
    $$('[data-close-dialog]', dialog).forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('close', () => {
      if (!$('dialog[open]')) document.body.classList.remove('overlay-open');
      if (dialog.id === 'menu') $('[data-open-menu]')?.setAttribute('aria-expanded', 'false');
      if ($('dialog[open]')) return;
      const target = [opener, $('[data-filter="collection"]'), $('[data-open-menu]')].find(el => el?.isConnected && !el.disabled && !el.closest('[hidden]') && el.getClientRects().length);
      target?.focus();
    });
    dialog.addEventListener('click', event => { if (event.target === dialog && !dialog.classList.contains('menu-dialog') && !dialog.classList.contains('gallery-dialog')) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog);
    } });
  });
  $('[data-open-menu]')?.addEventListener('click', event => {
    if (openDialog($('#menu'), event.currentTarget)) event.currentTarget.setAttribute('aria-expanded', 'true');
  });

  // Card results exist in the HTML as the no-JavaScript fallback.
  const finder = $('#residence-finder');
  const filterNames = ['collection', 'bedrooms', 'status', 'sort'];
  const selected = new Set();
  function syncFilterInputs() {
    if (!finder) return;
    const params = new URLSearchParams(location.search);
    filterNames.forEach(name => {
      const control = $('[data-filter="' + name + '"]');
      const requested = params.get(name) || (name === 'sort' ? 'collection' : 'all');
      control.value = [...control.options].some(o => o.value === requested) ? requested : name === 'sort' ? 'collection' : 'all';
    });
  }
  function filterResults(write = false) {
    if (!finder) return;
    const values = Object.fromEntries(filterNames.map(name => [name, $('[data-filter="' + name + '"]').value]));
    const matching = residences.filter(r => (values.collection === 'all' || r.collection === values.collection) && (values.bedrooms === 'all' || String(r.bedrooms) === values.bedrooms) && (values.status === 'all' || r.status === values.status));
    if (values.sort === 'price-low') matching.sort((a, b) => a.totalInr - b.totalInr || a.code.localeCompare(b.code));
    if (values.sort === 'price-high') matching.sort((a, b) => b.totalInr - a.totalInr || a.code.localeCompare(b.code));
    if (values.sort === 'area-high') matching.sort((a, b) => b.interiorSqft - a.interiorSqft || a.code.localeCompare(b.code));
    const visible = new Set(matching.map(r => r.code));
    $$('[data-residence-card]').forEach(card => { card.hidden = !visible.has(card.dataset.residenceCard); });
    matching.forEach(r => finder.append($('[data-residence-card="' + r.code + '"]')));
    $('#result-count').textContent = matching.length + ' residences';
    $('#empty-results').hidden = matching.length > 0;
    window.dispatchEvent(new Event('solenne-filter-change'));
    if (write) {
      const url = new URL(location.href);
      filterNames.forEach(name => values[name] === (name === 'sort' ? 'collection' : 'all') ? url.searchParams.delete(name) : url.searchParams.set(name, values[name]));
      history.pushState(null, '', url);
    }
  }
  if (finder) {
    syncFilterInputs(); filterResults();
    $$('[data-filter]').forEach(control => control.addEventListener('change', () => filterResults(true)));
    $$('[data-reset-filters]').forEach(button => button.addEventListener('click', () => {
      filterNames.forEach(name => { $('[data-filter="' + name + '"]').value = name === 'sort' ? 'collection' : 'all'; });
      filterResults(true);
      $('[data-filter="collection"]').focus();
    }));
  }
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(location.search);
    setMotion(params.get('motion') === 'off', false); setTheme(params.get('view'), false);
    syncFilterInputs(); filterResults();
  });

  function specs(r) {
    return [['Interior area', int(r.interiorSqft) + ' sq ft'], ['Private outdoor area', int(r.outdoorSqft) + ' sq ft'], ['Bedrooms', r.bedrooms], ['Orientation', r.orientation], ['Illustrative total price', price(r.totalInr)], ['Illustrative annual care', money(r.annualCareInr)], ['Sample status', r.status]].map(([label, value]) => '<div><dt>' + safe(label) + '</dt><dd>' + safe(value) + '</dd></div>').join('');
  }

  $$('[data-quick-view]').forEach(button => button.addEventListener('click', () => {
    const r = byCode.get(button.dataset.quickView);
    if (!r) return;
    const dialog = $('#residence-dialog');
    $('#residence-title').textContent = r.collectionName + ' ' + r.code;
    $('#residence-summary').textContent = r.description;
    $('#residence-specs').innerHTML = specs(r);
    $('#residence-plan').src = base + 'assets/images/plan-' + r.collection + '.svg';
    $('#residence-plan').alt = r.collectionName + ' illustrative concept diagram, not a construction plan';
    $('#residence-full-page').href = base + 'residences/' + r.code.toLowerCase() + '/index.html';
    $('#residence-viewing').href = base + 'private-viewing/index.html?residence=' + encodeURIComponent(r.code);
    decorateLinks();
    openDialog(dialog, button);
  }));

  function updateCompare() {
    $$('[data-compare]').forEach(button => {
      const active = selected.has(button.dataset.compare);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Added' : 'Compare';
    });
    const bar = $('#compare-bar');
    if (!bar) return;
    bar.hidden = selected.size === 0;
    $('#compare-summary').textContent = selected.size + ' of 3 selected · ' + [...selected].join(', ');
    $('#open-comparison').disabled = selected.size < 2;
    $('#open-comparison').textContent = selected.size < 2 ? 'Choose one more' : 'Compare homes';
  }
  $$('[data-compare]').forEach(button => button.addEventListener('click', () => {
    const code = button.dataset.compare;
    if (!byCode.has(code)) return;
    if (selected.has(code)) selected.delete(code);
    else if (selected.size < 3) selected.add(code);
    else { announce('Compare up to three residences. Remove one before adding another.'); return; }
    updateCompare();
  }));
  $('#clear-comparison')?.addEventListener('click', () => { selected.clear(); updateCompare(); $('[data-filter="collection"]')?.focus(); announce('Comparison cleared.'); });
  function renderComparison() {
    const rows = [...selected].map(code => byCode.get(code));
    if (rows.length < 2) {
      $('#comparison-content').innerHTML = '<p class="sheet-lead">Choose at least two residences to compare. Close this window and add another home.</p>';
      return;
    }
    const fields = [['Collection', r => r.collectionName], ['Interior area', r => int(r.interiorSqft) + ' sq ft'], ['Outdoor area', r => int(r.outdoorSqft) + ' sq ft'], ['Bedrooms', r => r.bedrooms], ['Orientation', r => r.orientation], ['Illustrative total', r => price(r.totalInr)], ['Annual care', r => money(r.annualCareInr)], ['Sample status', r => r.status]];
    $('#comparison-content').innerHTML = '<div class="comparison-table-wrap" tabindex="0" role="region" aria-label="Residence comparison, scroll horizontally on a small screen"><table class="comparison-table"><caption class="sr-only">Comparison of selected fictional residences</caption><thead><tr><th scope="col">Your shortlist</th>' + rows.map(r => '<th scope="col">' + safe(r.code) + '<button type="button" data-remove-compare="' + safe(r.code) + '" aria-label="Remove ' + safe(r.code) + ' from comparison">Remove</button></th>').join('') + '</tr></thead><tbody>' + fields.map(([name, value]) => '<tr><th scope="row">' + safe(name) + '</th>' + rows.map(r => '<td>' + safe(value(r)) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div><p class="fine muted">Interior and private outdoor areas are separate. Prices and annual care are invented demonstration figures. No property is offered.</p>';
    $$('[data-remove-compare]').forEach(button => button.addEventListener('click', () => {
      selected.delete(button.dataset.removeCompare); updateCompare(); renderComparison(); $('#comparison-title').focus();
    }));
  }
  $('#open-comparison')?.addEventListener('click', event => { if (selected.size < 2) return; renderComparison(); openDialog($('#comparison-dialog'), event.currentTarget); });

  const gallery = window.SOLENNE_GALLERY || [];
  let galleryIndex = 0;
  let galleryRevision = 0;
  function paintGallery(direction = 0) {
    if (!gallery.length) return;
    galleryIndex = (galleryIndex + gallery.length) % gallery.length;
    const item = gallery[galleryIndex];
    const img = $('#gallery-image');
    const revision = ++galleryRevision;
    img.getAnimations().forEach(animation => animation.cancel());
    img.src = base + 'assets/images/' + item.image + '.webp'; img.alt = item.alt;
    $('#gallery-caption').textContent = item.caption;
    $('#gallery-position').textContent = String(galleryIndex + 1) + ' of ' + String(gallery.length);
    if (direction && !motionOff()) {
      const enter = () => {
        if (revision !== galleryRevision || !$('#gallery-dialog').open) return;
        animateUI(img, [{ opacity: .3, transform: 'translateX(' + direction * 22 + 'px) scale(1.018)' }, { opacity: 1, transform: 'none' }], { duration: 640 });
      };
      if (img.decode) img.decode().then(enter, enter); else enter();
    }
  }
  $$('[data-gallery-open]').forEach(button => button.addEventListener('click', () => {
    galleryIndex = Number(button.dataset.galleryOpen); paintGallery(); openDialog($('#gallery-dialog'), button);
  }));
  $$('[data-gallery-step]').forEach(button => button.addEventListener('click', () => { const d = Number(button.dataset.galleryStep); galleryIndex += d; paintGallery(d); }));
  $('#gallery-dialog')?.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const d = event.key === 'ArrowRight' ? 1 : -1; galleryIndex += d; paintGallery(d); }
  });

  const form = $('#viewing-form');
  if (form) {
    const choice = $('#viewing-residence');
    const requested = initial.get('residence');
    if (byCode.has(requested)) choice.value = requested;
    else if (requested) $('#selection-note').textContent = 'That residence code is not in this fictional collection. Please choose a home below.';
    const selectionLabel = () => choice.value && byCode.has(choice.value) ? byCode.get(choice.value).collectionName + ' ' + choice.value : 'a general collection introduction';
    function showSelection() { $('#selection-note').textContent = 'Selected: ' + selectionLabel() + '.'; }
    if (!requested || byCode.has(requested)) showSelection();
    choice.addEventListener('change', showSelection);
    form.addEventListener('submit', event => { event.preventDefault(); submitPreview(); });
    function submitPreview() {
      if (!form.reportValidity()) return;
      const selectedLabel = selectionLabel();
      $('#form-fields').hidden = true;
      $('#form-success').hidden = false;
      $('#success-selection').textContent = 'Viewing preview for ' + selectedLabel + '. Nothing has been sent or booked.';
      $('#success-heading').focus();
      // All input remains only in this live document. No persistence or transport.
    }
    $('#preview-viewing').addEventListener('click', submitPreview);
    $('#sample-fill').addEventListener('click', () => {
      $('#viewer-name').value = 'Jordan Avery';
      $('#viewer-email').value = 'jordan@example.com';
      $('#viewer-interest').value = 'Architecture and daily life';
      $('#viewer-message').value = 'I would like to see the living spaces and compare the garden options.';
      $('#viewer-consent').checked = true;
      $('#form-feedback').textContent = 'Sample details added. Review them, then continue.';
    });
    $('#try-again').addEventListener('click', () => {
      const selection = choice.value;
      form.reset(); choice.value = selection;
      $('#form-fields').hidden = false; $('#form-success').hidden = true;
      $('#form-feedback').textContent = 'Ready for another preview.';
      showSelection(); $('#viewer-name').focus();
    });
    $('#form-fields').disabled = false;
    $('#preview-viewing').disabled = false;
    $('#sample-fill').disabled = false;
  }

  // A continuous curtain: outgoing page rises into the same incoming reveal.
  let navigating = false;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download') || motionOff()) return;
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || url.pathname === location.pathname && url.search === location.search) return;
    const veil = $('#route-veil');
    if (!veil?.animate) return;
    if (navigating) { event.preventDefault(); return; }
    event.preventDefault(); navigating = true;
    $$('dialog[open]').forEach(closeDialog);
    let finished = false;
    const finish = () => { if (finished) return; finished = true; if (navigating) location.href = url.href; };
    const animation = veil.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
    uiAnimations.add(animation);
    const complete = () => { uiAnimations.delete(animation); finish(); };
    animation.finished.then(complete, complete);
    setTimeout(finish, 750);
  });
  animateUI($('#route-veil'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 680, easing: 'cubic-bezier(.22,1,.36,1)' });
  window.addEventListener('pagehide', () => { navigating = false; settleUI(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settleUI(); });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    navigating = false;
    $('#route-veil')?.getAnimations().forEach(a => a.cancel());
  });
})();
