(function () {
  const target = document.getElementById('githubRepos');
  const count = document.getElementById('githubRepoCount');
  if (!target) return;

  const fallbackRepos = [
    {
      name: 'rain-lei',
      description: '个人网站、博客源码与 GitHub 资料页',
      language: 'JavaScript',
      stargazers_count: 6,
      html_url: 'https://github.com/rain-lei/rain-lei',
    },
    {
      name: 'easyxgame',
      description: 'C++17 / EasyX 课程作业与原创游戏《萌泡大作战》',
      language: 'C++',
      stargazers_count: 3,
      html_url: 'https://github.com/rain-lei/easyxgame',
    },
    {
      name: 'EDAbackend-todo-practice',
      description: 'Express 后端练习：JWT 鉴权与 Todo CRUD',
      language: 'JavaScript',
      stargazers_count: 2,
      html_url: 'https://github.com/rain-lei/EDAbackend-todo-practice',
    },
  ];

  const languageColors = {
    'C++': '#f34b7d',
    C: '#555555',
    HTML: '#e34c26',
    Java: '#b07219',
    JavaScript: '#f1e05a',
    Kotlin: '#a97bff',
    Python: '#3572a5',
    TypeScript: '#3178c6',
    Vue: '#41b883',
  };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));

  const safeRepoUrl = (value) => {
    try {
      const url = new URL(String(value || ''));
      return url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.startsWith('/rain-lei/')
        ? url.href
        : 'https://github.com/rain-lei?tab=repositories';
    } catch (_) {
      return 'https://github.com/rain-lei?tab=repositories';
    }
  };

  const formatCount = (value) => {
    const number = Number(value) || 0;
    if (number < 1000) return String(number);
    return `${(number / 1000).toFixed(number < 10000 ? 1 : 0)}k`;
  };

  const formatActivity = (value) => {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return 'GitHub 公开仓库';
    const elapsedDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
    if (elapsedDays === 0) return '今天提交';
    if (elapsedDays === 1) return '昨天提交';
    if (elapsedDays < 14) return `${elapsedDays} 天前提交`;
    return `${new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    }).format(date)}提交`;
  };

  const renderRepos = (repos) => {
    const visible = repos.slice(0, 3);
    target.innerHTML = visible.map((repo, index) => {
      const language = repo.language || '多语言';
      const color = languageColors[language] || '#8b8b84';
      const isSiteRepo = repo.name === 'rain-lei';
      return `
        <a class="github-repo-card" href="${escapeHtml(safeRepoUrl(repo.html_url))}" target="_blank" rel="noopener noreferrer" aria-label="打开 GitHub 仓库 ${escapeHtml(repo.name)}">
          <span class="repo-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="repo-card-content">
            <span class="repo-title-row">
              <span class="repo-title-wrap">
                <strong>${escapeHtml(repo.name)}</strong>
                ${isSiteRepo ? '<em class="repo-badge">本站</em>' : ''}
              </span>
              <span class="repo-arrow" aria-hidden="true">↗</span>
            </span>
            <span class="repo-description">${escapeHtml(repo.description || '代码、实验与持续迭代的项目记录。')}</span>
            <span class="repo-meta">
              <span class="repo-language"><i style="--language-color:${escapeHtml(color)}"></i>${escapeHtml(language)}</span>
              <span class="repo-stars" aria-label="${formatCount(repo.stargazers_count)} 个 Star">★ ${formatCount(repo.stargazers_count)}</span>
              <time datetime="${escapeHtml(repo.pushed_at || '')}">${escapeHtml(formatActivity(repo.pushed_at))}</time>
            </span>
          </span>
        </a>`;
    }).join('');
    target.setAttribute('aria-busy', 'false');
    if (count) count.textContent = String(visible.length).padStart(2, '0');
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  fetch('https://api.github.com/users/rain-lei/repos?sort=pushed&direction=desc&per_page=20', {
    headers: { Accept: 'application/vnd.github+json' },
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) throw new Error('GitHub API unavailable');
      return response.json();
    })
    .then((repos) => {
      const visible = (Array.isArray(repos) ? repos : [])
        .filter((repo) => !repo.fork && !repo.archived && !repo.disabled)
        .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0));
      renderRepos(visible.length ? visible : fallbackRepos);
    })
    .catch(() => renderRepos(fallbackRepos))
    .finally(() => clearTimeout(timeout));
})();
