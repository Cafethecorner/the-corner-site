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

// Panneau qui se déplie au-dessus de la bulle, avec le calendrier Calendly intégré dedans
const panel = document.createElement('div');
panel.className = 'booking-panel';
panel.innerHTML = `
  <div class="booking-panel__head">
    <span class="booking-panel__title">Réserver un appel</span>
    <button type="button" class="booking-panel__close" aria-label="Fermer">✕</button>
  </div>
  <p class="booking-panel__intro">30 minutes pour parler de votre établissement et voir comment on peut vous accompagner.</p>
  <div class="booking-panel__body"></div>
`;
document.body.appendChild(panel);

let calendlyLoaded = false;
function openBookingPanel() {
  panel.classList.add('is-open');
  if (!calendlyLoaded && window.Calendly) {
    window.Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: panel.querySelector('.booking-panel__body'),
    });
    calendlyLoaded = true;
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
