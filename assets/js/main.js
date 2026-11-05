// THE CORNER — interactions

// Active les animations seulement si JS tourne (contenu lisible sans JS / sans erreur)
if (!new URLSearchParams(location.search).has('noanim')) {
  document.documentElement.classList.add('js');
}

// Header : fond au scroll
const header = document.getElementById('header');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Menu mobile
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const navClose = document.getElementById('navClose');
if (burger && nav) {
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    header?.classList.toggle('menu-open', open);
    document.documentElement.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  navClose?.addEventListener('click', () => setOpen(false));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
}

// Apparition au scroll
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
}

// FAQ : une seule réponse ouverte à la fois
const faqItems = document.querySelectorAll('.faq__item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => { if (other !== item) other.open = false; });
    }
  });
});

// Prise de rendez-vous : la bulle déplie un panneau avec le calendrier Calendly intégré,
// directement sur la page — jamais de pop-in plein écran, jamais de nouvel onglet.
const CALENDLY_URL = 'https://calendly.com/antoine-cafethecorner/30min';
const LOGO_MARK = '<img src="/assets/img/logos/logo_icone_creme.svg" width="32" height="23" alt="" aria-hidden="true">';

// Bulle flottante (icône seule)
const bubble = document.createElement('button');
bubble.type = 'button';
bubble.className = 'booking-bubble';
bubble.setAttribute('aria-label', 'Réserver un appel avec Antoine');
bubble.innerHTML = `<span class="booking-bubble__icon">${LOGO_MARK}</span>`;
document.body.appendChild(bubble);

// Panneau qui se déplie au-dessus de la bulle : d'abord quelques questions (une par écran),
// puis le calendrier Calendly pré-rempli. Le lien "Prendre rendez-vous directement" saute les questions.
const panel = document.createElement('div');
panel.className = 'booking-panel';
panel.innerHTML = `
  <div class="booking-panel__head">
    <span class="booking-panel__title">Parlons de votre établissement</span>
    <button type="button" class="booking-panel__close" aria-label="Fermer">✕</button>
  </div>
  <div class="quiz__progress" aria-hidden="true"><span></span></div>
  <div class="booking-panel__body" aria-live="polite"></div>
  <div class="quiz__foot">
    <button type="button" class="quiz__back">← Retour</button>
    <button type="button" class="quiz__direct">Prendre rendez-vous directement</button>
  </div>
`;
document.body.appendChild(panel);

// Les questions. "when" : n'afficher l'écran que si la condition est vraie.
const hasMachine = (a) => a.offre === 'Un ou plusieurs distributeurs';
const QUIZ = [
  { id: 'type', label: "Type d'établissement", q: 'Vous êtes…', hint: 'Quelques questions rapides (1 minute) avant de choisir votre créneau.',
    options: ['Une école ou une université', 'Un lycée', 'Une entreprise', 'Autre'] },
  { id: 'effectif', label: 'Effectif', q: 'Combien de personnes sur votre site ?',
    options: ['Moins de 300', '300 à 1 000', '1 000 à 3 000', 'Plus de 3 000'] },
  { id: 'offre', label: 'Offre actuelle', q: "Aujourd'hui, pour la pause, vous avez…",
    options: ["Rien pour l'instant", 'Un ou plusieurs distributeurs', 'Une cafétéria ou un point de restauration', 'Autre'] },
  { id: 'actuel', type: 'groups', when: hasMachine, q: 'Et votre distributeur actuel ?', groups: [
    { id: 'satisfaction', label: 'Satisfaction', q: 'Vos usagers en sont…', options: ['Satisfaits', 'Mitigés', 'Pas satisfaits', 'Je ne sais pas'] },
    { id: 'contrat', label: 'Fin du contrat', q: 'Votre contrat se termine…', options: ['Dans moins de 6 mois', 'Dans 6 à 12 mois', "Dans plus d'un an", 'Je ne sais pas'] },
  ] },
  { id: 'redevance', type: 'sliders', when: hasMachine, q: 'Ce que votre prestataire vous reverse',
    hint: 'Facultatif. Un ordre de grandeur nous aide à préparer une proposition chiffrée.',
    tip: "Avec The Corner, l'installation est gratuite et votre établissement touche une commission sur les ventes.",
    sliders: [
      { id: 'montant', label: 'Redevance annuelle', min: 0, max: 20000, step: 250,
        fmt: (v) => `${Number(v).toLocaleString('fr-FR')} €${v >= 20000 ? ' et plus' : ''} par an` },
      { id: 'pourcentage', label: 'Pourcentage sur les ventes', min: 0, max: 30, step: 1,
        fmt: (v) => `${v} %${v >= 30 ? ' et plus' : ''}` },
    ] },
  { id: 'interets', label: 'Intérêts', type: 'multi', q: "Qu'est-ce qui vous intéresse ?", hint: 'Plusieurs choix possibles.',
    tip: "Entretien et réapprovisionnement inclus : vous n'avez rien à gérer.",
    options: ['Café de spécialité', 'Snacking', 'Fontaine à eau', 'Frigo connecté (plats frais ou surgelés)', 'Distributeur de plats chauds (nouilles, soupes…)', 'Je ne sais pas encore'] },
  { id: 'contact', type: 'contact', q: 'Où peut-on vous joindre ?',
    roles: ['Direction', 'Services généraux', 'Vie étudiante', 'Autre'] },
];

const quizBody = panel.querySelector('.booking-panel__body');
const quizBar = panel.querySelector('.quiz__progress span');
const quizBack = panel.querySelector('.quiz__back');
const quizFoot = panel.querySelector('.quiz__foot');
let answers = {};
let stepHistory = [];
let current = 0;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const visibleSteps = () => QUIZ.filter((s) => !s.when || s.when(answers));
const nextIndex = (from) => {
  for (let i = from + 1; i < QUIZ.length; i++) if (!QUIZ[i].when || QUIZ[i].when(answers)) return i;
  return -1;
};

function goTo(i, push = true) {
  if (push) stepHistory.push(current);
  current = i;
  renderStep();
}
function advance() {
  const n = nextIndex(current);
  n === -1 ? showCalendar() : goTo(n);
}

function optionButtons(group, options, multi) {
  const chosen = answers[group];
  return options.map((o) => {
    const on = multi ? (chosen || []).includes(o) : chosen === o;
    return `<button type="button" class="quiz__opt${on ? ' is-on' : ''}" data-group="${group}" data-value="${esc(o)}" aria-pressed="${on}">${esc(o)}</button>`;
  }).join('');
}

function renderStep() {
  const step = QUIZ[current];
  const steps = visibleSteps();
  const pos = steps.indexOf(step) + 1;
  quizBar.style.width = `${(pos / (steps.length + 1)) * 100}%`;
  quizFoot.hidden = false;
  quizBack.style.visibility = stepHistory.length ? 'visible' : 'hidden';

  let html = `<div class="quiz__step"><p class="quiz__count">${pos} / ${steps.length}</p><h3 class="quiz__q">${esc(step.q)}</h3>`;
  if (step.hint) html += `<p class="quiz__hint">${esc(step.hint)}</p>`;

  if (!step.type) {
    html += `<div class="quiz__opts">${optionButtons(step.id, step.options, false)}</div>`;
  } else if (step.type === 'groups') {
    html += step.groups.map((g) => `<p class="quiz__sub">${esc(g.q)}</p><div class="quiz__opts quiz__opts--row">${optionButtons(g.id, g.options, false)}</div>`).join('');
    html += '<button type="button" class="btn btn--primary btn--small quiz__next">Continuer</button>';
  } else if (step.type === 'multi') {
    html += `<div class="quiz__opts">${optionButtons(step.id, step.options, true)}</div>`;
    html += '<button type="button" class="btn btn--primary btn--small quiz__next">Continuer</button>';
  } else if (step.type === 'sliders') {
    html += step.sliders.map((s) => {
      const v = answers[s.id];
      const set = typeof v === 'number';
      return `<div class="quiz__slider${v === 'Ne sait pas' ? ' is-off' : ''}">
        <div class="quiz__slider-head"><span>${esc(s.label)}</span><strong data-out="${s.id}">${set ? esc(s.fmt(v)) : v === 'Ne sait pas' ? 'Je ne sais pas' : 'Faites glisser'}</strong></div>
        <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${set ? v : s.min}" data-slider="${s.id}" aria-label="${esc(s.label)}">
        <button type="button" class="quiz__unknown${v === 'Ne sait pas' ? ' is-on' : ''}" data-unknown="${s.id}">Je ne sais pas</button>
      </div>`;
    }).join('');
    html += '<button type="button" class="btn btn--primary btn--small quiz__next">Continuer</button>';
  } else if (step.type === 'contact') {
    const c = answers;
    html += `<form class="quiz__form" novalidate>
      <input type="text" name="_gotcha" class="quiz__trap" tabindex="-1" autocomplete="off">
      <label>Prénom et nom<input name="nom" autocomplete="name" required value="${esc(c.nom || '')}"></label>
      <label>Établissement<input name="ecole" autocomplete="organization" required value="${esc(c.ecole || '')}"></label>
      <label>Email professionnel<input name="email" type="email" autocomplete="email" required value="${esc(c.email || '')}"></label>
      <label>Téléphone <span>(facultatif)</span><input name="tel" type="tel" autocomplete="tel" value="${esc(c.tel || '')}"></label>
      <p class="quiz__sub">Votre rôle</p>
      <div class="quiz__opts quiz__opts--row">${optionButtons('role', step.roles, false)}</div>
      <p class="quiz__err" role="alert"></p>
      <button type="submit" class="btn btn--primary btn--small quiz__next">Choisir mon créneau →</button>
      <p class="quiz__legal">Vos réponses servent uniquement à préparer notre échange. <a href="/politique-confidentialite/">Confidentialité</a></p>
    </form>`;
  }
  if (step.tip) html += `<p class="quiz__tip">${esc(step.tip)}</p>`;
  html += '</div>';
  quizBody.innerHTML = html;
  quizBody.scrollTop = 0;
  bindStep(step);
}

function bindStep(step) {
  quizBody.querySelectorAll('.quiz__opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { group, value } = btn.dataset;
      if (step.type === 'multi') {
        const list = answers[group] || [];
        answers[group] = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
        btn.classList.toggle('is-on');
        btn.setAttribute('aria-pressed', btn.classList.contains('is-on'));
        return;
      }
      answers[group] = value;
      btn.parentNode.querySelectorAll('.quiz__opt').forEach((b) => {
        b.classList.toggle('is-on', b === btn);
        b.setAttribute('aria-pressed', b === btn);
      });
      // Choix unique sur un écran à une seule question : on passe directement à la suite
      if (!step.type) setTimeout(advance, 180);
    });
  });

  quizBody.querySelectorAll('[data-slider]').forEach((input) => {
    const s = step.sliders.find((x) => x.id === input.dataset.slider);
    input.addEventListener('input', () => {
      answers[s.id] = Number(input.value);
      quizBody.querySelector(`[data-out="${s.id}"]`).textContent = s.fmt(answers[s.id]);
      input.closest('.quiz__slider').classList.remove('is-off');
      quizBody.querySelector(`[data-unknown="${s.id}"]`).classList.remove('is-on');
    });
  });
  quizBody.querySelectorAll('[data-unknown]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.unknown;
      answers[id] = 'Ne sait pas';
      btn.classList.add('is-on');
      btn.closest('.quiz__slider').classList.add('is-off');
      quizBody.querySelector(`[data-out="${id}"]`).textContent = 'Je ne sais pas';
    });
  });

  const next = quizBody.querySelector('.quiz__next');
  if (next && step.type !== 'contact') next.addEventListener('click', advance);

  const form = quizBody.querySelector('.quiz__form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      ['nom', 'ecole', 'email', 'tel'].forEach((k) => { answers[k] = (data.get(k) || '').toString().trim(); });
      const err = form.querySelector('.quiz__err');
      if (!answers.nom || !answers.ecole || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email)) {
        err.textContent = 'Merci de renseigner votre nom, votre établissement et un email valide.';
        return;
      }
      if (data.get('_gotcha')) return;
      sendQuiz();
      showCalendar(true);
    });
  }
}

// Envoi des réponses par email (Formspree), même si la personne ne réserve pas ensuite
function sendQuiz() {
  const a = answers;
  const fmtSlider = (id) => {
    const s = QUIZ.find((x) => x.id === 'redevance').sliders.find((x) => x.id === id);
    return typeof a[id] === 'number' ? s.fmt(a[id]) : a[id] || 'Non renseigné';
  };
  const data = new FormData();
  data.set('_subject', `Parcours rendez-vous : ${a.ecole}`);
  data.set('Nom', a.nom);
  data.set('Établissement', a.ecole);
  data.set('email', a.email);
  data.set('Téléphone', a.tel || 'Non renseigné');
  data.set('Rôle', a.role || 'Non renseigné');
  QUIZ.forEach((s) => {
    if (s.when && !s.when(a)) return;
    if (s.type === 'groups') s.groups.forEach((g) => data.set(g.label, a[g.id] || 'Non renseigné'));
    else if (s.type === 'sliders') s.sliders.forEach((x) => data.set(x.label, fmtSlider(x.id)));
    else if (s.label) data.set(s.label, Array.isArray(a[s.id]) ? a[s.id].join(', ') || 'Non renseigné' : a[s.id] || 'Non renseigné');
  });
  fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } }).catch(() => {});
}

// Calendly : le script n'est pas chargé sur toutes les pages, on le charge au besoin
function withCalendly(cb) {
  if (window.Calendly) return cb();
  let s = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
  if (!s) {
    s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    document.head.appendChild(s);
  }
  s.addEventListener('load', cb, { once: true });
}

function showCalendar(fromQuiz = false) {
  if (current !== -1) stepHistory.push(current);
  current = -1;
  quizBar.style.width = '100%';
  quizBack.style.visibility = 'visible';
  panel.querySelector('.quiz__direct').hidden = true;
  const first = (answers.nom || '').split(' ')[0];
  quizBody.innerHTML = `<p class="quiz__ready">${fromQuiz ? `Merci${first ? ` ${esc(first)}` : ''} ! ` : ''}Choisissez le créneau qui vous arrange pour un échange de 30 minutes.</p><div class="quiz__cal"></div>`;
  // Nom et email pré-remplis via les paramètres d'URL reconnus par Calendly
  const prefill = fromQuiz ? `?name=${encodeURIComponent(answers.nom)}&email=${encodeURIComponent(answers.email)}` : '';
  withCalendly(() => {
    window.Calendly.initInlineWidget({
      url: CALENDLY_URL + prefill,
      parentElement: quizBody.querySelector('.quiz__cal'),
    });
  });
}

quizBack.addEventListener('click', () => {
  if (!stepHistory.length) return;
  panel.querySelector('.quiz__direct').hidden = false;
  goTo(stepHistory.pop(), false);
});
panel.querySelector('.quiz__direct').addEventListener('click', () => showCalendar(false));

// Petite bulle de message près de l'icône : apparaît après 20 s ou à mi-page,
// une seule fois par visite, jamais si le panneau a déjà été ouvert. Elle ne masque rien.
const teaser = document.createElement('div');
teaser.className = 'booking-teaser';
teaser.innerHTML = `
  <button type="button" class="booking-teaser__msg">👋 Un projet pour votre établissement&nbsp;? 1&nbsp;minute pour préparer votre échange.</button>
  <button type="button" class="booking-teaser__close" aria-label="Fermer le message">✕</button>
`;
document.body.appendChild(teaser);

const TEASER_KEY = 'tc-teaser-seen';
const teaserSeen = () => { try { return sessionStorage.getItem(TEASER_KEY) === '1'; } catch (e) { return false; } };
const markTeaserSeen = () => { try { sessionStorage.setItem(TEASER_KEY, '1'); } catch (e) { /* stockage indisponible */ } };
function hideTeaser() {
  teaser.classList.remove('is-visible');
  markTeaserSeen();
}
function showTeaser() {
  if (teaserSeen() || panel.classList.contains('is-open')) return;
  teaser.classList.add('is-visible');
  window.removeEventListener('scroll', onTeaserScroll);
  clearTimeout(teaserTimer);
}
function onTeaserScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max > 0 && window.scrollY / max >= 0.5) showTeaser();
}
let teaserTimer;
if (!teaserSeen()) {
  teaserTimer = setTimeout(showTeaser, 20000);
  window.addEventListener('scroll', onTeaserScroll, { passive: true });
}
teaser.querySelector('.booking-teaser__msg').addEventListener('click', () => openBookingPanel());
teaser.querySelector('.booking-teaser__close').addEventListener('click', hideTeaser);

let quizStarted = false;
function openBookingPanel() {
  panel.classList.add('is-open');
  hideTeaser();
  clearTimeout(teaserTimer);
  window.removeEventListener('scroll', onTeaserScroll);
  if (!quizStarted) {
    quizStarted = true;
    renderStep();
  }
}
function closeBookingPanel() {
  panel.classList.remove('is-open');
}
bubble.addEventListener('click', () => {
  panel.classList.contains('is-open') ? closeBookingPanel() : openBookingPanel();
});
panel.querySelector('.booking-panel__close').addEventListener('click', closeBookingPanel);

// Lien "Prendre rendez-vous" de la page contact : ouvre le même panneau
const calendly = document.querySelector('[data-calendly]');
if (calendly) {
  calendly.addEventListener('click', (e) => {
    e.preventDefault();
    openBookingPanel();
  });
}

// Bouton "Parlons-en" du header : ouvre directement la prise de rendez-vous,
// pour ne plus faire doublon avec le lien "Contact" du menu (qui mène au formulaire)
document.querySelectorAll('[data-book-call]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openBookingPanel();
  });
});

// Formulaire : envoi via Formspree (AJAX, sans quitter la page).
// Renseigner FORMSPREE_ENDPOINT une fois le compte créé (ex. https://formspree.io/f/abcdwxyz).
// Tant que c'est vide, ou en cas d'erreur réseau, on retombe sur un mailto en secours.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maenkdqo';
const form = document.getElementById('leadForm');
const note = document.getElementById('formNote');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nom = (data.get('nom') || '').toString().trim();
    const ecole = (data.get('ecole') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();

    if (!nom || !ecole || !email) {
      note.textContent = 'Merci de renseigner au moins votre nom, votre établissement et votre email.';
      note.className = 'form__note is-err';
      return;
    }

    const sendByMailto = () => {
      const lignes = [
        `Nom : ${nom}`,
        `Établissement : ${ecole}`,
        `Fonction : ${data.get('fonction') || '—'}`,
        `Nombre d'étudiants : ${data.get('taille') || '—'}`,
        `Email : ${email}`,
        `Téléphone : ${data.get('tel') || '—'}`,
        '',
        'Message :',
        (data.get('message') || '—').toString(),
      ];
      const sujet = `Demande d'étude — ${ecole}`;
      const corps = lignes.join('\n');
      window.location.href =
        `mailto:antoine@cafethecorner.fr?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      note.textContent = 'Votre messagerie s’ouvre pour finaliser l’envoi. Vous pouvez aussi nous appeler au 07 82 37 41 21.';
      note.className = 'form__note is-ok';
    };

    if (!FORMSPREE_ENDPOINT) {
      sendByMailto();
      return;
    }

    data.set('_subject', `Demande d'étude — ${ecole}`);
    const submitBtn = form.querySelector('.form__submit');
    submitBtn.disabled = true;
    note.textContent = 'Envoi en cours…';
    note.className = 'form__note';

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        note.textContent = 'Merci, votre demande a bien été envoyée ! On revient vers vous sous 24h.';
        note.className = 'form__note is-ok';
      } else {
        sendByMailto();
      }
    } catch (err) {
      sendByMailto();
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Carrousel des écoles (accueil) : défilement infini dans les deux sens.
// Le track réel est dupliqué 2x avant et 2x après (doublons aria-hidden) pour
// pouvoir tourner sans limite ; une fois la transition finie, on se "re-centre"
// silencieusement (sans animation) dans le bloc réel du milieu.
const logosTrack = document.getElementById('logosTrack');
const logosPrev = document.getElementById('logosPrev');
const logosNext = document.getElementById('logosNext');
if (logosTrack && logosPrev && logosNext) {
  const realCards = Array.from(logosTrack.children);
  const realCount = realCards.length;
  const CLONE_SETS = 2;
  logosTrack.innerHTML = '';
  for (let s = 0; s < CLONE_SETS; s++) {
    realCards.forEach((c) => {
      const clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      logosTrack.appendChild(clone);
    });
  }
  realCards.forEach((c) => logosTrack.appendChild(c));
  for (let s = 0; s < CLONE_SETS; s++) {
    realCards.forEach((c) => {
      const clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      logosTrack.appendChild(clone);
    });
  }

  const allCards = Array.from(logosTrack.children);
  let position = realCount * CLONE_SETS;
  const leftPeekRatio = 0.2;
  const cardStep = () => {
    const gap = parseFloat(getComputedStyle(logosTrack).columnGap || 0);
    return allCards[0].getBoundingClientRect().width + gap;
  };
  const render = (animate) => {
    const step = cardStep();
    logosTrack.style.transition = animate ? '' : 'none';
    logosTrack.style.transform = `translateX(-${position * step - step * leftPeekRatio}px)`;
    if (!animate) {
      void logosTrack.offsetHeight;
      logosTrack.style.transition = '';
    }
  };
  const recenter = () => {
    if (position >= realCount * (CLONE_SETS + 1)) { position -= realCount; render(false); }
    else if (position < realCount * CLONE_SETS) { position += realCount; render(false); }
  };
  logosTrack.addEventListener('transitionend', (e) => { if (e.propertyName === 'transform') recenter(); });
  logosNext.addEventListener('click', () => { position += 1; render(true); });
  logosPrev.addEventListener('click', () => { position -= 1; render(true); });
  window.addEventListener('resize', () => render(false));
  render(false);
}

// Filtres de la page Références : montre/masque les fiches par catégorie
const refsFilter = document.querySelector('.refs-filter');
if (refsFilter) {
  const buttons = refsFilter.querySelectorAll('.refs-filter__btn');
  const cards = document.querySelectorAll('.refs-grid .logos__card');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });
}

// Bandeau cookies — Google Analytics n'est chargé qu'après consentement
const GA_ID = 'G-Z56GHZDH5M';

function loadAnalytics() {
  if (window.tcAnalyticsLoaded) return;
  window.tcAnalyticsLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}

const banner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieRefuse = document.getElementById('cookieRefuse');
if (banner && cookieAccept && cookieRefuse) {
  let consent = null;
  try { consent = localStorage.getItem('tc_cookie_consent'); } catch (_) {}
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'refused') {
    banner.hidden = false;
  }
  cookieAccept.addEventListener('click', () => {
    banner.hidden = true;
    try { localStorage.setItem('tc_cookie_consent', 'accepted'); } catch (_) {}
    loadAnalytics();
  });
  cookieRefuse.addEventListener('click', () => {
    banner.hidden = true;
    try { localStorage.setItem('tc_cookie_consent', 'refused'); } catch (_) {}
  });
}
