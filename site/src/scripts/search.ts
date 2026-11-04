export {};

type SectionMatch = { title: string; url: string; excerpt?: string };
type SearchPage = {
  url: string;
  excerpt: string;
  meta: { title?: string; category?: string; date?: string };
  sub_results?: SectionMatch[];
};
type Pagefind = {
  search: (query: string) => Promise<{ results: { data: () => Promise<SearchPage> }[] }>;
};

const input = document.getElementById('pagefindInput') as HTMLInputElement;
const output = document.getElementById('pagefindResults') as HTMLElement;
const idle = document.getElementById('searchIdle') as HTMLElement;
const status = document.getElementById('searchStatus') as HTMLElement;
const count = document.getElementById('searchCount') as HTMLElement;
const clear = document.getElementById('searchClear') as HTMLButtonElement;
const template = document.getElementById('searchResultTemplate') as HTMLTemplateElement;
const idleCount = count.textContent;
let timer = 0;
let requestId = 0;
let composing = false;

// Pagefind returns escaped text with <mark> around matches. Keep only text and highlights.
function appendExcerpt(target: Element, html: string) {
  const source = document.createElement('template');
  source.innerHTML = html;
  for (const node of source.content.childNodes) {
    const text = node.textContent || '';
    if (node.nodeName !== 'MARK') { target.append(text); continue; }
    const mark = document.createElement('mark');
    mark.textContent = text;
    target.append(mark);
  }
}

const invalidate = () => {
  requestId++;
  clearTimeout(timer);
};
const setIdle = () => {
  invalidate();
  output.hidden = true;
  output.innerHTML = '';
  output.removeAttribute('aria-busy');
  idle.hidden = false;
  status.textContent = '最近发布';
  count.textContent = idleCount;
  clear.hidden = true;
  history.replaceState(null, '', location.pathname);
};
const renderResults = (results: SearchPage[], query: string, total: number) => {
  status.textContent = total ? `“${query}”的搜索结果` : `没有找到“${query}”`;
  count.textContent = total > results.length ? `共 ${total} 篇，显示前 ${results.length} 篇` : `${total} 篇文章`;
  if (!results.length) {
    output.innerHTML = '<div class="search-empty-state"><a href="/articles/">浏览全部文章 →</a></div>';
    return;
  }
  const cards = document.createDocumentFragment();
  const term = query.toLowerCase();
  for (const item of results) {
    const page = new URL(item.url, location.origin);
    if (page.origin !== location.origin) continue;
    const card = template.content.cloneNode(true) as DocumentFragment;
    const main = card.querySelector<HTMLAnchorElement>('.search-result-main')!;
    const title = item.meta.title || '文章';
    main.href = page.href;
    main.setAttribute('aria-label', title);
    main.querySelector('h3')!.textContent = title;
    main.querySelector('small')!.textContent = [item.meta.category, item.meta.date].filter(Boolean).join(' · ');
    const sections = card.querySelector('ul')!;
    const links = new Map<string, SectionMatch>();
    for (const match of item.sub_results || []) {
      const url = new URL(match.url, page);
      if (url.origin === page.origin && url.pathname === page.pathname && url.hash && match.title) {
        links.set(url.href, match);
      }
    }
    const namedMatch = (label: string) => Number(label.toLowerCase().includes(term));
    const ranked = [...links].sort((a, b) => namedMatch(b[1].title) - namedMatch(a[1].title));
    const excerpt = namedMatch(title) ? item.excerpt : ranked[0]?.[1].excerpt || item.excerpt;
    appendExcerpt(main.querySelector('p')!, excerpt);
    for (const [href, match] of ranked.slice(0, 3)) {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = href;
      link.textContent = match.title;
      row.append(link);
      sections.append(row);
    }
    sections.hidden = !sections.childElementCount;
    cards.append(card);
  }
  output.replaceChildren(cards);
};

const search = async () => {
  invalidate();
  const query = input.value.trim();
  const current = requestId;
  if (!query) { setIdle(); return; }
  clear.hidden = false;
  idle.hidden = true;
  output.hidden = false;
  output.setAttribute('aria-busy', 'true');
  output.replaceChildren();
  status.textContent = '正在搜索';
  count.textContent = '';
  history.replaceState(null, '', `${location.pathname}?q=${encodeURIComponent(query)}`);
  try {
    const pagefindUrl = '/pagefind/pagefind.js';
    const pagefind = await import(/* @vite-ignore */ pagefindUrl) as Pagefind;
    if (current !== requestId) return;
    const response = await pagefind.search(query);
    if (current !== requestId) return;
    const results = await Promise.all(response.results.slice(0, 24).map(item => item.data()));
    if (current === requestId) renderResults(results, query, response.results.length);
  } catch {
    if (current === requestId) {
      status.textContent = '搜索失败';
      count.textContent = '';
      output.innerHTML = '<div class="search-empty-state"><p>请刷新页面重试。</p><a href="/articles/">浏览全部文章 →</a></div>';
    }
  } finally {
    if (current === requestId) output.removeAttribute('aria-busy');
  }
};

const scheduleSearch = () => {
  invalidate();
  clear.hidden = !input.value;
  if (composing) return;
  if (!input.value.trim()) { setIdle(); return; }
  timer = window.setTimeout(search, 180);
};
input.addEventListener('compositionstart', () => { composing = true; invalidate(); });
input.addEventListener('compositionend', () => { composing = false; scheduleSearch(); });
input.addEventListener('input', scheduleSearch);
input.addEventListener('keydown', event => {
  if (event.isComposing || composing) return;
  if (event.key === 'Escape') { input.value = ''; setIdle(); }
  if (event.key === 'Enter') { event.preventDefault(); search(); }
});
clear.addEventListener('click', () => { input.value = ''; setIdle(); input.focus(); });
document.querySelectorAll<HTMLButtonElement>('[data-search-topic]').forEach(button => {
  button.addEventListener('click', () => { input.value = button.dataset.searchTopic || ''; search(); input.focus(); });
});
const initial = new URLSearchParams(location.search).get('q');
if (initial && !input.value) input.value = initial;
if (input.value) search();
