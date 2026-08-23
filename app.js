(function () {
  const posts = window.blogPosts || [];
  const grid = document.getElementById('postGrid');
  const postCount = document.getElementById('postCount');
  const chips = [...document.querySelectorAll('.filter-chip')];
  const categoryBar = document.querySelector('.category-bar');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const categoryWords = { study: 'LEARN', life: 'LIVE', entertainment: 'PLAY' };
  let filterIndicator;

  function setupSplitText() {
    document.querySelectorAll('[data-split-text]').forEach((element) => {
      let index = 0;
      element.querySelectorAll('[data-split-segment]').forEach((segment) => {
        const text = segment.textContent || '';
        segment.setAttribute('aria-hidden', 'true');
        segment.innerHTML = Array.from(text).map((char) => {
          const output = `<span class="split-char" style="--char-index:${index}">${char === ' ' ? '&nbsp;' : char}</span>`;
          index += 1;
          return output;
        }).join('');
      });
    });
  }

  function refreshFilterIndicator() {
    if (!filterIndicator || !categoryBar) return;
    const active = categoryBar.querySelector('.filter-chip.is-selected');
    if (!active) return;
    const barRect = categoryBar.getBoundingClientRect();
    const chipRect = active.getBoundingClientRect();
    filterIndicator.style.width = `${chipRect.width}px`;
    filterIndicator.style.height = `${chipRect.height}px`;
    filterIndicator.style.transform = `translate(${chipRect.left - barRect.left}px,${chipRect.top - barRect.top}px)`;
  }

  function setupFilterIndicator() {
    if (!categoryBar) return;
    filterIndicator = document.createElement('span');
    filterIndicator.className = 'filter-indicator';
    filterIndicator.setAttribute('aria-hidden', 'true');
    categoryBar.prepend(filterIndicator);
    requestAnimationFrame(refreshFilterIndicator);
    window.addEventListener('resize', refreshFilterIndicator);
  }

  function postCard(post, index) {
    return `<article class="post-card spotlight-surface reveal" data-category="${post.category}" style="--delay:${index * 65}ms">
      <a class="post-visual ${post.accent}" href="article.html?id=${post.id}" aria-label="阅读：${post.title}">
        <span class="visual-label">${post.categoryLabel}</span>
        <span class="visual-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="visual-shape"></span>
        <span class="visual-word">${categoryWords[post.category] || 'NOTE'}</span>
      </a>
      <div class="post-info">
        <div class="post-meta"><span>${post.date}</span><span>${post.read}</span></div>
        <h3><a href="article.html?id=${post.id}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
        <a class="card-link magnetic" href="article.html?id=${post.id}">阅读全文 <span>↗</span></a>
      </div>
    </article>`;
  }

  function updateCategoryCounts() {
    chips.forEach((chip) => {
      const filter = chip.dataset.filter;
      const count = filter === 'all' ? posts.length : posts.filter((post) => post.category === filter).length;
      const countElement = chip.querySelector('span');
      if (countElement) countElement.textContent = String(count);
    });
  }

  let revealObserver;
  function setupRevealObserver() {
    if (reduceMotion) {
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    observeReveals();
  }

  function observeReveals(root = document) {
    root.querySelectorAll('.reveal:not([data-reveal-bound])').forEach((element) => {
      element.dataset.revealBound = 'true';
      if (reduceMotion) element.classList.add('is-visible');
      else revealObserver?.observe(element);
    });
  }

  function renderPosts(filter = 'all') {
    updateCategoryCounts();
    if (!grid) return;
    const visible = filter === 'all' ? posts : posts.filter((post) => post.category === filter);
    grid.dataset.count = String(visible.length);
    grid.classList.toggle('is-balanced', visible.length === 2 || visible.length === 4);
    grid.classList.toggle('is-single', visible.length === 1);
    if (postCount) {
      postCount.textContent = `${String(visible.length).padStart(2, '0')} ${visible.length === 1 ? 'ARTICLE' : 'ARTICLES'}`;
    }
    grid.innerHTML = visible.map(postCard).join('');
    requestAnimationFrame(() => {
      refreshFilterIndicator();
      observeReveals(grid);
      setupMagneticElements(grid);
    });
  }

  function setupSpotlights() {
    if (!finePointer || reduceMotion) return;
    document.addEventListener('pointermove', (event) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
      const surface = event.target.closest('.spotlight-surface');
      if (!surface) return;
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
      surface.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  function setupHeroTilt() {
    const art = document.querySelector('[data-tilt]');
    if (!art || !finePointer || reduceMotion) return;
    art.addEventListener('pointermove', (event) => {
      const rect = art.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      art.style.setProperty('--art-x', `${x * 12}px`);
      art.style.setProperty('--art-y', `${y * 10}px`);
      art.style.setProperty('--art-rx', `${-y * 5}deg`);
      art.style.setProperty('--art-ry', `${x * 7}deg`);
      art.style.setProperty('--art-back-x', `${31 - x * 4}px`);
      art.style.setProperty('--art-back-y', `${-18 - y * 3}px`);
      art.style.setProperty('--art-back-rx', `${y * 2}deg`);
      art.style.setProperty('--art-back-ry', `${-x * 2.8}deg`);
    });
    art.addEventListener('pointerleave', () => {
      ['--art-x', '--art-y', '--art-rx', '--art-ry', '--art-back-x', '--art-back-y', '--art-back-rx', '--art-back-ry'].forEach((name) => art.style.removeProperty(name));
    });
  }

  function setupMagneticElements(root = document) {
    if (!finePointer || reduceMotion) return;
    root.querySelectorAll('.text-link, .magnetic, .icon-btn').forEach((element) => {
      if (element.dataset.magneticBound) return;
      element.dataset.magneticBound = 'true';
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / 7;
        const y = (event.clientY - rect.top - rect.height / 2) / 7;
        element.style.setProperty('--magnet-x', `${x}px`);
        element.style.setProperty('--magnet-y', `${y}px`);
      });
      element.addEventListener('pointerleave', () => {
        element.style.removeProperty('--magnet-x');
        element.style.removeProperty('--magnet-y');
      });
    });
  }

  function createClickSpark(event) {
    if (!finePointer || reduceMotion || !event.target.closest('a, button')) return;
    const spark = document.createElement('span');
    spark.className = 'click-spark';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.setAttribute('aria-hidden', 'true');
    spark.innerHTML = Array.from({ length: 7 }, (_, index) => `<i style="--spark-angle:${index * (360 / 7)}deg"></i>`).join('');
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 620);
  }

  function setupScrollProgress() {
    const progress = document.getElementById('scrollProgress');
    if (!progress) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    }, { passive: true });
    update();
  }

  function setupActiveNavigation() {
    const links = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (!links.length || !sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.2, 0.6] });
    sections.forEach((section) => observer.observe(section));
  }

  setupSplitText();
  setupFilterIndicator();
  setupRevealObserver();
  renderPosts();
  setupSpotlights();
  setupHeroTilt();
  setupMagneticElements();
  setupScrollProgress();
  setupActiveNavigation();
  document.addEventListener('click', createClickSpark);

  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((candidate) => candidate.classList.remove('is-selected'));
    chip.classList.add('is-selected');
    refreshFilterIndicator();
    renderPosts(chip.dataset.filter);
  }));

  if (localStorage.getItem('linmo-theme') === 'dark') document.body.classList.add('dark');
  const themeIcon = document.getElementById('themeIcon');
  const updateThemeIcon = () => {
    if (themeIcon) themeIcon.textContent = document.body.classList.contains('dark') ? '☾' : '☼';
  };
  updateThemeIcon();
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('linmo-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  });

  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
  });
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  function openSearch() {
    searchModal.classList.add('is-open');
    searchModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => searchInput?.focus(), 80);
  }
  function closeSearch() {
    searchModal.classList.remove('is-open');
    searchModal.setAttribute('aria-hidden', 'true');
    if (searchInput) searchInput.value = '';
    renderSearch('');
  }
  document.getElementById('searchOpen')?.addEventListener('click', openSearch);
  document.getElementById('searchClose')?.addEventListener('click', closeSearch);
  document.getElementById('searchCloseBtn')?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSearch();
  });

  function renderSearch(query) {
    if (!searchResults) return;
    const normalized = query.trim().toLowerCase();
    const matches = normalized ? posts.filter((post) => [post.title, post.excerpt, post.categoryLabel].join(' ').toLowerCase().includes(normalized)) : [];
    searchResults.innerHTML = matches.length
      ? matches.map((post) => `<a class="search-result" href="article.html?id=${post.id}"><span class="search-result-cat">${post.categoryLabel}</span><strong>${post.title}</strong><small>${post.date} · ${post.read}</small><span>↗</span></a>`).join('')
      : `<p class="search-empty">${normalized ? '没有找到相关内容，换个关键词试试。' : '输入关键词，找到一篇想读的文章。'}</p>`;
  }
  searchInput?.addEventListener('input', (event) => renderSearch(event.target.value));

  document.getElementById('newsletterForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email');
    const note = document.getElementById('formNote');
    if (!email?.value) return;
    note.textContent = '订阅成功！下一封信很快会抵达。';
    note.classList.add('is-success');
    email.value = '';
  });
})();
