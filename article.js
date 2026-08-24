(function () {
  const markdown = window.blogMarkdown;
  let posts = window.blogPosts || [];
  const id = new URLSearchParams(location.search).get('id');

  const post = posts.find((item) => item.id === id) || posts[0];
  const root = document.getElementById('articleRoot');
  if (!post || !root) return;
  const categoryWords = { study: 'LEARN', life: 'LIVE', entertainment: 'PLAY' };

  const bodyMarkdown = markdown?.normalizeMarkdownInput(post.bodyMarkdown ?? post.body ?? '') || '';
  const bodyHtml = bodyMarkdown ? markdown.renderMarkdown(bodyMarkdown) : '<p class="article-empty">暂无正文。</p>';

  document.title = `${post.title} · rain`;
  root.innerHTML = `
    <article class="article-wrap">
      <div class="article-heading reveal is-visible">
        <a class="back-crumb" href="articles.html">文章归档 / ARCHIVE</a>
        <div class="article-meta">
          <span>${post.date}</span>
          <span>${post.read}</span>
        </div>
        <h1>${post.title}</h1>
        <p class="article-deck">${post.excerpt}</p>
        <div class="article-byline">
          <img class="avatar" src="https://github.com/rain-lei.png?size=160" alt="rain 的 GitHub 头像" style="object-fit:cover" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'avatar',textContent:'R'}))" />
          <span>rain<br /><small>student developer · remote</small></span>
        </div>
      </div>
      <div class="article-hero ${post.accent}">
        <span class="visual-grid" aria-hidden="true"></span>
        <span class="visual-label">${post.categoryLabel}</span>
        <span class="visual-word">${categoryWords[post.category] || 'NOTE'}</span>
        <span class="visual-shape"></span>
        <span class="visual-index">RAIN / ARTICLE<br />${post.date}</span>
      </div>
      <div class="article-layout">
        <div class="article-share">
          <span>SHARE</span>
          <button data-share="copy" aria-label="复制文章链接">↗</button>
        </div>
        <div class="article-body markdown-body">
          ${bodyHtml}
          <div class="article-end">
            <span>✳</span>
            <p>感谢你读到这里。愿你今天也有一点属于自己的留白。</p>
          </div>
          <div class="article-tags">
            <span>标签</span>
            <a href="articles.html">${post.categoryLabel}</a>
            <a href="articles.html">个人随笔</a>
          </div>
        </div>
      </div>
    </article>
    <section class="next-reads">
      <div class="section-heading">
        <div>
          <p class="eyebrow">继续阅读 / KEEP READING</p>
          <h2>也许你会喜欢</h2>
        </div>
        <a class="text-link" href="articles.html">全部文章 <span>↗</span></a>
      </div>
      <div class="mini-posts">
        ${posts
          .filter((item) => item.id !== post.id)
          .slice(0, 3)
          .map(
            (item, index) => `
              <a class="mini-post" href="article.html?id=${item.id}">
                <span class="mini-no">0${index + 1}</span>
                <div>
                  <small>${item.categoryLabel} · ${item.date}</small>
                  <strong>${item.title}</strong>
                </div>
                <span>↗</span>
              </a>`
          )
          .join('')}
      </div>
    </section>
  `;

  document.querySelector('[data-share="copy"]')?.addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(location.href);
      event.currentTarget.textContent = '✓';
      setTimeout(() => {
        event.currentTarget.textContent = '↗';
      }, 1600);
    } catch (_) {}
  });
})();
