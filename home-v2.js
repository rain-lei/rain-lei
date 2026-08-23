(function () {
  const posts = window.blogPosts || [];
  const list = document.getElementById('homeLatestPosts');
  const count = document.getElementById('heroPostCount');
  const latest = document.getElementById('heroLatest');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const postUrl = (post) => `article.html?id=${encodeURIComponent(post.id)}`;
  if (count) count.textContent = String(posts.length).padStart(2, '0');
  if (posts[0] && latest) { latest.href = postUrl(posts[0]); latest.querySelector('strong').textContent = posts[0].title; }
  if (!list) return;
  list.innerHTML = posts.slice(0, 3).map((post, index) => `<a class="home-post v2-reveal" href="${postUrl(post)}" style="--delay:${index * 70}ms"><span class="home-post-no">${String(index + 1).padStart(2, '0')}</span><span class="home-post-meta"><b>${escapeHtml(post.categoryLabel)}</b><time>${escapeHtml(post.date)}</time><small>${escapeHtml(post.read)}</small></span><span class="home-post-copy"><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(post.excerpt)}</small></span><span class="home-post-arrow">↗</span></a>`).join('');
  requestAnimationFrame(() => list.querySelectorAll('.v2-reveal').forEach((item) => item.classList.add('is-visible')));
})();
