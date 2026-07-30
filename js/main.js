/**
 * DELIGHT - main.js
 * WordPress オリジナルテーマ化を想定した構造
 * 各セクション別にコメントで管理
 */

'use strict';

// DOMContentLoaded 後に全処理を起動
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initDrawer();
  initSideNav();
  initWorksSlider();
  initServiceStrengthsSlider();
  initServiceSectionNav();
  initScrollReveal();
  initPageTop();
  initContactForm();
  initQaAccordion();
  initSmoothScroll();
  initPhilosophyShootingStars();
  initPhilosophyLineDraw();
  initPhilosophyGoodsReveal();
  initPhilosophyEarthRotate();
  initPhilosophyCursor();
});


// ============================================================
//  HEADER
//  スクロール時にクラスを付与してシャドウを表示
// ============================================================
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const logoImg = header.querySelector('.header__logo img');
  if (logoImg) {
    const markLoaded = () => {
      if (logoImg.naturalHeight > 0) logoImg.classList.add('is-loaded');
    };
    logoImg.addEventListener('load', markLoaded);
    logoImg.addEventListener('error', () => logoImg.remove());
    markLoaded();
  }

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初期チェック
}


// ============================================================
//  DRAWER MENU
//  ハンバーガー + 右スライドドロワー（tab以下）
// ============================================================
function initDrawer() {
  const drawer         = document.getElementById('drawer');
  const drawerPanel    = document.getElementById('drawerPanel');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const hamburger      = document.getElementById('hamburger');
  const header         = document.getElementById('header');
  if (!drawer || !drawerPanel || !hamburger) return;

  const mq = window.matchMedia('(max-width: 1024px)');

  const isDrawerOpen = () => drawer.classList.contains('is-open');

  const setDrawerOpen = (isOpen) => {
    drawer.classList.toggle('is-open', isOpen);
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    drawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('is-menu-open', isOpen);
    header?.classList.toggle('is-menu-open', isOpen);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const openDrawer = () => setDrawerOpen(true);

  const toggleDrawer = () => {
    if (!mq.matches) return;
    if (isDrawerOpen()) closeDrawer();
    else openDrawer();
  };

  hamburger.addEventListener('click', toggleDrawer);

  drawerBackdrop?.addEventListener('click', closeDrawer);

  drawerPanel.addEventListener('click', (e) => {
    if (e.target === drawerPanel) closeDrawer();
  });

  drawer.querySelectorAll('.drawer__link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen()) closeDrawer();
  });

  mq.addEventListener('change', (e) => {
    if (!e.matches) closeDrawer();
  });
}


// ============================================================
//  SIDE NAV
//  ヒーローセクション通過後に左側固定ナビを表示
// ============================================================
function initSideNav() {
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('.contact');
  const sideNav = document.getElementById('sideNav');
  const themedSections = Array.from(
    document.querySelectorAll('[data-side-nav-theme]')
  );

  if (!hero || !contact || !sideNav) return;

  const contactThreshold = () => window.innerHeight * 0.2;

  const getActiveTheme = () => {
    const checkY = sideNav.getBoundingClientRect().top + 80;

    for (const section of themedSections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= checkY && rect.bottom > checkY) {
        return section.dataset.sideNavTheme;
      }
    }

    return themedSections[0]?.dataset.sideNavTheme ?? 'light';
  };

  const syncState = () => {
    const heroRect = hero.getBoundingClientRect();
    const heroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
    const reachedContact = contact.getBoundingClientRect().top < contactThreshold();
    const isVisible = !heroVisible && !reachedContact;

    sideNav.classList.toggle('is-visible', isVisible);

    if (isVisible) {
      sideNav.classList.toggle(
        'is-on-blue-section',
        getActiveTheme() === 'blue'
      );
    }
  };

  window.addEventListener('scroll', syncState, { passive: true });
  window.addEventListener('load', syncState);
  window.addEventListener('pageshow', syncState);
  syncState();
}

// ============================================================
//  WORKS SECTION
//  カスタムスライダー（前へ / 次へ）
// ============================================================
function initWorksSlider() {
  const slider     = document.getElementById('worksSlider');
  const btnPrev    = document.getElementById('worksPrev');
  const btnNext    = document.getElementById('worksNext');
  const sliderWrap = slider?.closest('.works__slider-wrap');

  if (!slider || !btnPrev || !btnNext || !sliderWrap) return;

  let currentIndex = 0;

  const SWIPE_THRESHOLD = 50;

  const getItems = () => Array.from(slider.querySelectorAll('.works__item'));

  const getGap = () => {
    const styles = getComputedStyle(slider);
    return parseFloat(styles.columnGap || styles.gap) || 0;
  };

  const getCardWidth = () => {
    const firstItem = slider.querySelector('.works__item');
    return firstItem ? firstItem.getBoundingClientRect().width : 0;
  };

  const getVisible = () => {
    const worksSection = slider.closest('.works');
    const styles = worksSection ? getComputedStyle(worksSection) : null;
    return parseInt(styles?.getPropertyValue('--works-visible-cards'), 10) || 3;
  };

  const getMax = () => Math.max(0, getItems().length - getVisible());

  const getCenterOffset = () => {
    if (getVisible() !== 1) return 0;
    const viewport = slider.parentElement;
    const viewportWidth = viewport
      ? viewport.getBoundingClientRect().width
      : slider.getBoundingClientRect().width;
    const cardWidth = getCardWidth();
    return Math.max(0, (viewportWidth - cardWidth) / 2);
  };

  const getMoveX = (index) => (getCardWidth() + getGap()) * index;

  const setTransform = (index, dragOffset = 0, animate = true) => {
    slider.classList.toggle('is-dragging', !animate);
    const x = getMoveX(index) - getCenterOffset() - dragOffset;
    slider.style.transform = `translateX(-${x}px)`;
  };

  const update = (animate = true) => {
    currentIndex = Math.min(Math.max(currentIndex, 0), getMax());
    setTransform(currentIndex, 0, animate);

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex >= getMax();

    btnPrev.style.opacity = btnPrev.disabled ? '0.3' : '1';
    btnNext.style.opacity = btnNext.disabled ? '0.3' : '1';
  };

  btnPrev.addEventListener('click', () => {
    currentIndex--;
    update();
  });

  btnNext.addEventListener('click', () => {
    currentIndex++;
    update();
  });

  window.addEventListener('resize', () => {
    currentIndex = 0;
    update();
  }, { passive: true });

  // タッチスワイプ
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isTouchDragging = false;
  let preventClick = false;

  sliderWrap.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    isTouchDragging = false;
    preventClick = false;
  }, { passive: true });

  sliderWrap.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (!isTouchDragging) {
      if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 10) return;
      isTouchDragging = true;
    }

    e.preventDefault();

    touchDeltaX = deltaX;

    let dragOffset = touchDeltaX;
    const max = getMax();
    if (currentIndex === 0 && dragOffset > 0) dragOffset *= 0.35;
    if (currentIndex >= max && dragOffset < 0) dragOffset *= 0.35;

    setTransform(currentIndex, dragOffset, false);
  }, { passive: false });

  const finishTouch = () => {
    if (!isTouchDragging) return;

    const max = getMax();
    preventClick = Math.abs(touchDeltaX) > 10;

    if (touchDeltaX < -SWIPE_THRESHOLD && currentIndex < max) {
      currentIndex++;
    } else if (touchDeltaX > SWIPE_THRESHOLD && currentIndex > 0) {
      currentIndex--;
    }

    isTouchDragging = false;
    touchDeltaX = 0;
    update();
  };

  sliderWrap.addEventListener('touchend', finishTouch, { passive: true });
  sliderWrap.addEventListener('touchcancel', finishTouch, { passive: true });

  sliderWrap.addEventListener('click', (e) => {
    if (!preventClick) return;
    e.preventDefault();
    e.stopPropagation();
    preventClick = false;
  }, true);

  update();
}


// ============================================================
//  SERVICE PAGE - 強みスライダー（タブレット以下）
// ============================================================
function initServiceStrengthsSlider() {
  const track = document.getElementById('strengthsTrack');
  const btnPrev = document.getElementById('strengthsPrev');
  const btnNext = document.getElementById('strengthsNext');
  if (!track || !btnPrev || !btnNext) return;

  const items = Array.from(track.querySelectorAll('.service-page__strengths-item'));
  if (items.length === 0) return;

  let currentIndex = 0;
  const mq = window.matchMedia('(max-width: 1024px)');

  const update = () => {
    if (!mq.matches) {
      items.forEach((item) => item.classList.add('is-active'));
      btnPrev.disabled = true;
      btnNext.disabled = true;
      return;
    }

    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === currentIndex);
    });

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex >= items.length - 1;
  };

  btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      update();
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentIndex < items.length - 1) {
      currentIndex++;
      update();
    }
  });

  mq.addEventListener('change', () => {
    currentIndex = 0;
    update();
  });

  update();
}


// ============================================================
//  SERVICE PAGE - ページ内ナビのスクロール連動
// ============================================================
function initServiceSectionNav() {
  const nav = document.getElementById('serviceSectionNav');
  if (!nav) return;

  const hero = document.querySelector('.service-page__hero');
  const footer = document.querySelector('.footer');

  const links = Array.from(
    nav.querySelectorAll('.service-page__section-nav-link')
  );
  const sections = links
    .map((link) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return null;
      return document.querySelector(href);
    })
    .filter(Boolean);

  if (sections.length === 0) return;

  const footerThreshold = () => window.innerHeight * 0.2;

  const getCheckY = () => {
    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 64;
    return window.scrollY + headerHeight + 80;
  };

  const setActive = (sectionId) => {
    links.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('is-current', isCurrent);

      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const syncVisibility = () => {
    if (!hero) {
      nav.classList.add('is-visible');
      return;
    }

    const heroRect = hero.getBoundingClientRect();
    const heroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
    const reachedFooter =
      footer && footer.getBoundingClientRect().top < footerThreshold();

    nav.classList.toggle('is-visible', !heroVisible && !reachedFooter);
  };

  const update = () => {
    syncVisibility();

    const checkY = getCheckY();
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= checkY) {
        activeId = section.id;
      }
    });

    setActive(activeId);
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('load', update);
  window.addEventListener('pageshow', update);
  update();
}


// ============================================================
//  全セクション
//  スクロールで要素をフェードイン（IntersectionObserver）
//  WordPress テーマ側でも同じクラス名で使い回し可
// ============================================================
function initScrollReveal() {
  // js-reveal クラスが付いた要素を対象とする
  // 既存の要素に付与 + 各セクションの主要要素に自動付与
  const targets = [
    '.about__inner',
    '.service__card',
    '.service-page__flow .service-page__step',
    '.service-page__cta .service-page__cta-btn',
    '.clients__logo-item',
    '.contact__form',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('js-reveal');
      // アイテムが複数あるときは少しずつ遅延
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // 一度表示したら監視解除
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.js-reveal').forEach(el => observer.observe(el));
}


// ============================================================
//  ページトップボタンの表示 / 非表示
// ============================================================
function initPageTop() {
  const pageTopBtn = document.getElementById('pageTop');
  const floatActions = document.querySelector('.c-float-actions');

  if (!pageTopBtn && !floatActions) return;

  if (pageTopBtn && !floatActions) {
    const resetPageTopHover = () => {
      pageTopBtn.classList.add('is-no-hover');
      pageTopBtn.blur();
    };

    pageTopBtn.addEventListener('click', resetPageTopHover);

    pageTopBtn.addEventListener('mouseenter', (e) => {
      // タップ後に発火する擬似 mouseenter で is-no-hover が外れ、ホバー色が残るのを防ぐ
      if (e.sourceCapabilities?.firesTouchEvents) return;
      pageTopBtn.classList.remove('is-no-hover');
    });

    pageTopBtn.addEventListener('touchend', resetPageTopHover, { passive: true });
  }

  let wasVisible = false;

  const toggle = () => {
    const isVisible = window.scrollY > 400;

    if (floatActions) {
      floatActions.classList.toggle('is-visible', isVisible);

      if (document.body.classList.contains('page-philosophy')) {
        const blueSection = document.querySelector('.philosophy-page__body');
        const footer = document.querySelector('.footer');

        if (blueSection) {
          const floatRect = floatActions.getBoundingClientRect();
          const checkY = floatRect.top + floatRect.height * 0.5;
          const blueRect = blueSection.getBoundingClientRect();
          const isOnBlue =
            checkY >= blueRect.top && checkY <= blueRect.bottom;
          const isOverFooter =
            footer &&
            footer.getBoundingClientRect().top < floatRect.bottom;

          floatActions.classList.toggle(
            'is-on-blue-bg',
            isOnBlue && !isOverFooter
          );
        }
      }

      wasVisible = isVisible;
      return;
    }

    pageTopBtn.classList.toggle('is-visible', isVisible);

    if (!isVisible) {
      pageTopBtn.classList.add('is-no-hover');
      pageTopBtn.blur();
    } else if (!wasVisible) {
      pageTopBtn.classList.remove('is-no-hover');
    }

    wasVisible = isVisible;
  };

  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('resize', toggle, { passive: true });

  toggle();
}


// ============================================================
//  Q&A SECTION
//  アコーディオン開閉
// ============================================================
function initQaAccordion() {
  const items = document.querySelectorAll('.qa__item');
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector('.qa__question');
    const panel = item.querySelector('.qa__answer');
    if (!trigger || !panel) return;

    let onTransitionEnd = null;

    const clearTransitionEnd = () => {
      if (!onTransitionEnd) return;
      panel.removeEventListener('transitionend', onTransitionEnd);
      onTransitionEnd = null;
    };

    const setExpanded = (open) => {
      trigger.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
    };

    panel.style.height = '0px';
    setExpanded(false);

    trigger.addEventListener('click', () => {
      clearTransitionEnd();
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        setExpanded(false);
        panel.style.height = `${panel.scrollHeight}px`;
        panel.getBoundingClientRect();
        panel.style.height = '0px';
        return;
      }

      item.classList.add('is-open');
      setExpanded(true);
      panel.style.height = `${panel.scrollHeight}px`;

      onTransitionEnd = (e) => {
        if (e.target !== panel || e.propertyName !== 'height') return;
        if (item.classList.contains('is-open')) {
          panel.style.height = 'auto';
        }
        clearTransitionEnd();
      };
      panel.addEventListener('transitionend', onTransitionEnd);
    });
  });
}


// ============================================================
//  CONTACT SECTION
//  お問い合わせフォームのバリデーション & 送信処理
//  WordPress では Contact Form 7 / WPForms に置き換え想定
// ============================================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // エラー表示用ヘルパー
  const showError = (input, msg) => {
    clearError(input);
    const err = document.createElement('p');
    err.className = 'contact__error';
    err.textContent = msg;
    err.style.cssText = 'color:#e53935;font-size:12px;margin-top:4px;';
    input.parentNode.appendChild(err);
    input.style.borderColor = '#e53935';
  };

  const clearError = (input) => {
    const existing = input.parentNode.querySelector('.contact__error');
    if (existing) existing.remove();
    input.style.borderColor = '';
  };

  // バリデーション
  const validate = () => {
    let valid = true;

    // 名前（必須）
    const nameInput = form.querySelector('#contact-name');
    if (nameInput && !nameInput.value.trim()) {
      showError(nameInput, 'お名前を入力してください');
      valid = false;
    } else if (nameInput) {
      clearError(nameInput);
    }

    // メールアドレス（必須 + 形式チェック）
    const emailInput = form.querySelector('#contact-email');
    const emailReg   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput) {
      if (!emailInput.value.trim()) {
        showError(emailInput, 'メールアドレスを入力してください');
        valid = false;
      } else if (!emailReg.test(emailInput.value)) {
        showError(emailInput, 'メールアドレスの形式が正しくありません');
        valid = false;
      } else {
        clearError(emailInput);
      }
    }

    // プライバシーポリシー同意チェック
    const privacyCheck = form.querySelector('#privacyCheck');
    if (privacyCheck && !privacyCheck.checked) {
      showError(privacyCheck, '個人情報の取り扱いへの同意が必要です');
      valid = false;
    } else if (privacyCheck) {
      clearError(privacyCheck);
    }

    return valid;
  };

  // リアルタイムバリデーション（inputイベント）
  form.querySelectorAll('.contact__input, .contact__textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  // 送信処理
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) return;

    // 送信中の状態管理
    const submitBtn = form.querySelector('.contact__submit');
    submitBtn.disabled   = true;
    submitBtn.textContent = '送信中...';

    // ★ WordPress テーマ化時は fetch で admin-ajax.php や REST API エンドポイントに置き換え
    // 例: fetch(ajaxurl, { method: 'POST', body: new FormData(form) })
    setTimeout(() => {
      // 成功メッセージ表示
      form.innerHTML = `
        <div style="text-align:center;padding:60px 0;">
          <p style="font-size:22px;font-weight:700;color:#1a237e;margin-bottom:12px;">✓ 送信が完了しました</p>
          <p style="color:#888;font-size:14px;">お問い合わせいただきありがとうございます。<br>担当者よりご連絡いたします。</p>
        </div>
      `;
    }, 1200);
  });
}


// ============================================================
//  PHILOSOPHY
//  流れ星（star01 / star02 / star03）
//  スクロールで位置に入ったら自動で流す
// ============================================================
function initPhilosophyShootingStars() {
  if (!document.body.classList.contains('page-philosophy')) return;

  const stars = [
    // 軌跡が右上 → 左下へ
    { sel: '.goods--star01', dx: -1, dy: 0.7, dist: 180, lag: 0 },
    // 軌跡が左上 → 右下へ
    { sel: '.goods--star02', dx: 1, dy: 0.55, dist: 220, lag: 0.05 },
    // star03 ×4: すべて同じ向き（軌跡が右上 → 左下へ流れる）
    { sel: '.outro-stars--tl', dx: -1, dy: 0.7, dist: 160, lag: 0 },
    { sel: '.outro-stars--ml', dx: -1, dy: 0.65, dist: 150, lag: 0.12 },
    { sel: '.outro-stars--tr', dx: -1, dy: 0.65, dist: 180, lag: 0.06 },
    { sel: '.outro-stars--br', dx: -1, dy: 0.7, dist: 150, lag: 0.18 },
  ]
    .map((cfg) => {
      const el = document.querySelector(cfg.sel);
      return el ? { ...cfg, el, started: false } : null;
    })
    .filter(Boolean);

  if (!stars.length) return;

  // 到達位置（デザイン上の配置）で固定
  const SETTLE_AT = 0.5;
  const DURATION = 1400; // 流れる時間（ms）

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stars.forEach(({ el }) => {
      el.style.setProperty('--shoot-x', '0px');
      el.style.setProperty('--shoot-y', '0px');
      el.style.setProperty('--shoot-opacity', '1');
    });
    return;
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const apply = (star, p) => {
    // p: 0（軌跡の手前）→ 0.5（配置位置）
    const t = p - SETTLE_AT; // -0.5 → 0
    const x = t * star.dist * star.dx;
    const y = t * star.dist * star.dy;
    const opacity = p <= 0 ? 0 : Math.min(1, p / 0.14);

    star.el.style.setProperty('--shoot-x', `${x}px`);
    star.el.style.setProperty('--shoot-y', `${y}px`);
    star.el.style.setProperty('--shoot-opacity', String(opacity));
  };

  const settle = (star) => {
    star.el.style.setProperty('--shoot-x', '0px');
    star.el.style.setProperty('--shoot-y', '0px');
    star.el.style.setProperty('--shoot-opacity', '1');
  };

  const animateStar = (star) => {
    if (star.started) return;
    star.started = true;

    const delayMs = star.lag * 900;
    const startAt = performance.now() + delayMs;

    const tick = (now) => {
      if (now < startAt) {
        requestAnimationFrame(tick);
        return;
      }

      const t = Math.min(1, (now - startAt) / DURATION);
      apply(star, easeOutCubic(t) * SETTLE_AT);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        settle(star);
      }
    };

    requestAnimationFrame(tick);
  };

  // 初期は軌跡の手前・非表示
  stars.forEach((star) => apply(star, 0));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const star = stars.find((s) => s.el === entry.target);
        if (!star || star.started) return;
        animateStar(star);
        io.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  stars.forEach((star) => io.observe(star.el));
}


// ============================================================
//  PHILOSOPHY
//  SVGの線をスクロールに応じて描いていく
//  （ゼロから開始。1本目完了後に2本目…。描画先端は画面の描画ラインに追従）
// ============================================================
function initPhilosophyLineDraw() {
  if (!document.body.classList.contains('page-philosophy')) return;

  const paths = Array.from(
    document.querySelectorAll('.philosophy-page__line-svg path')
  );
  if (!paths.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pathData = paths.map((path) => {
    const length = path.getTotalLength() + 1;
    // 単一値より length length の方が Safari の dash 描画が安定する
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = reducedMotion ? '0' : String(length);
    return { path, length, drawn: false };
  });

  if (reducedMotion) return;

  // パス長に応じた描画時間（短すぎ／長すぎを抑える）
  const getDuration = (length) => Math.min(7.5, Math.max(2, length / 650));
  const triggerLineY = () => (window.innerHeight || 1) * 0.62;

  let observer = null;

  const drawPath = (item) => {
    if (item.drawn) return Promise.resolve();
    item.drawn = true;
    if (observer) observer.unobserve(item.path);

    const duration = getDuration(item.length);

    return new Promise((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        item.path.style.strokeDashoffset = '0';
        resolve();
      };

      const onEnd = (e) => {
        if (e.propertyName !== 'stroke-dashoffset') return;
        item.path.removeEventListener('transitionend', onEnd);
        finish();
      };

      item.path.addEventListener('transitionend', onEnd);
      item.path.style.transition = `stroke-dashoffset ${duration}s ease-out`;
      item.path.getBoundingClientRect();
      item.path.style.strokeDashoffset = '0';
      window.setTimeout(finish, duration * 1000 + 80);
    });
  };

  // 1本目 → 2本目（先頭セグメント）は順番に描画
  let firstDraw = null;
  const startFirst = () => {
    if (!firstDraw) firstDraw = drawPath(pathData[0]);
    return firstDraw;
  };

  const runIndex = (index) => {
    if (index < 0 || !pathData[index] || pathData[index].drawn) return;
    if (index === 0) {
      startFirst();
    } else if (index === 1) {
      // 1本目の完了後に2本目を開始
      startFirst().then(() => drawPath(pathData[1]));
    } else {
      // 2本目の分割セグメント以降・終点は、その場所に来たら独立描画
      drawPath(pathData[index]);
    }
  };

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = pathData.findIndex((d) => d.path === entry.target);
        runIndex(index);
      });
    },
    {
      threshold: 0,
      rootMargin: '0px 0px -38% 0px',
    }
  );

  pathData.forEach((item) => observer.observe(item.path));

  // Safariで IntersectionObserver が取りこぼすケースのフォールバック
  let fallbackTicking = false;
  const checkFallback = () => {
    fallbackTicking = false;
    if (pathData.every((item) => item.drawn)) {
      window.removeEventListener('scroll', onFallbackScroll);
      window.removeEventListener('resize', onFallbackScroll);
      return;
    }

    const lineY = triggerLineY();
    pathData.forEach((item, index) => {
      if (item.drawn) return;
      const rect = item.path.getBoundingClientRect();
      if (rect.top <= lineY && rect.bottom >= lineY) runIndex(index);
    });
  };

  const onFallbackScroll = () => {
    if (fallbackTicking) return;
    fallbackTicking = true;
    requestAnimationFrame(checkFallback);
  };

  window.addEventListener('scroll', onFallbackScroll, { passive: true });
  window.addEventListener('resize', onFallbackScroll, { passive: true });
  checkFallback();
}


// ============================================================
//  PHILOSOPHY
//  浮遊イラスト（note）を左右からふわっと出現
// ============================================================
function initPhilosophyGoodsReveal() {
  if (!document.body.classList.contains('page-philosophy')) return;

  const notes = Array.from(
    document.querySelectorAll(
      '.goods--note01, .goods--note02, .goods--note03, .goods--note04, .goods--note05, .goods--note06, .goods--note07, .goods--note08'
    )
  );
  if (!notes.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    notes.forEach((el) => el.classList.add('is-appeared'));
    return;
  }

  const notesIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-appeared');
        notesIo.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px',
    }
  );
  notes.forEach((el) => notesIo.observe(el));
}


// ============================================================
//  PHILOSOPHY
//  地球のみをスクロールに合わせて回転（人物は固定）
//  ページ最下部ではホイール操作でさらに回転を継続
// ============================================================
function initPhilosophyEarthRotate() {
  if (!document.body.classList.contains('page-philosophy')) return;

  const earth = document.querySelector('.philosophy-page__earth-globe');
  const stage = document.querySelector('.philosophy-page__earth-stage');
  if (!earth || !stage) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    earth.style.setProperty('--earth-rotate', '0deg');
    return;
  }

  const MAX_DEG = 16;
  const EXTRA_MAX = 56; // 最下部ホイールで追加できる回転量
  const LERP = 0.12; // 追従を速くし、到達付近で減速して見えないようにする
  const EXTRA_DECAY = 0.08; // 最下部を離れたときの追加角の戻り
  const START_RATIO = 1.15;
  const END_RATIO = 0.05;
  const SOFT_START = 0.1; // 動き始めだけ少し鈍く（終盤は等速）
  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  const getScrollRangePx = () => {
    const vh = window.innerHeight || 1;
    return Math.max(1, (START_RATIO - END_RATIO) * vh);
  };

  // スクロールと同じ角速度になるよう、ホイール感度を距離から算出
  const getWheelToDeg = () => (2 * MAX_DEG) / getScrollRangePx();

  const getScrollDeg = () => {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const center = rect.top + rect.height * 0.55;
    const start = vh * START_RATIO;
    const end = vh * END_RATIO;
    const raw = clamp01((start - center) / (start - end));

    // 冒頭だけ ease-in、その後は線形（到達付近で速度を落とさない）
    let p;
    if (raw < SOFT_START) {
      const u = raw / SOFT_START;
      p = SOFT_START * u * u;
    } else {
      p = raw;
    }

    return -MAX_DEG + p * MAX_DEG * 2;
  };

  const isNearPageBottom = () => {
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    // 底の直前からホイール継続を始め、到達で一度止まって見えないようにする
    return scrollBottom >= docHeight - 96;
  };

  const isStageNear = () => {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    return rect.bottom > -120 && rect.top < vh + 120;
  };

  let extraDeg = 0;
  let currentDeg = getScrollDeg();
  let running = false;

  earth.style.setProperty('--earth-rotate', `${currentDeg}deg`);

  const getTargetDeg = () => getScrollDeg() + extraDeg;

  const tick = () => {
    // 最下部を離れたら追加回転をゆっくり戻す
    if (!isNearPageBottom() && extraDeg !== 0) {
      extraDeg += (0 - extraDeg) * EXTRA_DECAY;
      if (Math.abs(extraDeg) < 0.05) extraDeg = 0;
    }

    const targetDeg = getTargetDeg();
    currentDeg += (targetDeg - currentDeg) * LERP;

    if (Math.abs(targetDeg - currentDeg) < 0.02) {
      currentDeg = targetDeg;
    }

    earth.style.setProperty('--earth-rotate', `${currentDeg}deg`);

    const settling =
      Math.abs(targetDeg - currentDeg) >= 0.02 || Math.abs(extraDeg) >= 0.05;

    if (isStageNear() || settling) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  };

  const onWheel = (e) => {
    if (!isNearPageBottom() || !isStageNear()) return;
    if (!e.deltaY) return;

    extraDeg = Math.max(
      -EXTRA_MAX,
      Math.min(EXTRA_MAX, extraDeg + e.deltaY * getWheelToDeg())
    );
    start();
  };

  window.addEventListener('scroll', start, { passive: true });
  window.addEventListener('resize', start, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: true });
  start();
}


// ============================================================
//  PHILOSOPHY
//  カスタムカーソル（理念テキスト上で拡大・黄色く発光）
// ============================================================
function initPhilosophyCursor() {
  if (!document.body.classList.contains('page-philosophy')) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const HOTSPOT_X = 21;
  const HOTSPOT_Y = 42;
  const TEXT_SELECTOR = [
    '.philosophy-page__catch-en',
    '.philosophy-page__catch-ja',
    '.philosophy-page__intro-text',
    '.philosophy-page__section-heading',
    '.philosophy-page__section-body',
    '.philosophy-page__section-en',
    '.philosophy-page__section-ja',
    '.philosophy-page__section-num',
  ].join(',');

  const cursor = document.createElement('div');
  cursor.className = 'philosophy-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML =
    '<img class="philosophy-cursor__img" src="images/philosophy/philosophy-cursor.png" alt="" width="72" height="72" decoding="async">';
  document.body.appendChild(cursor);

  let visible = false;
  let onText = false;
  let ticking = false;
  let lastX = 0;
  let lastY = 0;

  const setPos = (x, y) => {
    cursor.style.setProperty('--cursor-x', `${x - HOTSPOT_X}px`);
    cursor.style.setProperty('--cursor-y', `${y - HOTSPOT_Y}px`);
  };

  const setOnText = (next) => {
    if (onText === next) return;
    onText = next;
    cursor.classList.toggle('is-on-text', next);
  };

  const updateFromPoint = (x, y) => {
    lastX = x;
    lastY = y;
    setPos(x, y);

    // カーソル自身は pointer-events:none なので下の要素を取得できる
    const el = document.elementFromPoint(x, y);
    setOnText(Boolean(el && el.closest(TEXT_SELECTOR)));
  };

  const onMove = (e) => {
    if (!visible) {
      visible = true;
      cursor.classList.add('is-visible');
    }

    lastX = e.clientX;
    lastY = e.clientY;

    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateFromPoint(lastX, lastY);
    });
  };

  const onLeave = () => {
    visible = false;
    cursor.classList.remove('is-visible');
    setOnText(false);
  };

  document.addEventListener('mousemove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
}


// ============================================================
//  全セクション
//  スムーススクロール（アンカーリンク）
//  header の高さ分オフセット
// ============================================================
function initSmoothScroll() {
  const headerHeight = () => {
    const h = document.getElementById('header');
    return h ? h.offsetHeight : 64;
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight();
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
