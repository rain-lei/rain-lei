(function () {
  const posts = window.blogPosts || [];
  const list = document.getElementById('archiveList');
  const search = document.getElementById('archiveSearch');
  const filters = [...document.querySelectorAll('.archive-filters button')];
  const resultCount = document.getElementById('archiveResultCount');
  const total = document.getElementById('archiveTotal');
  let activeFilter = 'all'; let query = '';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const postUrl = (post) => `article.html?id=${encodeURIComponent(post.id)}`;
  if (total) total.textContent = String(posts.length).padStart(2, '0');
  function render() {
    const normalized = query.trim().toLowerCase();
    const visible = posts.filter((post) => (activeFilter === 'all' || post.category === activeFilter) && (!normalized || [post.title, post.excerpt, post.categoryLabel].join(' ').toLowerCase().includes(normalized)));
    if (resultCount) resultCount.textContent = `${visible.length} 篇结果`;
    list.innerHTML = visible.length ? visible.map((post, index) => `<a class="archive-item" href="${postUrl(post)}"><span class="archive-item-no">${String(index + 1).padStart(2, '0')}</span><span class="archive-item-main"><span class="archive-item-meta"><b>${escapeHtml(post.categoryLabel)}</b><time>${escapeHtml(post.date)}</time><small>${escapeHtml(post.read)}</small></span><strong>${escapeHtml(post.title)}</strong><p>${escapeHtml(post.excerpt)}</p></span><span class="archive-item-arrow">↗</span></a>`).join('') : '<div class="archive-empty"><strong>没有找到相关内容。</strong><span>试试更短的关键词，或者切换文章分类。</span></div>';
  }
  filters.forEach((button) => button.addEventListener('click', () => { activeFilter = button.dataset.filter; filters.forEach((item) => item.classList.toggle('is-active', item === button)); render(); }));
  search?.addEventListener('input', (event) => { query = event.target.value; render(); });
  render();
})();
