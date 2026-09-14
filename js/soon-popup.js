/*
 * Popup "Novidades em breve" — Morenas Store
 * - Aparece automaticamente 4s após carregar (uma vez a cada 7 dias)
 * - Pode ser disparado por outras telas via: window.dispatchEvent(new CustomEvent('morenas:open-soon-popup'))
 * - Dismiss persistido em localStorage
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'morenas-soon-popup';
  const DAYS_TO_REPEAT = 7;
  const WHATSAPP = '5599982508435';
  const AUTO_DELAY_MS = 4000;

  function getDismissed() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const age = (Date.now() - (data.dismissedAt || 0)) / 1000 / 60 / 60 / 24;
      return age < DAYS_TO_REPEAT ? data : null;
    } catch (_) { return null; }
  }

  function setDismissed(extra = {}) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dismissedAt: Date.now(),
        ...extra,
      }));
    } catch (_) {}
  }

  // ===== CSS =====
  const CSS = `
    .soon-pop__backdrop {
      position: fixed; inset: 0;
      background: hsla(20, 18%, 8%, 0.55);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 380ms cubic-bezier(0.23, 0.86, 0.39, 0.96);
    }
    .soon-pop__backdrop.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .soon-pop {
      position: fixed; inset: 0;
      display: flex; align-items: center; justify-content: center;
      padding: clamp(16px, 4vw, 32px);
      z-index: 9999;
      pointer-events: none;
    }
    .soon-pop__card {
      position: relative;
      width: min(560px, 100%);
      max-height: calc(100vh - 32px);
      overflow: hidden;
      background: linear-gradient(155deg, #faf8f5 0%, #f4ede2 100%);
      color: hsl(20, 18%, 12%);
      border-radius: 24px;
      box-shadow:
        0 30px 80px -20px hsla(20, 40%, 8%, 0.45),
        0 0 0 1px hsla(20, 18%, 12%, 0.06);
      padding: clamp(28px, 5vw, 48px) clamp(24px, 5vw, 44px);
      pointer-events: auto;
      opacity: 0;
      transform: translateY(28px) scale(0.96);
      transition:
        opacity 480ms cubic-bezier(0.23, 0.86, 0.39, 0.96),
        transform 520ms cubic-bezier(0.23, 0.86, 0.39, 0.96);
      isolation: isolate;
    }
    .soon-pop.is-open .soon-pop__card {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Glow verde atrás */
    .soon-pop__card::before {
      content: "";
      position: absolute;
      top: -120px; right: -120px;
      width: 380px; height: 380px;
      border-radius: 50%;
      background: radial-gradient(circle,
        hsla(152, 85%, 32.9%, 0.55) 0%,
        hsla(152, 80%, 31.4%, 0.18) 38%,
        transparent 70%);
      filter: blur(40px);
      z-index: -1;
      animation: soonPopBreathe 7s ease-in-out infinite;
    }
    /* Glow ametista canto inferior */
    .soon-pop__card::after {
      content: "";
      position: absolute;
      bottom: -140px; left: -140px;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle,
        hsla(285, 65%, 60%, 0.30) 0%,
        transparent 70%);
      filter: blur(40px);
      z-index: -1;
    }
    @keyframes soonPopBreathe {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50%      { transform: scale(1.12); opacity: 1; }
    }

    .soon-pop__close {
      position: absolute;
      top: 14px; right: 14px;
      width: 36px; height: 36px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: hsla(20, 18%, 12%, 0.06);
      color: hsl(20, 18%, 18%);
      border: none;
      cursor: pointer;
      transition: background 200ms ease, transform 200ms ease;
      font-size: 18px;
      line-height: 1;
    }
    .soon-pop__close:hover {
      background: hsla(20, 18%, 12%, 0.12);
      transform: rotate(90deg);
    }
    .soon-pop__close svg { display: block; }

    .soon-pop__eyebrow {
      display: inline-flex; align-items: center; gap: 10px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 3.5px;
      text-transform: uppercase;
      color: hsl(152, 80%, 25%);
      margin-bottom: 18px;
    }
    .soon-pop__eyebrow-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: hsl(152, 80%, 29.9%);
      box-shadow: 0 0 0 0 hsla(152, 80%, 31.4%, 0.55);
      animation: soonPopDot 1.6s ease-in-out infinite;
    }
    @keyframes soonPopDot {
      0%, 100% { box-shadow: 0 0 0 0 hsla(152, 80%, 31.4%, 0.55); }
      50%      { box-shadow: 0 0 0 9px hsla(152, 80%, 31.4%, 0); }
    }

    .soon-pop__title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(34px, 5.5vw, 48px);
      line-height: 1.02;
      font-weight: 900;
      letter-spacing: -1.5px;
      margin: 0 0 12px;
      color: hsl(20, 18%, 10%);
    }
    .soon-pop__title em {
      font-style: italic;
      font-weight: 900;
      color: hsl(152, 80%, 28.6%);
    }
    .soon-pop__sub {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.55;
      color: hsl(20, 12%, 32%);
      margin: 0 0 28px;
      max-width: 44ch;
    }

    .soon-pop__form {
      display: flex; gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 16px;
    }
    .soon-pop__input {
      flex: 1 1 220px;
      min-width: 0;
      height: 48px;
      padding: 0 18px;
      border-radius: 999px;
      border: 1px solid hsla(20, 18%, 12%, 0.18);
      background: hsla(0, 0%, 100%, 0.7);
      color: hsl(20, 18%, 12%);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1;
      box-sizing: border-box;
      -webkit-appearance: none;
      appearance: none;
      transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
    }
    .soon-pop__input::placeholder {
      color: hsl(20, 12%, 50%);
    }
    .soon-pop__input:focus {
      outline: none;
      border-color: hsl(152, 80%, 31.4%);
      background: white;
      box-shadow: 0 0 0 4px hsla(152, 80%, 31.4%, 0.15);
    }
    .soon-pop__submit {
      height: 48px;
      padding: 0 24px;
      border-radius: 999px;
      border: none;
      background: hsl(20, 18%, 12%);
      color: hsl(35, 30%, 95%);
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.3px;
      line-height: 1;
      cursor: pointer;
      box-sizing: border-box;
      -webkit-appearance: none;
      appearance: none;
      transition: transform 200ms ease, background 200ms ease, box-shadow 200ms ease;
      white-space: nowrap;
    }
    .soon-pop__submit:hover {
      background: hsl(152, 80%, 26.8%);
      transform: translateY(-1px);
      box-shadow: 0 10px 24px -10px hsla(152, 80%, 26.8%, 0.55);
    }
    .soon-pop__submit:active { transform: translateY(0); }

    .soon-pop__wa {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      color: hsl(20, 12%, 30%);
      text-decoration: none;
      transition: color 200ms ease;
    }
    .soon-pop__wa:hover { color: hsl(152, 80%, 26.8%); }
    .soon-pop__wa-icon {
      width: 16px; height: 16px;
      color: hsl(142, 70%, 40%);
    }

    .soon-pop__hint {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      letter-spacing: 0.4px;
      color: hsl(20, 12%, 45%);
      margin-top: 16px;
      display: flex; justify-content: space-between; align-items: center;
      gap: 12px;
    }
    .soon-pop__seal {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      font-size: 12px;
      color: hsl(20, 18%, 18%);
    }

    .soon-pop__success {
      display: none;
      text-align: center;
      padding: 8px 0 4px;
    }
    .soon-pop__success-icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: hsl(152, 80%, 87.4%);
      color: hsl(152, 80%, 26.8%);
      display: inline-flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .soon-pop__success-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      font-style: italic;
      margin: 0 0 8px;
    }
    .soon-pop__success-text {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      color: hsl(20, 12%, 32%);
      margin: 0;
    }
    .soon-pop.is-success .soon-pop__form,
    .soon-pop.is-success .soon-pop__sub,
    .soon-pop.is-success .soon-pop__hint { display: none; }
    .soon-pop.is-success .soon-pop__success { display: block; }

    /* Dark theme: card escuro elegante */
    :root.dark .soon-pop__card {
      background: linear-gradient(155deg, #1a1612 0%, #221a18 100%);
      color: hsl(35, 25%, 92%);
      box-shadow:
        0 30px 80px -20px hsla(0, 0%, 0%, 0.7),
        0 0 0 1px hsla(35, 25%, 90%, 0.08);
    }
    :root.dark .soon-pop__title { color: hsl(35, 30%, 96%); }
    :root.dark .soon-pop__sub { color: hsl(35, 12%, 70%); }
    :root.dark .soon-pop__close {
      background: hsla(35, 25%, 90%, 0.08);
      color: hsl(35, 25%, 90%);
    }
    :root.dark .soon-pop__input {
      background: hsla(0, 0%, 100%, 0.05);
      border-color: hsla(35, 25%, 90%, 0.18);
      color: hsl(35, 25%, 92%);
    }
    :root.dark .soon-pop__input::placeholder { color: hsl(35, 12%, 55%); }
    :root.dark .soon-pop__submit {
      background: hsl(152, 80%, 31.4%);
      color: white;
    }
    :root.dark .soon-pop__submit:hover { background: hsl(152, 85%, 32.9%); }
    :root.dark .soon-pop__wa { color: hsl(35, 12%, 70%); }
    :root.dark .soon-pop__hint { color: hsl(35, 12%, 55%); }
    :root.dark .soon-pop__seal { color: hsl(35, 25%, 90%); }
    :root.dark .soon-pop__success-icon { background: hsla(152, 80%, 31.4%, 0.18); color: hsl(152, 85%, 38.2%); }

    @media (max-width: 480px) {
      .soon-pop__title { font-size: 30px; letter-spacing: -1px; }
      .soon-pop__form { flex-direction: column; gap: 10px; align-items: stretch; }
      .soon-pop__input { flex: 0 0 auto; width: 100%; height: 50px; padding: 0 18px; }
      .soon-pop__submit { width: 100%; flex: 0 0 auto; height: 50px; padding: 0 24px; }
      .soon-pop__hint { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .soon-pop__backdrop, .soon-pop__card { transition: opacity 200ms ease; transform: none; }
      .soon-pop__card::before, .soon-pop__eyebrow-dot { animation: none; }
    }
  `;

  // ===== Mount =====
  function mount() {
    if (document.getElementById('soon-pop-styles')) return;
    const style = document.createElement('style');
    style.id = 'soon-pop-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="soon-pop__backdrop" id="soonPopBackdrop" aria-hidden="true"></div>
      <div class="soon-pop" id="soonPop" role="dialog" aria-modal="true" aria-labelledby="soonPopTitle" aria-hidden="true">
        <div class="soon-pop__card">
          <button class="soon-pop__close" id="soonPopClose" type="button" aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>

          <div class="soon-pop__eyebrow">
            <span class="soon-pop__eyebrow-dot"></span>
            Coleção 02 · Lançamento
          </div>

          <h2 class="soon-pop__title" id="soonPopTitle">
            Novidades<br/><em>em breve.</em>
          </h2>

          <p class="soon-pop__sub">
            Estamos finalizando a nova coleção. Deixe seu e-mail e seja a primeira a saber quando os modelos entrarem no ar — com acesso antecipado antes de qualquer outra pessoa.
          </p>

          <form class="soon-pop__form" id="soonPopForm" novalidate>
            <input
              class="soon-pop__input"
              id="soonPopEmail"
              type="email"
              required
              placeholder="seu melhor e-mail"
              autocomplete="email"
            />
            <button class="soon-pop__submit" type="submit">Quero ser avisada</button>
          </form>

          <div class="soon-pop__hint">
            <a class="soon-pop__wa" id="soonPopWa" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Quero saber das novidades da Morenas Store.')}" target="_blank" rel="noopener">
              <svg class="soon-pop__wa-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.85 11.85 0 0 0 12.01 0C5.4 0 .04 5.35.04 11.94c0 2.1.56 4.16 1.61 5.97L0 24l6.27-1.63a11.93 11.93 0 0 0 5.74 1.46h.01c6.6 0 11.95-5.35 11.95-11.94 0-3.19-1.24-6.19-3.5-8.41zM12.02 21.8a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.72.97.99-3.62-.23-.37a9.83 9.83 0 0 1-1.51-5.27c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.91a9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.45 9.86-9.98 9.86z"/></svg>
              Falar no WhatsApp
            </a>
            <span class="soon-pop__seal">@morenasstore</span>
          </div>

          <div class="soon-pop__success" aria-live="polite">
            <div class="soon-pop__success-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 class="soon-pop__success-title">Pronto.</h3>
            <p class="soon-pop__success-text">Você vai ser a primeira a saber quando a Coleção 02 chegar.</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    const backdrop = document.getElementById('soonPopBackdrop');
    const pop = document.getElementById('soonPop');
    const closeBtn = document.getElementById('soonPopClose');
    const form = document.getElementById('soonPopForm');
    const emailInput = document.getElementById('soonPopEmail');

    function open({ prefillEmail } = {}) {
      pop.style.pointerEvents = 'auto';
      backdrop.classList.add('is-open');
      pop.classList.add('is-open');
      pop.classList.remove('is-success');
      pop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (prefillEmail && !emailInput.value) emailInput.value = prefillEmail;
      emailInput.style.borderColor = '';
      setTimeout(() => emailInput.focus(), 320);
    }
    function close() {
      backdrop.classList.remove('is-open');
      pop.classList.remove('is-open');
      pop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setDismissed();
      setTimeout(() => { pop.style.pointerEvents = 'none'; }, 400);
    }

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pop.classList.contains('is-open')) close();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        emailInput.focus();
        emailInput.style.borderColor = 'hsl(0, 70%, 55%)';
        return;
      }
      // Persistir lead localmente (sem backend de leads ainda)
      try {
        const leads = JSON.parse(localStorage.getItem('morenas-leads') || '[]');
        leads.push({ email, at: new Date().toISOString(), page: location.pathname });
        localStorage.setItem('morenas-leads', JSON.stringify(leads));
      } catch (_) {}
      setDismissed({ email, subscribed: true });
      pop.classList.add('is-success');
      setTimeout(close, 2400);
    });

    // Evento custom — sempre abre, ignora dismiss (clique deliberado do usuário)
    window.addEventListener('morenas:open-soon-popup', (e) => {
      open({ prefillEmail: e?.detail?.email });
    });

    // ===== Listener global =====
    // Modo "pré-lançamento": QUALQUER clique abre o popup, exceto whitelist
    // (controles essenciais de navegação e canais reais de contato).
    const IGNORE_SELECTORS = [
      '.soon-pop',                    // qualquer coisa dentro do popup
      '.soon-pop__backdrop',          // backdrop fecha o popup
      'a[href*="wa.me"]',             // WhatsApp (canal real)
      'a[href^="tel:"]',              // ligação direta
      'a[href^="mailto:"]',           // email direto
      '.nav__logo',                   // logo do header → home
      '.drawer__brand',               // logo do drawer → home
      '.theme-toggle',                // alternar tema
      '#themeToggle',
      '.nav__toggle',                 // abrir hamburger drawer
      '#navToggle',
      '.drawer__close',               // fechar drawer (X)
      '[data-drawer-close]',          // qualquer elemento que fecha drawer
      '.wa-float',                    // botão flutuante de WhatsApp
      '[data-no-soon]',               // opt-out explícito
    ].join(', ');

    function shouldIgnoreClick(target) {
      if (!target || target.nodeType !== 1) return true;
      return !!target.closest(IGNORE_SELECTORS);
    }

    function getPrefillEmail(target) {
      const form = target.closest('form');
      const emailField = form?.querySelector('input[type="email"]');
      return emailField?.value?.trim();
    }

    document.addEventListener('click', (e) => {
      // Não disparar se o popup já estiver aberto
      if (pop.classList.contains('is-open')) return;
      if (shouldIgnoreClick(e.target)) return;
      e.preventDefault();
      open({ prefillEmail: getPrefillEmail(e.target) });
    });

    document.addEventListener('submit', (e) => {
      if (pop.classList.contains('is-open')) return;
      if (shouldIgnoreClick(e.target)) return;
      e.preventDefault();
      const emailField = e.target.querySelector?.('input[type="email"]');
      open({ prefillEmail: emailField?.value?.trim() });
    });

    // Auto-show
    if (!getDismissed()) {
      setTimeout(() => {
        if (!getDismissed()) open();
      }, AUTO_DELAY_MS);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
