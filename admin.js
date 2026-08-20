(function () {
  const markdown = window.blogMarkdown;
  const $ = (selector) => document.querySelector(selector);

  const loginView = $('#loginView');
  const adminView = $('#adminView');
  const modal = $('#editorModal');
  const preview = $('#postPreview');
  const postForm = $('#postForm');
  const imageFileInput = $('#imageFileInput');
  const imageAltInput = $('#imageAltInput');
  const imageUploadBtn = $('#imageUploadBtn');
  const imageUploadMessage = $('#imageUploadMessage');
  const markdownFileInput = $('#markdownFileInput');
  const markdownImportBtn = $('#markdownImportBtn');
  const markdownImportMessage = $('#markdownImportMessage');

  const categoryOptions = new Set(['product', 'design', 'life']);
  const themeLabels = {
    sunset: '落日',
    blue: '蓝调',
    green: '青绿',
    cream: '米白',
    purple: '紫雾',
    orange: '橘光',
  };

  let posts = [];
  let editingId = null;

  async function api(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) throw Error(data.error || '请求失败');
    return data;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[char]));
  }

  function bodyMarkdownOf(post) {
    return markdown?.normalizeMarkdownInput(post?.bodyMarkdown ?? post?.body ?? '') || '';
  }

  function setUploadMessage(message = '', kind = '') {
    if (!imageUploadMessage) return;
    imageUploadMessage.textContent = message;
    imageUploadMessage.className = kind ? `upload-message is-${kind}` : 'upload-message';
  }

  function setMarkdownImportMessage(message = '', kind = '') {
    if (!markdownImportMessage) return;
    markdownImportMessage.textContent = message;
    markdownImportMessage.className = kind ? `upload-message is-${kind}` : 'upload-message';
  }

  function defaultAltFromFilename(filename) {
    return String(filename ?? '').replace(/\.[^.]+$/, '').trim() || 'image';
  }

  function readTimeForContent(value) {
    return markdown?.estimateReadTime?.(value) || '1 min read';
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('读取文件失败'));
      reader.readAsText(file, 'utf-8');
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('读取图片失败'));
      reader.readAsDataURL(file);
    });
  }

  function insertMarkdownSnippet(snippet) {
    const field = postForm?.bodyMarkdown;
    if (!field) return;

    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? field.value.length;
    const before = field.value.slice(0, start);
    const after = field.value.slice(end);
    const prefix = before && !/\n\n$/.test(before) ? '\n\n' : '';
    const suffix = after && !/^\n\n/.test(after) ? '\n\n' : '';
    const insert = `${prefix}${snippet}${suffix}`;

    field.value = before + insert + after;
    const cursor = start + insert.length;
    field.focus();
    if (typeof field.setSelectionRange === 'function') {
      field.setSelectionRange(cursor, cursor);
    }
    updatePreview();
  }

  function applyMarkdownDocument(document, filename) {
    const meta = document?.meta || {};
    const fileTitle = document?.title || markdown?.extractMarkdownTitle?.(document?.body || '', filename) || defaultAltFromFilename(filename);
    const fileExcerpt = document?.excerpt || markdown?.extractMarkdownExcerpt?.(document?.body || '') || '';
    const body = String(document?.body || '').trim();

    if (typeof meta.id === 'string' && meta.id.trim()) {
      postForm.id.value = meta.id.trim();
    } else {
      postForm.id.value = '';
    }

    postForm.title.value = String(fileTitle || '').trim();
    postForm.excerpt.value = String(fileExcerpt || '').trim();

    const category = String(meta.category || '').trim();
    if (categoryOptions.has(category)) {
      postForm.category.value = category;
    }

    if (typeof meta.categoryLabel === 'string' && meta.categoryLabel.trim()) {
      postForm.categoryLabel.value = meta.categoryLabel.trim();
    } else if (category && !categoryOptions.has(category)) {
      postForm.categoryLabel.value = category;
    } else if (postForm.categoryLabel.value) {
      postForm.categoryLabel.value = postForm.categoryLabel.value;
    }

    if (typeof meta.date === 'string' && meta.date.trim()) {
      postForm.date.value = meta.date.trim();
    }

    if (typeof meta.accent === 'string' && meta.accent.trim()) {
      postForm.accent.value = meta.accent.trim();
    }

    if (typeof meta.status === 'string' && ['published', 'draft'].includes(meta.status.trim())) {
      postForm.status.value = meta.status.trim();
    }

    postForm.bodyMarkdown.value = body;
    updatePreview();
  }

  function updatePreview() {
    if (!preview) return;
    const value = postForm?.bodyMarkdown?.value?.trim() || '';
    if (postForm?.read) {
      postForm.read.value = readTimeForContent(value);
    }
    preview.innerHTML = value
      ? markdown.renderMarkdown(value)
      : '<p class="preview-empty">在这里写 Markdown，下面会实时预览。图片使用 `![alt](url)`。</p>';
  }

  function applyThemeLabels(settings = {}) {
    themeLabels.sunset = settings.themeLabelSunset || themeLabels.sunset;
    themeLabels.blue = settings.themeLabelBlue || themeLabels.blue;
    themeLabels.green = settings.themeLabelGreen || themeLabels.green;
    themeLabels.cream = settings.themeLabelCream || themeLabels.cream;
    themeLabels.purple = settings.themeLabelPurple || themeLabels.purple;
    themeLabels.orange = settings.themeLabelOrange || themeLabels.orange;

    if (postForm?.accent) {
      [...postForm.accent.options].forEach((option) => {
        if (themeLabels[option.value]) {
          option.textContent = themeLabels[option.value];
        }
      });
    }
  }

  async function uploadImage() {
    const file = imageFileInput?.files?.[0];
    if (!file) {
      setUploadMessage('先选择一张图片。', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadMessage('这里只支持图片文件。', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setUploadMessage('图片超过 12MB，请先压缩。', 'error');
      return;
    }

    const alt = String(imageAltInput?.value || defaultAltFromFilename(file.name)).trim() || defaultAltFromFilename(file.name);
    imageUploadBtn.disabled = true;
    setUploadMessage('正在上传到 GitHub…');

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await api('/api/admin/uploads/image', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          dataUrl,
        }),
      });

      insertMarkdownSnippet(`![${alt}](${result.url})`);
      setUploadMessage(`已同步到 GitHub：${result.url}`, 'success');
      imageFileInput.value = '';
      if (imageAltInput) imageAltInput.value = '';
    } catch (error) {
      setUploadMessage(error.message, 'error');
    } finally {
      imageUploadBtn.disabled = false;
    }
  }

  async function importMarkdownFile() {
    const file = markdownFileInput?.files?.[0];
    if (!file) {
      setMarkdownImportMessage('先选择一个 Markdown 文件。', 'error');
      return;
    }

    const name = file.name.toLowerCase();
    if (!/(\.md|\.markdown)$/.test(name) && file.type !== 'text/markdown' && file.type !== 'text/plain') {
      setMarkdownImportMessage('请选择 Markdown 文件。', 'error');
      return;
    }

    markdownImportBtn.disabled = true;
    setMarkdownImportMessage('正在读取 Markdown 文件…');

    try {
      const text = await readFileAsText(file);
      const document = markdown?.parseMarkdownDocument ? markdown.parseMarkdownDocument(text, file.name) : { body: text.trim(), title: defaultAltFromFilename(file.name), excerpt: '' };
      applyMarkdownDocument(document, file.name);
      setMarkdownImportMessage(`已读取 ${file.name}，表单已填充。`, 'success');
    } catch (error) {
      setMarkdownImportMessage(error.message, 'error');
    } finally {
      markdownImportBtn.disabled = false;
    }
  }

  function showAdmin(user) {
    loginView.classList.add('is-hidden');
    adminView.classList.remove('is-hidden');
    $('#currentUser').textContent = `${user.username} 已登录`;
    loadAll();
  }

  async function checkSession() {
    try {
      const session = await api('/api/auth/me');
      if (session.authenticated) showAdmin(session);
    } catch (_) {}
  }

  async function loadAll() {
    posts = await api('/api/admin/posts');

    $('#publishedCount').textContent = posts.filter((post) => post.status === 'published').length;
    $('#draftCount').textContent = posts.filter((post) => post.status === 'draft').length;
    $('#latestDate').textContent = posts[0]?.date || '—';

    $('#recentPosts').innerHTML =
      posts
        .slice(0, 5)
        .map(
          (post) => `
            <button class="recent-item" data-edit="${post.id}">
              <span class="recent-accent ${post.accent}"></span>
              <span>
                <strong>${escapeHtml(post.title)}</strong>
                <small>${post.date} · ${post.status === 'draft' ? '草稿' : '已发布'}</small>
              </span>
              <span>↗</span>
            </button>`
        )
        .join('') || '<p class="empty-state">还没有文章。</p>';

    $('#postTable').innerHTML =
      posts
        .map(
          (post) => `
            <div class="table-row">
              <div class="table-title">
                <span class="recent-accent ${post.accent}"></span>
                <div>
                  <strong>${escapeHtml(post.title)}</strong>
                  <small>${escapeHtml(post.categoryLabel)} · ${post.date}</small>
                </div>
              </div>
              <span class="status-pill ${post.status}">${post.status === 'draft' ? '草稿' : '已发布'}</span>
              <span class="table-read">${escapeHtml(post.read)}</span>
              <div class="row-actions">
                <button data-edit="${post.id}">编辑</button>
                <button class="danger" data-delete="${post.id}">删除</button>
              </div>
            </div>`
        )
        .join('') || '<p class="empty-state">还没有文章。</p>';

    try {
      const settings = await api('/api/admin/settings');
      const form = $('#settingsForm');
      form.siteName.value = settings.siteName || '';
      form.siteEmail.value = settings.siteEmail || '';
      form.intro.value = settings.intro || '';
      form.themeLabelSunset.value = settings.themeLabelSunset || themeLabels.sunset;
      form.themeLabelBlue.value = settings.themeLabelBlue || themeLabels.blue;
      form.themeLabelGreen.value = settings.themeLabelGreen || themeLabels.green;
      form.themeLabelCream.value = settings.themeLabelCream || themeLabels.cream;
      form.themeLabelPurple.value = settings.themeLabelPurple || themeLabels.purple;
      form.themeLabelOrange.value = settings.themeLabelOrange || themeLabels.orange;
      applyThemeLabels(settings);
    } catch (_) {}
  }

  function openEditor(post) {
    editingId = post?.id || null;
    postForm.reset();
    $('#editorTitle').textContent = post ? '编辑文章' : '写新文章';
    $('#editorError').textContent = '';

    if (post) {
      postForm.id.value = post.id;
      postForm.title.value = post.title || '';
      postForm.category.value = post.category || 'life';
      postForm.categoryLabel.value = post.categoryLabel || '';
      postForm.date.value = post.date || '';
      postForm.accent.value = post.accent || 'sunset';
      postForm.status.value = post.status || 'published';
      postForm.excerpt.value = post.excerpt || '';
      postForm.bodyMarkdown.value = bodyMarkdownOf(post);
    } else {
      postForm.bodyMarkdown.value = '';
    }

    modal.classList.remove('is-hidden');
    updatePreview();
    setUploadMessage();
    setMarkdownImportMessage();
    if (imageFileInput) imageFileInput.value = '';
    if (imageAltInput) imageAltInput.value = '';
    if (markdownFileInput) markdownFileInput.value = '';
    postForm.title.focus();
  }

  function closeEditor() {
    modal.classList.add('is-hidden');
    setUploadMessage();
    setMarkdownImportMessage();
  }

  async function deletePost(id) {
    const post = posts.find((item) => item.id === id);
    if (!post || !confirm(`确认删除《${post.title}》？`)) return;
    await api(`/api/admin/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    loadAll();
  }

  function switchSection(section) {
    document.querySelectorAll('.admin-section').forEach((item) => item.classList.add('is-hidden'));
    $(`#${section}Section`).classList.remove('is-hidden');
    document.querySelectorAll('.side-link').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.section === section);
    });
    $('#pageTitle').textContent = {
      overview: '总览',
      posts: '文章管理',
      settings: '站点设置',
    }[section] || '总览';
  }

  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    $('#loginError').textContent = '';

    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget));
      showAdmin(await api('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }));
    } catch (error) {
      $('#loginError').textContent = error.message;
    }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    location.reload();
  });

  $('#newPostBtn').addEventListener('click', () => openEditor());
  $('#newPostBtn2').addEventListener('click', () => openEditor());

  document.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit]');
    if (edit) openEditor(posts.find((post) => post.id === edit.dataset.edit));

    const del = event.target.closest('[data-delete]');
    if (del) deletePost(del.dataset.delete);

    const go = event.target.closest('[data-go]');
    if (go) switchSection(go.dataset.go);

    if (event.target.closest('[data-close-editor]')) closeEditor();
  });

  postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.bodyMarkdown = data.bodyMarkdown.trim();
    delete data.id;

    try {
      await api(editingId ? `/api/admin/posts/${encodeURIComponent(editingId)}` : '/api/admin/posts', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      });
      closeEditor();
      loadAll();
    } catch (error) {
      $('#editorError').textContent = error.message;
    }
  });

  postForm.bodyMarkdown.addEventListener('input', updatePreview);
  imageFileInput?.addEventListener('change', () => {
    const file = imageFileInput.files?.[0];
    if (!file) {
      setUploadMessage();
      return;
    }
    if (imageAltInput && !String(imageAltInput.value || '').trim()) {
      imageAltInput.value = defaultAltFromFilename(file.name);
    }
    setUploadMessage(`已选择 ${file.name}，点击“上传并插入”。`);
  });
  imageUploadBtn?.addEventListener('click', uploadImage);
  markdownFileInput?.addEventListener('change', () => {
    const file = markdownFileInput.files?.[0];
    if (!file) {
      setMarkdownImportMessage();
      return;
    }
    setMarkdownImportMessage(`已选择 ${file.name}，点击“读取并填充”。`);
  });
  markdownImportBtn?.addEventListener('click', importMarkdownFile);

  $('#settingsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form));
      const saved = await api('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      form.siteName.value = saved.siteName || '';
      form.siteEmail.value = saved.siteEmail || '';
      form.intro.value = saved.intro || '';
      form.themeLabelSunset.value = saved.themeLabelSunset || themeLabels.sunset;
      form.themeLabelBlue.value = saved.themeLabelBlue || themeLabels.blue;
      form.themeLabelGreen.value = saved.themeLabelGreen || themeLabels.green;
      form.themeLabelCream.value = saved.themeLabelCream || themeLabels.cream;
      form.themeLabelPurple.value = saved.themeLabelPurple || themeLabels.purple;
      form.themeLabelOrange.value = saved.themeLabelOrange || themeLabels.orange;
      applyThemeLabels(saved);
      $('#settingsMessage').textContent = '已保存';
      setTimeout(() => {
        $('#settingsMessage').textContent = '';
      }, 1800);
    } catch (error) {
      $('#settingsMessage').textContent = error.message;
    }
  });

  document.querySelectorAll('.side-link').forEach((button) => {
    button.addEventListener('click', () => switchSection(button.dataset.section));
  });

  applyThemeLabels();
  checkSession();
})();
