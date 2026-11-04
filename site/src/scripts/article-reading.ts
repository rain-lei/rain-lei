import { animateUi } from './ui-motion';

function initReadingDirectory() {
  const article = document.querySelector<HTMLElement>('.article-body');
  const contents = document.querySelector<HTMLDetailsElement>('#articleTocDetails');
  const list = document.querySelector<HTMLElement>('#articleTocLinks');
  const header = document.querySelector<HTMLElement>('.v2-header');
  const trigger = document.querySelector<HTMLButtonElement>('#articleReadingToggle');
  const label = document.querySelector<HTMLElement>('#readingSectionLabel');
  const dialog = document.querySelector<HTMLDialogElement>('#articleReadingDialog');
  const directory = document.querySelector<HTMLElement>('#readingDirectoryLinks');
  if (!article || !contents || !list || !header || !trigger || !label || !dialog || !directory) return;

  // Astro emits these anchors and heading IDs together when it renders the Markdown.
  const sections = [...list.querySelectorAll('a')].flatMap(link => {
    const heading = document.getElementById(link.getAttribute('href')!.slice(1));
    if (!heading) return [];
    const mobileLink = link.cloneNode(true) as HTMLAnchorElement;
    directory.append(mobileLink);
    return [{ heading, link, mobileLink }];
  });
  if (!sections.length) return;
  const mobile = matchMedia('(max-width: 760px)');
  const siteMenu = document.getElementById('mobileNav');
  contents.open = !mobile.matches;
  let current = -1;
  let stops: number[] = [];
  let end = 0;
  let offset = 0;
  let dirty = true;
  let frame = 0;

  function mark(index: number, selected: boolean) {
    if (index < 0) return;
    const { link, mobileLink } = sections[index];
    for (const anchor of [link, mobileLink]) {
      if (selected) anchor.setAttribute('aria-current', 'location');
      else anchor.removeAttribute('aria-current');
    }
  }

  const update = () => {
    frame = 0;
    const reflow = dirty;
    if (dirty) {
      stops = sections.map(({ heading }) => scrollY + heading.getBoundingClientRect().top);
      end = scrollY + article.getBoundingClientRect().bottom;
      offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) +
        parseFloat(getComputedStyle(sections[0].heading).scrollMarginTop);
      dirty = false;
    }
    const line = scrollY + offset + 1;
    let next = 0;
    while (next + 1 < stops.length && stops[next + 1] <= line) next++;
    const changed = next !== current;
    if (changed) {
      mark(current, false);
      current = next;
      mark(current, true);
      label.textContent = sections[current].link.textContent;
      trigger.setAttribute('aria-label', `打开文章目录，当前章节：${label.textContent}`);
    }
    if ((changed || reflow) && contents.open && list.clientHeight) {
      const active = sections[current].link;
      const top = active.offsetTop;
      const bottom = top + active.offsetHeight;
      list.style.setProperty('--section-y', `${top}px`);
      list.style.setProperty('--section-height', `${active.offsetHeight}px`);
      list.setAttribute('data-marker', '');
      // Scroll only the directory, never the document or a keyboard user's focused link.
      if (!mobile.matches && !list.matches(':focus-within')) {
        if (top < list.scrollTop) list.scrollTop = top;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      }
    }
    const reading = mobile.matches && line >= stops[0] && line < end && !siteMenu?.classList.contains('is-open');
    header.classList.toggle('is-reading', reading);
    trigger.hidden = !reading;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const measure = () => { dirty = true; schedule(); };

  let dialogAnimation: Animation | undefined;
  let returnFocus = true;
  const close = (focusTrigger: boolean) => {
    returnFocus = focusTrigger;
    dialogAnimation?.cancel();
    if (dialog.open) dialog.close();
  };
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    returnFocus = true;
    dialog.showModal();
    document.documentElement.classList.add('has-reading-dialog');
    trigger.setAttribute('aria-expanded', 'true');
    const link = sections[current].mobileLink;
    directory.scrollTop += link.getBoundingClientRect().top - directory.getBoundingClientRect().top
      - (directory.clientHeight - link.offsetHeight) / 2;
    link.focus({ preventScroll: true });
    dialogAnimation = animateUi(dialog, [
      { opacity: .5, translate: '0 -4px' }, { opacity: 1, translate: '0 0' },
    ], { duration: 160 });
  });
  dialog.querySelector('#articleReadingClose')?.addEventListener('click', () => close(true));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) close(true);
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-reading-dialog');
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus && !trigger.hidden) trigger.focus({ preventScroll: true });
    measure();
  });
  for (const { heading, mobileLink } of sections) {
    mobileLink.addEventListener('click', event => {
      if (event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      close(false);
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      // The anchor itself handles the URL, scroll padding and browser history.
    });
  }
  mobile.addEventListener('change', () => {
    contents.open = !mobile.matches;
    if (!mobile.matches && dialog.open) close(false);
    measure();
  });
  contents.addEventListener('toggle', measure);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('hashchange', schedule);
  addEventListener('resize', measure);
  addEventListener('pageshow', measure);
  const observer = new ResizeObserver(measure);
  observer.observe(article.closest('.article-wrap') || article);
  observer.observe(list);
  if (siteMenu) new MutationObserver(schedule).observe(siteMenu, { attributes: true, attributeFilter: ['class'] });
  update();
}

initReadingDirectory();
