/* Original scroll choreography. Copyright (c) 2026 Lakshmikantha. See LICENSE.txt. */
(() => {
  'use strict';

  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 801px)');
  const tall = matchMedia('(min-height: 621px)');
  const connection = navigator.connection;
  const $ = selector => document.querySelector(selector);
  const sequencePage = document.body.classList.contains('sequence-page');
  const opening = $('.opening');
  const openingStage = $('.opening-stage');
  const hero = $('.hero');
  const heroMedia = $('.hero-media');
  const heroImage = heroMedia?.querySelector('.hero-day img, img');
  const heroNight = heroMedia?.querySelector('.hero-night');
  const heroTitle = $('.hero-title');
  const heroLetters = [...(heroTitle?.querySelectorAll('.letter') || [])];
  const heroSmall = heroTitle?.querySelector('small');
  const heroBottom = $('.hero-bottom');
  const story = $('.chapter-run');
  const chapterStage = $('.chapter-stage');
  const chapterControls = $('.chapter-progress');
  const chapters = [...document.querySelectorAll('.chapter')];
  const sceneButtons = [...document.querySelectorAll('[data-chapter-to]')];
  const scenes = chapters.map(element => ({
    element,
    figure: element.querySelector('figure'),
    image: element.querySelector('figure img'),
    heading: element.querySelector('h2'),
    paragraph: element.querySelector('p'),
    letters: [...element.querySelectorAll('.scene-letter')]
  }));
  const featureField = $('.feature-field');
  const featureStage = $('.feature-stage');
  const featureBackdrop = $('.feature-backdrop img');
  const featureIntro = $('.feature-intro');
  const featureCards = [...document.querySelectorAll('.feature-card')];
  const interlude = $('.interlude');
  const interludeImage = interlude?.querySelector(':scope > img');
  const journey = $('.journey');
  const journeyStage = $('.journey-stage');
  const journeyTrack = $('.journey-track');
  const journeyObjects = [...(journeyTrack?.children || [])].map(element => ({ element, left: 0, width: 0 }));
  const deck = $('.collection-deck');
  const deckStage = $('.deck-stage');
  const deckHeading = $('.deck-heading');
  const deckCards = [...document.querySelectorAll('.deck-card')].map(element => ({ element, image: element.querySelector('img') }));
  const amenitySequence = $('.amenity-sequence');
  const amenityStage = $('.amenity-stage');
  const amenities = $('.amenities');
  const amenityControls = $('.amenity-controls');
  const amenityCaption = $('.amenity-caption');
  const amenityImages = [...document.querySelectorAll('.amenity-images > img')];
  const amenityButtons = [...document.querySelectorAll('[data-amenity]')];
  const sanctuary = $('.sanctuary');
  const sanctuaryTitle = sanctuary?.querySelector('h2');
  const sanctuaryCopy = sanctuary?.querySelector('p');
  const portraitReveal = $('.portrait-reveal');
  const portraitStage = $('.portrait-stage');
  const portraitFrame = $('.portrait-frame');
  const portraitImage = portraitFrame?.querySelector('img');
  const portraitCopy = $('.portrait-copy');
  const threshold = $('.threshold');
  const thresholdStage = $('.threshold-stage');
  const thresholdWindow = $('.threshold-window');
  const thresholdImage = $('.threshold-view > img');
  const thresholdDoors = [...document.querySelectorAll('.threshold-door')];
  const thresholdWord = $('.threshold-word');
  const thresholdCopy = $('.threshold-copy');
  const interiorImages = [...document.querySelectorAll('.interior-gallery > figure > img')];
  const interiorButtons = [...document.querySelectorAll('button[data-interior]')];
  const selectionImages = [...amenityImages, ...interiorImages];
  const finale = $('.finale');
  const finaleStage = $('.finale-stage');
  const finaleFrame = $('.finale-frame');
  const finaleLeft = $('.finale-left');
  const finaleRight = $('.finale-right');
  const finaleTitle = finaleStage?.querySelector(':scope > h2');
  const finaleCopy = finaleStage?.querySelector(':scope > p');
  const gallery = $('.gallery-rail');
  const galleryStage = $('.gallery-rail-stage');
  const galleryTrack = $('.gallery-rail-track');
  const galleryItems = [...(galleryTrack?.querySelectorAll('.gallery-item') || [])].map(element => ({ element, left: 0, width: 0, shift: 0 }));
  const galleryButtons = [...document.querySelectorAll('[data-gallery-rail-step]')];
  const galleryMeter = $('.gallery-rail-meter > span');
  const pinSelector = '.opening,.feature-field,.journey,.collection-deck,.amenity-sequence,.portrait-reveal,.threshold,.finale,.gallery-rail';
  const pinOwners = [opening, featureField, journey, deck, amenitySequence, portraitReveal, threshold, finale, gallery].filter(Boolean);
  const footer = $('.footer');
  const footerWord = $('.footer-word');
  const masthead = $('.masthead');
  const main = $('main');
  const clamp = value => Math.max(0, Math.min(1, value));
  const phase = (from, to, value) => clamp((value - from) / (to - from));
  const smooth = (from, to, value) => {
    const t = phase(from, to, value);
    return t * t * (3 - 2 * t);
  };
  const motionOff = () => reduce.matches || html.dataset.motion === 'off' || connection?.saveData === true;
  const track = () => ({ value: null, target: 0, active: false, dirty: true });
  const progress = { opening: track(), hero: track(), features: track(), journey: track(), deck: track(), amenity: track(), portrait: track(), threshold: track(), finale: track(), gallery: track(), interlude: track(), footer: track() };
  const reveals = new Set();
  const titles = new Map();
  const media = new Map();
  const mediaFrames = new Map();
  const visibleMedia = new Set();
  const titleSelector = [
    'h1[data-reveal]', 'h2[data-reveal]', 'h3[data-reveal]', '.page-head h1',
    '.case-head h1', '.residence-hero h1', '.manifesto h2', '.collection-head h2',
    '.editorial-title h2', '.split-editorial h2', '.ritual h2', '.orientation h2',
    '.case-chapter h2', '.essay h2', '.viewing-aside h3', '.footer-top h2'
  ].join(',');
  const copySelector = [
    '.page-head .lead', '.head-bottom', '.case-head-bottom', '.manifesto-copy',
    '.collection-head > p', '.split-editorial > div > p', '.text-columns > p',
    '.ritual > div > p', '.orientation-list > div', '.case-two > div',
    '.case-list > article', '.case-chapter > div > p', '.essay section > p',
    '.viewing-aside > p', '.portfolio-section .trust-line', '.footer-top',
    '.collection-bridge > p', '.project-close > p'
  ].join(',');
  const mediaSelector = [
    'figure.reveal-image img', '.wide-image img', '.collection-row figure img',
    '.residence-card figure img', '.article-card figure img', '.gallery-item figure img',
    '.orientation > figure img', '.ritual figure img', '.split-editorial figure img',
    '.viewing-aside figure img', '.chapter figure img', '.journey figure img',
    '.collection-bridge > figure img', '.detail-image img', '.deck-card figure img', '.threshold-view img'
  ].join(',');
  // These headings keep their CSS compression; their scene or inner letters own motion.
  const staticSceneTitle = '.hero-title,.chapter h2,.interlude h2,.journey h2,.sanctuary h2,.collection-bridge > h2,.collection-deck h2,.threshold h2,.interior-sequence > h2,.finale h2';
  const managedRegions = new Map([heroBottom, chapterControls, ...chapters, amenityControls, sanctuary, thresholdCopy].filter(Boolean).map(element => [element, {
    ariaHidden: element.getAttribute('aria-hidden'), inert: element.inert
  }]));
  let enabled = false;
  let pinned = false;
  let activeScene = -1;
  let frame = 0;
  let lastFrame = 0;
  let measureDirty = true;
  let snapNext = true;
  let pageActive = true;
  let lastScroll = scrollY;
  let headerScrolled = null;
  let entranceStart = null;
  let entranceDuration = 1400;
  let geometryDirty = true;
  let journeyTravel = 0;
  let journeyWidth = 0;
  let deckWidth = 0;
  let deckStep = 0;
  let thresholdHeight = innerHeight;
  let galleryTravel = 0;
  let galleryWidth = 0;
  let galleryCurrent = 0;
  let galleryRequested = null;
  let heroExit = innerHeight;
  let openingSize = { width: innerWidth, height: innerHeight };
  let amenitySize = { width: innerWidth, height: innerHeight };
  let finaleHeight = innerHeight;
  let navigationAnchor = null;
  let configuring = false;
  let hasConfigured = false;
  let pendingPointerFocus = null;
  let pointerFocused = null;

  function clear(element, properties) {
    if (element) properties.forEach(property => element.style.removeProperty(property));
  }

  function select(root, selector) {
    const result = [...root.querySelectorAll(selector)];
    if (root.matches?.(selector)) result.unshift(root);
    return result;
  }

  // Preserve emphasis, explicit line breaks and the original accessible heading name.
  function wrapTitle(element) {
    let record = titles.get(element);
    if (!record) {
      if (element.querySelector('a,button,input,select,textarea') || element.hasAttribute('aria-labelledby')) return;
      record = { label: element.getAttribute('aria-label'), words: [] };
      titles.set(element, record);
    }
    if (record.words.length) return;
    const readable = element.cloneNode(true);
    readable.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    if (record.label === null) element.setAttribute('aria-label', readable.textContent.replace(/\s+/g, ' ').trim());
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!node.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part || /^\s+$/.test(part)) { fragment.append(part); return; }
        const word = document.createElement('span');
        const inner = document.createElement('span');
        word.className = 'reveal-word';
        inner.className = 'reveal-word-inner';
        word.style.setProperty('--word-index', String(Math.min(record.words.length, 12)));
        word.setAttribute('aria-hidden', 'true');
        inner.textContent = part;
        word.append(inner);
        fragment.append(word);
        record.words.push(word);
      });
      node.replaceWith(fragment);
    });
    element.classList.add('motion-title');
  }

  function unwrapTitle(element, record) {
    record.words.forEach(word => word.replaceWith(word.textContent));
    record.words = [];
    element.normalize();
    record.label === null ? element.removeAttribute('aria-label') : element.setAttribute('aria-label', record.label);
    element.classList.remove('motion-title');
  }

  function reveal(element, immediate = false) {
    if (immediate) element.classList.add('reveal-immediate');
    element.classList.add('in-view');
    revealObserver?.unobserve(element);
  }

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' }) : null;

  function prepareReveal(element) {
    const ownedByPin = pinned && element.closest(pinSelector);
    const staticTitle = sequencePage && element.matches(staticSceneTitle);
    if (!enabled || !revealObserver || ownedByPin || staticTitle) {
      const title = titles.get(element);
      if (title?.words.length) unwrapTitle(element, title);
      reveal(element, true);
      element.classList.remove('reveal-ready', 'section-reveal');
      clear(element, ['--reveal-delay']);
      return;
    }
    element.classList.add('reveal-ready');
    if (element.matches(titleSelector)) wrapTitle(element);
    // Portal pseudo leaves own their frame reveal; the image can still drift.
    if (!element.classList.contains('motion-title') && !element.classList.contains('image-portal')) element.classList.add('section-reveal');
    else element.classList.remove('section-reveal');
    const group = element.parentElement;
    const staggered = group?.matches('.collection-list,.residence-grid,.article-grid,.gallery-grid,.principles,.case-list,.case-two');
    const index = staggered ? [...group.children].filter(child => !child.hidden).indexOf(element) : 0;
    element.style.setProperty('--reveal-delay', (Math.max(0, index) % 3) * (wide.matches ? 55 : 20) + 'ms');
    if (element.classList.contains('in-view') || element.closest('[hidden]')) revealObserver.unobserve(element);
    else revealObserver.observe(element);
  }

  const driftObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const item = mediaFrames.get(entry.target);
      if (!item || !item.enabled) return;
      if (entry.isIntersecting) {
        item.state.value = null;
        item.state.dirty = true;
        visibleMedia.add(item);
      } else {
        visibleMedia.delete(item);
        item.state.active = false;
      }
      item.image.classList.toggle('is-drifting', entry.isIntersecting);
    });
    invalidate();
  }, { rootMargin: '18% 0px', threshold: 0 }) : null;

  function prepareMedia(item) {
    const allowed = enabled && !!driftObserver && (!item.inPin || !pinned);
    if (item.enabled === allowed) return;
    item.enabled = allowed;
    item.image.classList.toggle('image-drift', allowed);
    item.state.value = null;
    item.state.dirty = true;
    if (allowed) driftObserver.observe(item.frame);
    else {
      driftObserver?.unobserve(item.frame);
      visibleMedia.delete(item);
      item.image.classList.remove('is-drifting');
      clear(item.image, ['transform']);
    }
  }

  function registerContent(root = document) {
    select(root, '[data-reveal],.residence-card,' + titleSelector + ',' + copySelector).forEach(element => {
      if (reveals.has(element) || element.closest('.hero,.chapter,.aperture,dialog,form')) return;
      if (element.matches('.residence-card')) element.classList.add('kinetic-card');
      reveals.add(element);
      prepareReveal(element);
    });
    select(root, mediaSelector).forEach(image => {
      if (media.has(image) || image.closest('dialog,.hero,.amenity-images,.interior-gallery,.finale,.floorplan')) return;
      const frameElement = image.closest('.detail-image') || image.closest('figure');
      if (!frameElement || mediaFrames.has(frameElement)) return;
      const item = { image, frame: frameElement, inPin: !!image.closest(pinSelector), state: track(), amplitude: 0, enabled: null };
      media.set(image, item);
      mediaFrames.set(frameElement, item);
      prepareMedia(item);
    });
  }

  function refreshFinderReveals() {
    registerContent();
    document.querySelectorAll('.residence-card').forEach(card => {
      if (card.hidden) { revealObserver?.unobserve(card); return; }
      // Comparison choices and keyboard targets stay settled during filtering.
      if (!enabled || hasFocus(card) || card.querySelector('[data-compare][aria-pressed="true"]')) reveal(card, true);
      else {
        card.classList.remove('in-view', 'reveal-immediate');
        prepareReveal(card);
      }
    });
    invalidateLayout();
  }

  function pruneContent() {
    reveals.forEach(element => {
      if (element.isConnected) return;
      revealObserver?.unobserve(element);
      reveals.delete(element);
      titles.delete(element);
    });
    media.forEach((item, image) => {
      if (image.isConnected) return;
      driftObserver?.unobserve(item.frame);
      visibleMedia.delete(item);
      mediaFrames.delete(item.frame);
      media.delete(image);
    });
  }

  function stopOpening() {
    if (entranceStart === null) return;
    entranceStart = null;
    clear(heroImage, ['transform']);
    heroLetters.forEach(letter => clear(letter, ['transform', 'opacity']));
    clear(heroSmall, ['opacity', 'translate']);
    progress.hero.dirty = progress.opening.dirty = true;
  }

  function hasFocus(element) {
    return !!element && element.contains(document.activeElement);
  }

  function hasNonPointerFocus(element) {
    return hasFocus(element) && document.activeElement !== pointerFocused;
  }

  function releasePointerFocus(element, leaving) {
    const focused = document.activeElement;
    // Clicking a selector may leave a pointer focus ring behind. Release that
    // focus before its scene leaves; keyboard focus remains a visible anchor.
    if (leaving && hasFocus(element) && (pointerFocused === focused || !focused.matches(':focus-visible'))) focused.blur();
  }

  function focusHeading(heading) {
    if (!heading) return;
    const added = !heading.hasAttribute('tabindex');
    if (added) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    if (added) heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
  }

  function setAccessible(element, exposed) {
    if (!element) return;
    const hidden = !exposed && !hasFocus(element);
    const original = managedRegions.get(element);
    if (hidden) element.setAttribute('aria-hidden', 'true');
    else if (original?.ariaHidden === null) element.removeAttribute('aria-hidden');
    else if (original) element.setAttribute('aria-hidden', original.ariaHidden);
    element.inert = hidden || !!original?.inert;
  }

  function setControlVisibility(element, amount) {
    if (!element) return;
    const visible = hasFocus(element) ? 1 : clamp(amount);
    element.style.opacity = String(visible);
    element.style.visibility = visible > 0.001 ? 'visible' : 'hidden';
    element.style.pointerEvents = visible > 0.01 ? 'auto' : 'none';
    setAccessible(element, visible > 0.001);
  }

  function resetVisuals() {
    activeScene = -1;
    clear(heroMedia, ['transform']);
    clear(heroImage, ['transform']);
    clear(heroTitle, ['translate', 'opacity']);
    clear(heroSmall, ['translate', 'opacity']);
    heroLetters.forEach(letter => clear(letter, ['transform', 'opacity']));
    clear(heroBottom, ['opacity', 'visibility', 'pointer-events']);
    clear(story, ['clip-path', 'will-change', '--chapter-progress']);
    clear(chapterStage, ['translate']);
    clear(chapterControls, ['opacity', 'visibility', 'pointer-events']);
    scenes.forEach(({ element, figure, image, heading, paragraph, letters }) => {
      clear(element, ['opacity', 'visibility', 'pointer-events', 'z-index']);
      element.classList.remove('is-active');
      clear(figure, ['clip-path']);
      clear(image, ['transform']);
      clear(heading, ['opacity']);
      clear(paragraph, ['opacity', 'translate']);
      letters.forEach(letter => clear(letter, ['opacity', 'transform']));
    });
    clear(interludeImage, ['transform']);
    clear(journey, ['height', '--journey-progress']);
    clear(journeyTrack, ['transform', 'will-change']);
    if (journeyStage) journeyStage.scrollLeft = 0;
    clear(deckHeading, ['transform']);
    deckCards.forEach(({ element, image }) => {
      clear(element, ['transform', 'opacity', 'z-index', 'will-change']);
      clear(image, ['transform']);
    });
    clear(amenityControls, ['opacity', 'visibility', 'pointer-events']);
    clear(amenityCaption, ['opacity']);
    clear(sanctuary, ['clip-path', 'will-change']);
    clear(sanctuaryTitle, ['translate']);
    clear(sanctuaryCopy, ['opacity']);
    clear(thresholdWindow, ['clip-path', 'will-change']);
    clear(thresholdImage, ['transform']);
    thresholdDoors.forEach(door => clear(door, ['transform', 'opacity', 'will-change']));
    clear(thresholdWord, ['transform', 'opacity']);
    clear(thresholdCopy, ['transform', 'opacity', 'visibility', 'pointer-events']);
    clear(finaleFrame, ['inset']);
    clear(finaleLeft, ['translate']);
    clear(finaleRight, ['translate']);
    clear(finaleTitle, ['translate', 'color']);
    clear(finaleCopy, ['opacity']);
    clear(gallery, ['height']);
    clear(galleryTrack, ['transform', 'will-change']);
    clear(galleryMeter, ['transform']);
    if (galleryStage) galleryStage.scrollLeft = 0;
    clear(footerWord, ['transform']);
    managedRegions.forEach((original, element) => {
      original.ariaHidden === null ? element.removeAttribute('aria-hidden') : element.setAttribute('aria-hidden', original.ariaHidden);
      element.inert = original.inert;
    });
    media.forEach(item => {
      clear(item.image, ['transform']);
      item.state.value = null;
      item.state.dirty = true;
    });
  }

  function configure() {
    if (!pageActive || configuring) return;
    configuring = true;
    const previousScene = Math.max(0, activeScene);
    const nextEnabled = !motionOff();
    const nextPinned = pinOwners.length > 0 && nextEnabled && wide.matches && tall.matches;
    const previousGalleryItem = galleryItems[galleryCurrent];
    galleryRequested = null;
    const leavingPin = pinned && !nextPinned;
    const wasInsidePin = name => leavingPin && progress[name].active && progress[name].target > 0 && progress[name].target < 1;
    const atStage = stage => {
      if (!stage) return false;
      const box = stage.getBoundingClientRect();
      return box.top < innerHeight * 0.55 && box.bottom > innerHeight * 0.45;
    };
    // Keep the current gallery frame through geometry changes and keep a newly
    // unpinned scene nearby when a global motion control changes the page height.
    const readingAnchor = !hasConfigured ? null : atStage(galleryStage) || wasInsidePin('gallery') ? previousGalleryItem?.element
      : pinned !== nextPinned && (atStage(thresholdStage) || wasInsidePin('threshold')) ? thresholdCopy || thresholdWindow
      : pinned !== nextPinned && (atStage(deckStage) || wasInsidePin('deck')) ? deckCards[0]?.element : null;
    if (pinned && !nextPinned && hasFocus(chapterControls)) {
      // The compact reason controls are hidden by the ordinary-flow layout.
      setAccessible(chapters[previousScene], true);
      focusHeading(scenes[previousScene]?.heading);
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    stopOpening();
    enabled = nextEnabled;
    pinned = nextPinned;
    html.classList.toggle('scroll-ready', enabled);
    pinOwners.forEach(element => element.classList.toggle('is-pinned', pinned));
    resetVisuals();
    Object.values(progress).forEach(state => { state.value = null; state.active = false; state.dirty = true; });
    selectionImages.forEach(image => { image.style.transition = enabled ? '' : 'none'; });
    if (!enabled) titles.forEach((record, element) => unwrapTitle(element, record));
    reveals.forEach(prepareReveal);
    media.forEach(prepareMedia);
    geometryDirty = true;
    measureGeometry();
    if (!pinned && galleryStage && previousGalleryItem) {
      galleryStage.scrollLeft = previousGalleryItem.shift;
      updateGalleryControls(previousGalleryItem.shift);
    }
    setActiveScene(previousScene, false);
    snapNext = true;
    configuring = false;
    hasConfigured = true;
    const focused = document.activeElement;
    if (focused && focused !== document.body && focused !== pointerFocused && focused.closest(pinSelector)) navigateTo(focused);
    else if (navigationAnchor) navigateTo(navigationAnchor.element);
    else if (readingAnchor) navigateTo(readingAnchor);
    invalidate();
  }

  function setActiveScene(index, exposed = true) {
    if (!chapters.length) return;
    const next = Math.max(0, Math.min(chapters.length - 1, index));
    if (next !== activeScene) {
      activeScene = next;
      sceneButtons.forEach(button => {
        const selected = Number(button.dataset.chapterTo) === next;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    }
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle('is-active', i === next);
      if (pinned) setAccessible(chapter, exposed && i === next);
    });
  }

  function renderHero(value, now) {
    if (!hero) return;
    const departure = pinned ? smooth(0.035, 0.235, value) : 0;
    const elapsed = entranceStart === null ? Infinity : now - entranceStart;
    if (heroTitle) heroTitle.style.translate = `0 ${-heroExit * departure}px`;
    if (heroMedia) heroMedia.style.transform = pinned
      ? `translate3d(0,${-openingSize.height * 0.085 * departure}px,0) scale(${1.3 - 0.15 * departure})`
      : '';
    if (heroImage) heroImage.style.transform = `scale(${1 + 0.045 * (1 - smooth(0, entranceDuration, elapsed))})`;
    heroLetters.forEach((letter, index) => {
      const amount = smooth(60 + index * 38, (wide.matches ? 920 : 580) + index * 38, elapsed);
      letter.style.transform = `translate3d(0,${(1 - amount) * 42}px,0) rotate(${(1 - amount) * 2}deg)`;
      letter.style.opacity = String(amount);
    });
    if (heroSmall) {
      const amount = smooth(80, 700, elapsed);
      heroSmall.style.opacity = String(amount);
      heroSmall.style.translate = `0 ${(1 - amount) * 24}px`;
    }
    if (heroNight) {
      const enterNight = smooth(0.075, 0.12, value);
      const leaveNight = smooth(0.17, 0.225, value);
      heroNight.style.opacity = String(enterNight * (1 - leaveNight));
      heroNight.style.transform = `scale(${1.035 - enterNight * 0.02 + leaveNight * 0.018})`;
    }
    if (pinned) setControlVisibility(heroBottom, 1 - smooth(0.18, 0.26, value));
  }

  // Anchors sit inside true holds; every image is completely open at its destination.
  const reasonAnchors = [0.46, 0.695, 0.93];
  const reasonWipes = [[0.54, 0.64], [0.78, 0.88]];
  function sceneAnchor(index) {
    return reasonAnchors[index] ?? 0.93;
  }

  function reasonState(value) {
    for (let i = 0; i < Math.min(reasonWipes.length, chapters.length - 1); i++) {
      const [start, end] = reasonWipes[i];
      if (value < start) return { base: i, amount: 0, changing: false };
      if (value < end) return { base: i, amount: phase(start, end, value), changing: true };
    }
    return { base: Math.max(0, chapters.length - 1), amount: 0, changing: false };
  }

  function drawCurve(element, amount, size, active) {
    if (!element) return;
    const cover = smooth(0, 1, amount);
    const radius = Math.hypot(size.width * 0.58, size.height * 0.85) * cover;
    element.style.clipPath = cover >= 0.9999 ? 'inset(0)' : `circle(${radius}px at 50% ${size.height * (1.18 - 0.68 * cover)}px)`;
    element.style.willChange = active ? 'clip-path' : 'auto';
  }

  function drawArch(element, amount, active) {
    if (!element) return;
    const cover = smooth(0, 1, amount);
    // At rest the next chapter must be entirely masked, not visible as a
    // small cutout over the hero. Grow the arched opening from a true zero area.
    const side = 50 * (1 - cover);
    const top = 100 * (1 - cover);
    const radius = 50 * (1 - cover);
    element.style.clipPath = cover >= 0.9999 ? 'inset(0)' : `inset(${top}% ${side}% 0 ${side}% round ${radius}% ${radius}% 0 0)`;
    element.style.willChange = active ? 'clip-path' : 'auto';
  }

  function renderOpening(value, now) {
    if (!pinned || !opening || !story) return;
    releasePointerFocus(heroBottom, value > 0.18);
    releasePointerFocus(chapterControls, value < 0.4);
    // A control must never be hidden underneath a takeover while it holds focus.
    const focusedChapter = chapters.findIndex(hasNonPointerFocus);
    const v = hasNonPointerFocus(heroBottom) ? Math.min(value, 0.18)
      : focusedChapter >= 0 ? sceneAnchor(focusedChapter)
      : hasNonPointerFocus(chapterControls) ? Math.max(value, 0.405) : value;
    renderHero(v, now);
    const cover = phase(0.25, 0.4, v);
    drawArch(story, cover, progress.opening.active);
    if (chapterStage) chapterStage.style.translate = `0 ${(1 - smooth(0, 1, cover)) * openingSize.height * 0.28}px`;
    setControlVisibility(chapterControls, smooth(0.985, 1, cover));
    const { base, amount, changing } = reasonState(v);
    const active = base + (changing && amount >= 0.5 ? 1 : 0);
    setActiveScene(active, cover >= 0.985);
    story.style.setProperty('--chapter-progress', v.toFixed(4));
    const wipe = smooth(0.1, 0.94, amount);
    const direction = base % 2 ? -1 : 1;
    scenes.forEach(({ element, figure, image, heading, paragraph, letters }, index) => {
      const current = index === base;
      const incoming = changing && index === base + 1;
      const shown = current || incoming;
      element.style.opacity = shown ? '1' : '0';
      element.style.visibility = shown ? 'visible' : 'hidden';
      element.style.pointerEvents = index === active && cover >= 0.985 ? 'auto' : 'none';
      element.style.zIndex = incoming ? '2' : '1';
      if (figure) figure.style.clipPath = !shown ? 'inset(0 100% 0 0)' : incoming
        ? direction > 0 ? `inset(0 0 0 ${(1 - wipe) * 100}%)` : `inset(0 ${(1 - wipe) * 100}% 0 0)` : 'inset(0)';
      if (image) image.style.transform = !changing || !shown ? 'none' : incoming
        ? `translate3d(${direction * (1 - wipe) * 3}%,0,0) scale(${1 + (1 - wipe) * 0.08})`
        : `scale(${1 + wipe * 0.025})`;
      const readable = !changing ? (current ? 1 : 0) : current
        ? 1 - smooth(0.02, 0.30, amount) : incoming ? smooth(0.72, 1, amount) : 0;
      if (paragraph) {
        paragraph.style.opacity = String(readable);
        paragraph.style.translate = `0 ${(1 - readable) * (current ? -12 : 18)}px`;
      }
      if (!letters.length && heading) heading.style.opacity = String(!changing ? (current ? 1 : 0)
        : current ? 1 - smooth(0.02, 0.4, amount) : incoming ? smooth(0.57, 0.97, amount) : 0);
      letters.forEach((letter, letterIndex) => {
        const delay = 0.08 * letterIndex / Math.max(1, letters.length - 1);
        // Departure ends before arrival begins: duplicated words never crossfade.
        const visible = !changing ? (current ? 1 : 0) : current
          ? 1 - smooth(0.02 + delay, 0.32 + delay, amount)
          : incoming ? smooth(0.57 + delay, 0.89 + delay, amount) : 0;
        letter.style.opacity = String(visible);
        letter.style.transform = `perspective(650px) rotateY(${(current ? -1 : 1) * (1 - visible) * 84}deg)`;
      });
    });
  }

  // Layout reads are cached before drawing. One measured track owns all horizontal travel.
  function measureGeometry() {
    geometryDirty = false;
    openingSize = { width: openingStage?.clientWidth || innerWidth, height: openingStage?.clientHeight || innerHeight };
    amenitySize = { width: amenityStage?.clientWidth || innerWidth, height: amenityStage?.clientHeight || innerHeight };
    finaleHeight = finaleStage?.clientHeight || innerHeight;
    thresholdHeight = thresholdStage?.clientHeight || innerHeight;
    heroExit = heroTitle ? heroTitle.offsetTop + heroTitle.offsetHeight + openingSize.height * 0.08 : openingSize.height;
    journeyTravel = 0;
    if (pinned && journey && journeyStage && journeyTrack) {
      journeyWidth = journeyStage.clientWidth;
      journeyTravel = Math.max(0, journeyTrack.scrollWidth - journeyWidth);
      const height = Math.ceil(journeyStage.clientHeight * 1.3 + journeyTravel * 1.13) + 'px';
      if (journey.style.height !== height) journey.style.height = height;
      const trackBox = journeyTrack.getBoundingClientRect();
      journeyObjects.forEach(item => {
        const box = item.element.getBoundingClientRect();
        item.left = box.left - trackBox.left;
        item.width = box.width;
      });
      progress.journey.dirty = true;
    }
    if (pinned && deckStage && deckCards.length) {
      const width = deckStage.clientWidth;
      deckWidth = Math.max(...deckCards.map(card => card.element.offsetWidth));
      const margin = Math.min(48, width * 0.04);
      const gap = Math.min(42, Math.max(20, width * 0.025));
      deckStep = Math.max(0, Math.min(deckWidth + gap, (width - margin * 2 - deckWidth) / 2));
      progress.deck.dirty = true;
    }
    if (gallery && galleryStage && galleryTrack) {
      galleryWidth = galleryStage.clientWidth;
      galleryTravel = Math.max(0, galleryTrack.scrollWidth - galleryWidth);
      const trackBox = galleryTrack.getBoundingClientRect();
      galleryItems.forEach(item => {
        const box = item.element.getBoundingClientRect();
        item.left = box.left - trackBox.left;
        item.width = box.width;
        item.shift = Math.max(0, Math.min(galleryTravel, item.left - Math.max(0, (galleryWidth - item.width) / 2)));
      });
      if (galleryItems.length) {
        galleryItems[0].shift = 0;
        galleryItems[galleryItems.length - 1].shift = galleryTravel;
      }
      if (pinned) {
        const height = Math.ceil(galleryStage.clientHeight * 1.3 + galleryTravel * 1.06) + 'px';
        if (gallery.style.height !== height) gallery.style.height = height;
      }
      progress.gallery.dirty = true;
      updateGalleryControls(pinned ? phase(0.06, 0.94, progress.gallery.value || 0) * galleryTravel : galleryStage.scrollLeft);
    }
  }

  function renderFeatures(value) {
    if (!pinned || !featureStage) return;
    const v = clamp(value);
    if (featureBackdrop) featureBackdrop.style.transform = `scale(${1.08 - smooth(0, 1, v) * 0.055}) translate3d(0,${(0.5 - v) * 2.2}%,0)`;
    if (featureIntro) {
      const intro = 1 - smooth(0.14, 0.34, v);
      featureIntro.style.opacity = String(intro);
      featureIntro.style.transform = `translate3d(0,${-28 * (1 - intro)}px,0)`;
    }
    featureCards.forEach((card, index) => {
      const start = 0.18 + index * 0.2;
      const end = start + 0.17;
      const show = smooth(start, end, v);
      const settleX = (index - 1) * 3.5;
      card.style.opacity = String(show);
      card.style.transform = `translate3d(${(1 - show) * (index % 2 ? 70 : -70) + settleX}%,${(1 - show) * 26}px,0) rotate(${(1 - show) * (index - 1) * 2.5}deg)`;
      card.style.pointerEvents = show > 0.86 ? 'auto' : 'none';
    });
  }

  function renderPortrait(value) {
    if (!pinned || !portraitFrame) return;
    const v = clamp(value);
    const open = smooth(0.08, 0.72, v);
    const leftTop = 100 - open * 100;
    const leftBottom = 100 - open * 74;
    portraitFrame.style.clipPath = `polygon(${leftTop}% 0,100% 0,100% 100%,${leftBottom}% 100%)`;
    portraitFrame.style.willChange = progress.portrait.active ? 'clip-path' : 'auto';
    if (portraitImage) portraitImage.style.transform = `translate3d(${(1 - open) * 6}%,0,0) scale(${1.085 - open * 0.085})`;
    if (portraitCopy) {
      const show = smooth(0.52, 0.9, v);
      portraitCopy.style.opacity = String(show);
      portraitCopy.style.transform = `translate3d(0,${(1 - show) * 28}px,0)`;
    }
  }

  const deckAnchor = 0.86;
  function renderDeck(value) {
    if (!pinned || !deckStage) return;
    const v = hasNonPointerFocus(deck) ? Math.max(value, deckAnchor) : value;
    const spread = smooth(0.08, 0.76, v);
    deckCards.forEach(({ element, image }, index) => {
      const side = index - (deckCards.length - 1) / 2;
      const x = side * (deckWidth * 0.27 * (1 - spread) + deckStep * spread);
      const y = (1 - spread) * (Math.abs(side) * 18 + 8);
      const rotation = (1 - spread) * (side * 10 - 1.5);
      element.style.transform = `translateX(-50%) translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${0.92 + spread * 0.08})`;
      element.style.opacity = '1';
      element.style.zIndex = String(deckCards.length - Math.abs(side));
      element.style.willChange = progress.deck.active ? 'transform' : 'auto';
      if (image) image.style.transform = `scale(${1.08 - spread * 0.08})`;
    });
    if (deckHeading) deckHeading.style.transform = `translate3d(0,${-12 * spread}px,0)`;
  }

  function renderThreshold(value) {
    if (!pinned || !thresholdWindow) return;
    releasePointerFocus(thresholdCopy, value < 0.68);
    const v = hasNonPointerFocus(thresholdCopy) ? Math.max(value, 0.94) : value;
    const open = smooth(0.12, 0.65, v);
    const expand = smooth(0.25, 0.82, v);
    const inset = 1 - expand;
    thresholdWindow.style.clipPath = `inset(${10 * inset}% ${27 * inset}% ${10 * inset}% ${27 * inset}% round ${45 * inset}% ${45 * inset}% 0 0)`;
    thresholdWindow.style.willChange = progress.threshold.active ? 'clip-path' : 'auto';
    thresholdDoors.forEach((door, index) => {
      const direction = index ? 1 : -1;
      door.style.transform = `translateX(${direction * open * 12}%) rotateY(${direction * open * 105}deg)`;
      door.style.opacity = String(1 - smooth(0.55, 0.72, v));
      door.style.willChange = progress.threshold.active ? 'transform' : 'auto';
    });
    if (thresholdImage) thresholdImage.style.transform = `scale(${1.025 + expand * 0.055})`;
    const depart = smooth(0.08, 0.44, v);
    if (thresholdWord) {
      thresholdWord.style.opacity = String(1 - depart);
      thresholdWord.style.transform = `translate3d(0,${-thresholdHeight * 0.18 * depart}px,0) scale(${1 + depart * 0.08})`;
    }
    const readable = smooth(0.68, 0.9, v);
    setControlVisibility(thresholdCopy, readable);
    if (thresholdCopy) thresholdCopy.style.transform = `translate3d(0,${(1 - readable) * 24}px,0)`;
  }

  function updateGalleryControls(shift) {
    if (!galleryStage) return;
    const offset = Math.max(0, Math.min(galleryTravel, shift));
    let distance = Infinity;
    galleryItems.forEach((item, index) => {
      const gap = Math.abs(item.shift - offset);
      if (gap < distance) { distance = gap; galleryCurrent = index; }
    });
    galleryButtons.forEach(button => {
      const step = Number(button.dataset.galleryRailStep);
      button.disabled = !galleryItems.length || galleryTravel < 1 || (step < 0 ? galleryCurrent === 0 : galleryCurrent === galleryItems.length - 1);
    });
    if (galleryRequested !== null && Math.abs(offset - galleryItems[galleryRequested].shift) < 1) galleryRequested = null;
    if (galleryMeter) galleryMeter.style.transform = `scaleX(${galleryTravel ? offset / galleryTravel : 1})`;
  }

  function renderGallery(value) {
    if (!pinned || !galleryStage || !galleryTrack) return;
    const shift = galleryTravel * phase(0.06, 0.94, value);
    galleryTrack.style.transform = `translate3d(${-shift}px,0,0)`;
    galleryTrack.style.willChange = progress.gallery.active ? 'transform' : 'auto';
    if (galleryStage.scrollLeft) galleryStage.scrollLeft = 0;
    updateGalleryControls(shift);
  }

  function renderJourney(value) {
    if (!pinned || !journeyTrack || !journey) return;
    const position = phase(0.06, 0.94, value);
    journey.style.setProperty('--journey-progress', position.toFixed(4));
    journeyTrack.style.transform = `translate3d(${-journeyTravel * position}px,0,0)`;
    journeyTrack.style.willChange = progress.journey.active ? 'transform' : 'auto';
    // Browsers can scroll an overflow container when focusing a descendant.
    if (journeyStage.scrollLeft) journeyStage.scrollLeft = 0;
  }

  function renderAmenities(value) {
    if (!pinned || !amenitySequence || !sanctuary) return;
    releasePointerFocus(amenityControls, value > 0.36);
    const v = hasNonPointerFocus(amenityControls) ? Math.min(value, 0.36) : hasNonPointerFocus(sanctuary) ? Math.max(value, 0.82) : value;
    const cover = phase(0.4, 0.77, v);
    drawCurve(sanctuary, cover, amenitySize, progress.amenity.active);
    setAccessible(sanctuary, cover >= 0.985);
    if (sanctuaryTitle) sanctuaryTitle.style.translate = `0 ${(1 - smooth(0, 1, cover)) * amenitySize.height * 0.42}px`;
    if (sanctuaryCopy) sanctuaryCopy.style.opacity = String(smooth(0.85, 1, cover));
    setControlVisibility(amenityControls, 1 - smooth(0.36, 0.56, v));
    if (amenityCaption) amenityCaption.style.opacity = String(1 - smooth(0.37, 0.53, v));
  }

  function renderFinale(value) {
    if (!pinned || !finaleFrame) return;
    const align = smooth(0.08, 0.42, value);
    const expand = smooth(0.38, 0.85, value);
    const width = 52 + 48 * expand;
    const height = 62 + 38 * expand;
    finaleFrame.style.inset = `${(100 - height) / 2}% ${(100 - width) / 2}%`;
    if (finaleLeft) finaleLeft.style.translate = `${-4 * (1 - align)}% ${18 * (1 - align)}%`;
    if (finaleRight) finaleRight.style.translate = `${4 * (1 - align)}% ${-18 * (1 - align)}%`;
    if (finaleTitle) {
      finaleTitle.style.translate = `0 ${(0.1 - phase(0.15, 0.75, value) * 1.15) * finaleHeight}px`;
      finaleTitle.style.color = expand > 0.5 ? 'var(--paper)' : 'var(--ink)';
    }
    if (finaleCopy) finaleCopy.style.opacity = String(smooth(0.82, 0.98, value));
  }

  function updateTrack(state, target, active, snap) {
    const next = clamp(target);
    if (next !== state.target || active !== state.active) state.dirty = true;
    state.target = next;
    if (snap || !active || !state.active || state.value === null) {
      state.dirty = state.dirty || state.value !== next;
      state.value = next;
    }
    state.active = active;
  }

  function measure() {
    measureDirty = false;
    const reanchor = geometryDirty && navigationAnchor && Math.abs(scrollY - navigationAnchor.top) < 3;
    if (geometryDirty) measureGeometry();
    if (reanchor) {
      const top = destinationFor(navigationAnchor.element);
      if (top !== null && Math.abs(top - scrollY) > 1) {
        navigationAnchor.top = top;
        scrollTo({ top, behavior: 'instant' });
        snapNext = true;
      }
    }
    const height = innerHeight;
    const position = scrollY;
    const snap = snapNext || Math.abs(position - lastScroll) > height * 0.9;
    snapNext = false;
    lastScroll = position;
    const scrolled = position > 24;
    if (headerScrolled !== scrolled) {
      masthead?.classList.toggle('is-scrolled', scrolled);
      headerScrolled = scrolled;
    }
    if (!pinned && galleryStage) updateGalleryControls(galleryStage.scrollLeft);
    if (!enabled) return;
    const near = box => box.top < height * 1.2 && box.bottom > -height * 0.2;
    const measurePin = (element, stage, state) => {
      if (!pinned || !element || !stage) return;
      const box = element.getBoundingClientRect();
      updateTrack(state, -box.top / Math.max(1, box.height - stage.clientHeight), near(box), snap);
    };
    measurePin(opening, openingStage, progress.opening);
    measurePin(featureField, featureStage, progress.features);
    measurePin(journey, journeyStage, progress.journey);
    measurePin(deck, deckStage, progress.deck);
    measurePin(amenitySequence, amenityStage, progress.amenity);
    measurePin(portraitReveal, portraitStage, progress.portrait);
    measurePin(threshold, thresholdStage, progress.threshold);
    measurePin(finale, finaleStage, progress.finale);
    measurePin(gallery, galleryStage, progress.gallery);
    if (hero && !pinned) {
      const box = hero.getBoundingClientRect();
      updateTrack(progress.hero, -box.top / Math.max(1, box.height), near(box), snap);
    }
    if (interlude) {
      const box = interlude.getBoundingClientRect();
      updateTrack(progress.interlude, (height - box.top) / Math.max(1, height + box.height), near(box), snap);
    }
    if (footer) {
      const box = footer.getBoundingClientRect();
      updateTrack(progress.footer, (height - box.top) / (height * 1.1), near(box), snap);
    }
    if (!pinned && chapters.length) {
      let closest = 0;
      let distance = Infinity;
      chapters.forEach((chapter, index) => {
        const box = chapter.getBoundingClientRect();
        const gap = Math.abs(box.top + Math.min(box.height, height) * 0.5 - height * 0.5);
        if (gap < distance) { distance = gap; closest = index; }
      });
      setActiveScene(closest);
    }
    visibleMedia.forEach(item => {
      const box = item.frame.getBoundingClientRect();
      const visible = box.width > 0 && box.height > 0 && !item.image.closest('[hidden]');
      item.amplitude = Math.min(wide.matches ? 28 : 12, box.height * (wide.matches ? 0.045 : 0.025));
      updateTrack(item.state, (height - box.top) / Math.max(1, height + box.height), visible, snap);
    });
  }

  function damp(state, elapsed) {
    if (!state.active || state.value === null) return false;
    const distance = state.target - state.value;
    if (Math.abs(distance) <= 0.0006) {
      if (state.value !== state.target) state.dirty = true;
      state.value = state.target;
      return false;
    }
    // Time-based exponential damping is independent of screen refresh rate.
    state.value += distance * (1 - Math.exp(-elapsed / (wide.matches ? 100 : 85)));
    state.dirty = true;
    return true;
  }

  function draw(now) {
    frame = 0;
    if (!pageActive || document.hidden) { lastFrame = 0; return; }
    const elapsed = lastFrame ? Math.min(64, Math.max(1, now - lastFrame)) : 16.67;
    lastFrame = now;
    if (measureDirty) measure();
    let unsettled = false;
    if (enabled) {
      Object.values(progress).forEach(state => { unsettled = damp(state, elapsed) || unsettled; });
      const entering = entranceStart !== null;
      if (pinned && (progress.opening.dirty || entering)) renderOpening(progress.opening.value || 0, now);
      if (!pinned && (progress.hero.dirty || entering)) renderHero(progress.hero.value || 0, now);
      if (progress.features.dirty) renderFeatures(progress.features.value || 0);
      if (progress.journey.dirty) renderJourney(progress.journey.value || 0);
      if (progress.deck.dirty) renderDeck(progress.deck.value || 0);
      if (progress.amenity.dirty) renderAmenities(progress.amenity.value || 0);
      if (progress.portrait.dirty) renderPortrait(progress.portrait.value || 0);
      if (progress.threshold.dirty) renderThreshold(progress.threshold.value || 0);
      if (progress.finale.dirty) renderFinale(progress.finale.value || 0);
      if (progress.gallery.dirty) renderGallery(progress.gallery.value || 0);
      if (progress.interlude.dirty && interludeImage) interludeImage.style.transform = `translate3d(0,${(0.5 - (progress.interlude.value || 0)) * 26}px,0) scale(1.055)`;
      if (progress.footer.dirty && footerWord) footerWord.style.transform = `translate3d(0,${(1 - smooth(0, 1, progress.footer.value || 0)) * (wide.matches ? 44 : 14)}px,0)`;
      Object.values(progress).forEach(state => { state.dirty = false; });
      visibleMedia.forEach(item => {
        unsettled = damp(item.state, elapsed) || unsettled;
        if (!item.state.dirty || !item.state.active) return;
        const value = item.state.value;
        const scale = wide.matches ? 1.11 - value * 0.018 : 1.065 - value * 0.008;
        item.image.style.transform = `translate3d(0,${(1 - value * 2) * item.amplitude}px,0) scale(${scale})`;
        item.state.dirty = false;
      });
      if (entering && now - entranceStart >= entranceDuration) entranceStart = null;
      unsettled = unsettled || entranceStart !== null;
    }
    if (unsettled || measureDirty) schedule();
    else lastFrame = 0;
  }

  function schedule() {
    if (!frame && pageActive && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function invalidate() {
    measureDirty = true;
    schedule();
  }

  function invalidateLayout() {
    geometryDirty = true;
    invalidate();
  }

  function pinDestination(element, stage, amount) {
    if (!element || !stage) return null;
    return element.getBoundingClientRect().top + scrollY + Math.max(0, element.offsetHeight - stage.clientHeight) * amount;
  }

  function galleryItemFor(element) {
    return galleryItems.find(item => item.element === element || item.element.contains(element));
  }

  function galleryShiftFor(item, element = item.element) {
    let shift = item.shift;
    if (element !== item.element && galleryTrack) {
      const box = element.getBoundingClientRect();
      const trackBox = galleryTrack.getBoundingClientRect();
      const left = box.left - trackBox.left;
      const right = box.right - trackBox.left;
      const margin = Math.min(48, galleryWidth * 0.04);
      if (left < shift + margin) shift = left - margin;
      if (right > shift + galleryWidth - margin) shift = right - galleryWidth + margin;
    }
    return Math.max(0, Math.min(galleryTravel, shift));
  }

  function destinationFor(element) {
    if (!pinned || !element) return null;
    const chapter = element.closest?.('.chapter');
    if (chapter) return pinDestination(opening, openingStage, sceneAnchor(chapters.indexOf(chapter)));
    if (element === story || element === chapterStage) return pinDestination(opening, openingStage, sceneAnchor(0));
    if (chapterControls?.contains(element)) return pinDestination(opening, openingStage, sceneAnchor(Math.max(0, activeScene)));
    if (element === opening || hero?.contains(element)) return pinDestination(opening, openingStage, 0.02);
    if (journey?.contains(element)) {
      if (geometryDirty) measureGeometry();
      const item = journeyObjects.find(object => object.element === element || object.element.contains(element));
      if (!item) return pinDestination(journey, journeyStage, 0.03);
      let shift = Math.max(0, Math.min(journeyTravel, item.left - Math.max(0, (journeyWidth - item.width) / 2)));
      if (item === journeyObjects[0]) shift = 0;
      if (item === journeyObjects[journeyObjects.length - 1]) shift = journeyTravel;
      if (element !== item.element) {
        const box = element.getBoundingClientRect();
        const trackBox = journeyTrack.getBoundingClientRect();
        const left = box.left - trackBox.left;
        const right = box.right - trackBox.left;
        const margin = Math.min(48, journeyWidth * 0.04);
        if (left < shift + margin) shift = left - margin;
        if (right > shift + journeyWidth - margin) shift = right - journeyWidth + margin;
        shift = Math.max(0, Math.min(journeyTravel, shift));
      }
      const ratio = journeyTravel ? shift / journeyTravel : 0;
      const anchor = ratio <= 0.001 ? 0.03 : ratio >= 0.999 ? 0.97 : 0.06 + ratio * 0.88;
      return pinDestination(journey, journeyStage, anchor);
    }
    if (deck?.contains(element)) return pinDestination(deck, deckStage, deckAnchor);
    if (sanctuary?.contains(element)) return pinDestination(amenitySequence, amenityStage, 0.86);
    if (element === amenitySequence || amenities?.contains(element)) return pinDestination(amenitySequence, amenityStage, 0.18);
    if (threshold?.contains(element)) return pinDestination(threshold, thresholdStage, 0.94);
    if (finale?.contains(element)) return pinDestination(finale, finaleStage, finaleCopy?.contains(element) ? 0.98 : 0.04);
    if (gallery?.contains(element)) {
      if (geometryDirty) measureGeometry();
      const item = galleryItemFor(element);
      // The top-bar controls stay with the currently viewed frame.
      if (!item) return pinDestination(gallery, galleryStage, Math.max(0.03, Math.min(0.97, progress.gallery.target)));
      const ratio = galleryTravel ? galleryShiftFor(item, element) / galleryTravel : 0;
      const anchor = ratio <= 0.001 ? 0.03 : ratio >= 0.999 ? 0.97 : 0.06 + ratio * 0.88;
      return pinDestination(gallery, galleryStage, anchor);
    }
    return null;
  }

  function navigateTo(element, behavior = 'instant') {
    if (!element) return false;
    galleryRequested = null;
    stopOpening();
    if (geometryDirty) measureGeometry();
    const top = destinationFor(element);
    const galleryItem = galleryItemFor(element);
    if (journeyStage && journey?.contains(element)) journeyStage.scrollLeft = 0;
    if (pinned && galleryStage && gallery?.contains(element)) galleryStage.scrollLeft = 0;
    if (top !== null) {
      snapNext = behavior === 'instant';
      navigationAnchor = behavior === 'instant' ? { element, top } : null;
      scrollTo({ top, behavior });
    } else if (galleryItem && galleryStage) {
      const nativeBehavior = motionOff() ? 'instant' : behavior;
      navigationAnchor = null;
      galleryStage.scrollIntoView({ block: 'nearest', behavior: nativeBehavior });
      galleryStage.scrollTo({ left: galleryShiftFor(galleryItem, element), behavior: nativeBehavior });
    } else {
      navigationAnchor = null;
      element.scrollIntoView({ block: 'start', behavior: motionOff() ? 'instant' : behavior });
    }
    revealAncestors(element);
    invalidate();
    return top !== null;
  }

  function moveToScene(index, behavior = 'smooth') {
    if (!Number.isFinite(index)) return;
    const next = Math.max(0, Math.min(chapters.length - 1, Math.round(index)));
    if (chapters[next]) navigateTo(chapters[next], motionOff() ? 'instant' : behavior);
  }

  function stepGallery(step) {
    if (!Number.isFinite(step) || !galleryItems.length) return;
    const next = Math.max(0, Math.min(galleryItems.length - 1, (galleryRequested ?? galleryCurrent) + Math.sign(step)));
    navigateTo(galleryItems[next].element, motionOff() ? 'instant' : 'smooth');
    galleryRequested = next;
  }

  function revealAncestors(element, immediate = true) {
    let parent = element;
    while (parent && parent !== document.body) {
      if (reveals.has(parent)) reveal(parent, immediate);
      parent = parent.parentElement;
    }
  }

  function hashTarget(hash = location.hash) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
    if (!id) return null;
    const legacyChapter = /^(?:reason|scene)-([123])$/.exec(id);
    return document.getElementById(id) || (legacyChapter ? chapters[Number(legacyChapter[1]) - 1] : null);
  }

  function followSceneHash() {
    const target = hashTarget();
    if (!target) return;
    if (target.closest(pinSelector)) navigateTo(target);
    else revealAncestors(target);
    snapNext = true;
    invalidate();
  }

  function selectImage(button, buttons, images, key) {
    const index = Number(button.dataset[key]);
    if (!Number.isInteger(index) || !images[index]) return false;
    const previous = images.findIndex(image => image.classList.contains('selected'));
    // Re-selecting the current frame (also done during setup) must not flash.
    if (previous !== index) {
      images.forEach((image, i) => {
        image.classList.remove('is-retiring', 'wipe-forward', 'wipe-backward');
        image.classList.toggle('selected', i === index);
        if (i === previous) image.classList.add('is-retiring');
        if (i === index) image.classList.add(index < previous ? 'wipe-backward' : 'wipe-forward');
      });
      // Keep the previous photograph behind the moving diagonal until the
      // new image has covered it. Repeated selections remain interruptible.
      if (previous >= 0) {
        const retiring = images[previous];
        setTimeout(() => retiring.classList.remove('is-retiring'), 1050);
      }
    }
    // Even an already-selected initial image must have the correct
    // accessibility state. Invisible siblings are not announced as photos.
    images.forEach((image, i) => image.setAttribute('aria-hidden', String(i !== index)));
    buttons.forEach(control => control.setAttribute('aria-pressed', String(Number(control.dataset[key]) === index)));
    return true;
  }

  amenityButtons.forEach(button => {
    const selectAmenity = () => {
      if (selectImage(button, amenityButtons, amenityImages, 'amenity') && amenityCaption && button.dataset.caption) {
        amenityCaption.textContent = button.dataset.caption;
      }
    };
    button.addEventListener('click', selectAmenity);
    button.addEventListener('focus', selectAmenity);
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') selectAmenity();
    });
  });
  interiorButtons.forEach(button => button.addEventListener('click', () => selectImage(button, interiorButtons, interiorImages, 'interior')));
  const initialAmenity = amenityButtons.find(button => button.getAttribute('aria-pressed') === 'true') || amenityButtons[0];
  const initialInterior = interiorButtons.find(button => button.getAttribute('aria-pressed') === 'true') || interiorButtons[0];
  if (initialAmenity) selectImage(initialAmenity, amenityButtons, amenityImages, 'amenity');
  if (initialInterior) selectImage(initialInterior, interiorButtons, interiorImages, 'interior');

  const contentObserver = main && 'MutationObserver' in window ? new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) registerContent(node); }));
    pruneContent();
    invalidateLayout();
  }) : null;
  const layoutObserver = main && 'ResizeObserver' in window ? new ResizeObserver(invalidateLayout) : null;
  function observeContent() {
    contentObserver?.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    layoutObserver?.observe(main);
    if (journeyTrack) layoutObserver?.observe(journeyTrack);
    if (galleryTrack) layoutObserver?.observe(galleryTrack);
  }

  function suspend() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    stopOpening();
    revealObserver?.disconnect();
    driftObserver?.disconnect();
    contentObserver?.disconnect();
    layoutObserver?.disconnect();
    visibleMedia.forEach(item => item.image.classList.remove('is-drifting'));
    visibleMedia.clear();
  }

  function resume() {
    if (!pageActive || document.hidden) return;
    registerContent();
    pruneContent();
    configure();
    media.forEach(item => { if (item.enabled) driftObserver?.observe(item.frame); });
    observeContent();
  }

  sceneButtons.forEach(button => button.addEventListener('click', () => moveToScene(Number(button.dataset.chapterTo))));
  document.querySelectorAll('[data-chapter-step]').forEach(button => button.addEventListener('click', () => moveToScene(activeScene + Number(button.dataset.chapterStep))));
  galleryButtons.forEach(button => button.addEventListener('click', () => stepGallery(Number(button.dataset.galleryRailStep))));
  galleryStage?.addEventListener('scroll', () => {
    // Focus can scroll an overflow-hidden stage independently of document scroll.
    if (pinned && galleryStage.scrollLeft) galleryStage.scrollLeft = 0;
    if (!pinned) invalidate();
  }, { passive: true });
  galleryStage?.addEventListener('scrollend', () => { galleryRequested = null; }, { passive: true });
  addEventListener('scrollend', () => { galleryRequested = null; }, { passive: true });
  addEventListener('scroll', () => {
    stopOpening();
    if (navigationAnchor && Math.abs(scrollY - navigationAnchor.top) > 3) navigationAnchor = null;
    invalidate();
  }, { passive: true });
  addEventListener('resize', configure, { passive: true });
  addEventListener('hashchange', followSceneHash);
  addEventListener('solenne-motion-change', configure);
  addEventListener('solenne-filter-change', refreshFinderReveals);
  reduce.addEventListener('change', configure);
  wide.addEventListener('change', configure);
  tall.addEventListener('change', configure);
  connection?.addEventListener?.('change', configure);
  document.addEventListener('pointerdown', event => {
    navigationAnchor = null;
    if (!event.target.closest?.('[data-gallery-rail-step]')) galleryRequested = null;
    pendingPointerFocus = event.target.closest?.('a[href],button,input,select,textarea,summary,[tabindex],[contenteditable="true"]') || null;
    if (pendingPointerFocus === document.activeElement) pointerFocused = pendingPointerFocus;
    stopOpening();
    schedule();
  }, { passive: true });
  document.addEventListener('pointerup', () => { pendingPointerFocus = null; }, { passive: true });
  document.addEventListener('pointercancel', () => { pendingPointerFocus = null; }, { passive: true });
  document.addEventListener('keydown', event => {
    pendingPointerFocus = null;
    if (!['Enter', ' '].includes(event.key) || !document.activeElement.matches?.('[data-gallery-rail-step]')) galleryRequested = null;
    // Page scrolling does not turn a retained mouse click into a focus anchor.
    if (!['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp'].includes(event.key)) pointerFocused = null;
    stopOpening();
    schedule();
  });
  document.addEventListener('focusin', event => {
    const fromPointer = pendingPointerFocus === event.target || !!pendingPointerFocus?.contains(event.target);
    pendingPointerFocus = null;
    pointerFocused = fromPointer ? event.target : null;
    revealAncestors(event.target, !fromPointer);
    if (configuring) return;
    // Pointer focus is already at the clicked position. Moving the scene here
    // can sweep other hover selectors beneath a stationary pointer.
    if (!fromPointer && ((pinned && event.target.closest?.(pinSelector)) || galleryItemFor(event.target))) navigateTo(event.target);
    progress.opening.dirty = progress.amenity.dirty = progress.deck.dirty = progress.threshold.dirty = true;
    snapNext = true;
    invalidate();
  });
  document.addEventListener('focusout', event => {
    if (pointerFocused === event.target) pointerFocused = null;
    progress.opening.dirty = progress.amenity.dirty = progress.deck.dirty = progress.threshold.dirty = true;
    invalidate();
  });
  // Native fragment jumps cannot locate a child inside a translated or shared pin.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!pinned || !link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    const target = hashTarget(url.hash);
    if (!target || destinationFor(target) === null) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url);
    navigateTo(target);
  });
  document.addEventListener('load', event => { if (event.target.tagName === 'IMG') invalidateLayout(); }, true);
  document.addEventListener('toggle', invalidate, true);
  document.addEventListener('visibilitychange', () => document.hidden ? suspend() : resume());
  addEventListener('pagehide', () => { pageActive = false; suspend(); });
  addEventListener('pageshow', event => {
    const returning = event.persisted || !pageActive;
    pageActive = true;
    if (returning) resume();
  });
  document.fonts?.ready.then(invalidateLayout);
  document.fonts?.addEventListener?.('loadingdone', invalidateLayout);

  enabled = !motionOff();
  pinned = pinOwners.length > 0 && enabled && wide.matches && tall.matches;
  registerContent();
  configure();
  observeContent();
  followSceneHash();
  if (hero && enabled && !location.hash && scrollY < 8 && !document.hidden) {
    entranceDuration = wide.matches ? 1400 : 1050;
    entranceStart = performance.now();
    schedule();
  }
})();
