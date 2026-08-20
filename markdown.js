(function (global) {
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[char]));
  }

  function sanitizeUrl(url) {
    const value = String(url ?? '').trim();
    if (!value) return '';
    if (
      /^https?:\/\//i.test(value) ||
      value.startsWith('//') ||
      value.startsWith('/') ||
      value.startsWith('#') ||
      /^mailto:/i.test(value) ||
      /^tel:/i.test(value)
    ) {
      return value;
    }
    return '';
  }

  function bodyArrayToMarkdown(body) {
    if (!Array.isArray(body)) return '';
    return body
      .map((part) => String(part ?? '').trim())
      .filter(Boolean)
      .join('\n\n');
  }

  function normalizeMarkdownInput(value) {
    if (Array.isArray(value)) return bodyArrayToMarkdown(value);
    if (value == null) return '';

    const raw = String(value).replace(/\r\n?/g, '\n').trim();
    if (!raw) return '';

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return bodyArrayToMarkdown(parsed);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.markdown === 'string') {
          return String(parsed.markdown).replace(/\r\n?/g, '\n').trim();
        }
        if (Array.isArray(parsed.body)) return bodyArrayToMarkdown(parsed.body);
      }
      if (typeof parsed === 'string') return String(parsed).replace(/\r\n?/g, '\n').trim();
    } catch (_) {
      // fall through to raw markdown
    }

    return raw;
  }

  function parseFrontMatterValue(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (/^(true|false)$/i.test(raw)) return raw.toLowerCase() === 'true';
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      return raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    return raw;
  }

  function splitMarkdownFrontMatter(value) {
    const source = String(value ?? '').replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
    if (!source.startsWith('---\n')) {
      return { meta: {}, body: source.trim() };
    }

    let endIndex = source.indexOf('\n---\n', 4);
    let endLength = 5;
    if (endIndex === -1 && source.endsWith('\n---')) {
      endIndex = source.length - 4;
      endLength = 4;
    }
    if (endIndex === -1) {
      return { meta: {}, body: source.trim() };
    }

    const meta = {};
    const block = source.slice(4, endIndex).trim();
    for (const line of block.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^:]+?):\s*(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      const parsedValue = parseFrontMatterValue(match[2]);
      meta[key] = parsedValue;
    }

    const body = source.slice(endIndex + endLength).replace(/^\s+/, '');
    return { meta, body };
  }

  function plainTextFromMarkdown(value) {
    const source = normalizeMarkdownInput(value);
    return source
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#>*_~\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function countReadingUnits(value) {
    const source = plainTextFromMarkdown(value);
    if (!source) return 0;

    const cjkCount = (source.match(/[\u4e00-\u9fff]/g) || []).length;
    const latinWordCount = (source.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) || []).length;
    return cjkCount + latinWordCount * 5;
  }

  function estimateReadingMinutes(value, options = {}) {
    const unitsPerMinute = Number(options.unitsPerMinute || 400);
    const units = countReadingUnits(value);
    if (!units) return 1;
    return Math.max(1, Math.ceil(units / unitsPerMinute));
  }

  function formatReadTime(minutes, locale = 'en') {
    const value = Math.max(1, Number(minutes) || 1);
    return String(locale).toLowerCase().startsWith('zh') ? `${value} 分钟阅读` : `${value} min read`;
  }

  function estimateReadTime(value, options = {}) {
    return formatReadTime(estimateReadingMinutes(value, options), options.locale || 'en');
  }

  function extractMarkdownTitle(body, filename = '') {
    const source = normalizeMarkdownInput(body);
    const heading = source.match(/^#\s+(.+)$/m);
    if (heading) return plainTextFromMarkdown(heading[1]);

    const base = String(filename ?? '')
      .replace(/\.[^.]+$/, '')
      .replace(/[._-]+/g, ' ')
      .trim();
    return base || '';
  }

  function extractMarkdownExcerpt(body, limit = 140) {
    const source = normalizeMarkdownInput(body);
    if (!source) return '';
    const paragraph = source
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .find((part) => part && !/^#{1,6}\s+/.test(part) && !/^```/.test(part));
    if (!paragraph) return '';
    const text = plainTextFromMarkdown(paragraph);
    if (!text) return '';
    return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
  }

  function parseMarkdownDocument(value, filename = '') {
    const text = String(value ?? '').replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
    const { meta, body } = splitMarkdownFrontMatter(text);
    const title = meta.title || extractMarkdownTitle(body, filename);
    const excerpt = meta.excerpt || extractMarkdownExcerpt(body);
    return {
      meta,
      body: body.trim(),
      title: String(title || '').trim(),
      excerpt: String(excerpt || '').trim(),
      source: text.trim(),
    };
  }

  function renderInline(text) {
    const tokens = [];
    const stash = (html) => {
      tokens.push(html);
      return `\u0000${tokens.length - 1}\u0000`;
    };

    let rendered = escapeHtml(String(text ?? ''));

    rendered = rendered.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${escapeHtml(code)}</code>`));
    rendered = rendered.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl) return escapeHtml(alt);
      return stash(
        `<img class="markdown-image" src="${escapeHtml(safeUrl)}" alt="${escapeHtml(alt)}" loading="lazy">`
      );
    });
    rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl) return escapeHtml(label);
      return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
    rendered = rendered.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    rendered = rendered.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    rendered = rendered.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    rendered = rendered.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');

    return rendered.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)] ?? '');
  }

  function renderMarkdown(markdown) {
    const source = normalizeMarkdownInput(markdown);
    if (!source) return '';

    const lines = source.split('\n');
    const blocks = [];
    let paragraph = [];
    let listType = null;
    let listItems = [];
    let quoteLines = [];
    let codeLines = [];
    let codeLanguage = '';
    let inCode = false;

    const flushParagraph = () => {
      if (!paragraph.length) return;
      blocks.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    };

    const flushList = () => {
      if (!listType || !listItems.length) {
        listType = null;
        listItems = [];
        return;
      }
      blocks.push(`<${listType}>${listItems.map((item) => `<li>${item}</li>`).join('')}</${listType}>`);
      listType = null;
      listItems = [];
    };

    const flushQuote = () => {
      if (!quoteLines.length) return;
      const html = quoteLines
        .join('\n')
        .split(/\n\s*\n/)
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => `<p>${renderInline(segment.replace(/\n+/g, ' '))}</p>`)
        .join('');
      blocks.push(`<blockquote>${html}</blockquote>`);
      quoteLines = [];
    };

    const flushCode = () => {
      blocks.push(
        `<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`
      );
      inCode = false;
      codeLines = [];
      codeLanguage = '';
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (inCode) {
        if (/^```/.test(trimmed)) {
          flushCode();
        } else {
          codeLines.push(line);
        }
        continue;
      }

      if (/^```/.test(trimmed)) {
        flushParagraph();
        flushList();
        flushQuote();
        inCode = true;
        codeLanguage = trimmed.slice(3).trim();
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        flushList();
        flushQuote();
        continue;
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        const level = heading[1].length;
        blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushParagraph();
        flushList();
        flushQuote();
        blocks.push('<hr>');
        continue;
      }

      if (/^>\s?/.test(trimmed)) {
        flushParagraph();
        flushList();
        quoteLines.push(trimmed.replace(/^>\s?/, ''));
        continue;
      }

      const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
      const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph();
        flushQuote();
        const type = unordered ? 'ul' : 'ol';
        if (listType && listType !== type) flushList();
        listType = type;
        listItems.push(renderInline((unordered || ordered)[1]));
        continue;
      }

      flushList();
      flushQuote();
      paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();
    flushQuote();
    if (inCode) flushCode();

    return blocks.join('');
  }

  const api = {
    bodyArrayToMarkdown,
    countReadingUnits,
    extractMarkdownExcerpt,
    extractMarkdownTitle,
    estimateReadTime,
    estimateReadingMinutes,
    formatReadTime,
    normalizeMarkdownInput,
    parseMarkdownDocument,
    plainTextFromMarkdown,
    splitMarkdownFrontMatter,
    renderMarkdown,
  };

  global.blogMarkdown = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
