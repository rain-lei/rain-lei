import { animateUi, uiMotionEnabled } from './ui-motion';

const article = document.querySelector<HTMLElement>('.article-body');
const headings = [...document.querySelectorAll<HTMLElement>('.article-body h2')];
const inlineToc = document.querySelector<HTMLElement>('#articleToc');
const inlineLinks = document.querySelector<HTMLElement>('#articleTocLinks');
const inlineDetails = document.querySelector<HTMLDetailsElement>('#articleTocDetails');
const toolbar = document.querySelector<HTMLElement>('#articleReading');
const toggle = document.querySelector<HTMLButtonElement>('#articleReadingToggle');
const dialog = document.querySelector<HTMLDialogElement>('#articleReadingDialog');
const directory = document.querySelector<HTMLElement>('#readingDirectoryLinks');
const header = document.querySelector<HTMLElement>('.v2-header');
const mobileNav = document.querySelector<HTMLElement>('#mobileNav');
const mobile = matchMedia('(max-width: 760px)');

if (article && headings.length > 1 && inlineToc && inlineLinks && toolbar && toggle && dialog && directory) {
  const sectionLabel = document.querySelector<HTMLElement>('#readingSectionLabel');
  const sectionNumber = document.querySelector<HTMLElement>('#readingSectionNumber');
  const makeLinks = (container: HTMLElement) => headings.map((heading, index) => {
    if (!heading.id) heading.id = `section-${String(index + 1).padStart(2, '0')}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const label = document.createElement('b');
    label.textContent = heading.textContent?.trim() || `第 ${index + 1} 节`;
    link.append(number, label);
    container.append(link);
    return link;
  });
  const desktopLinks = makeLinks(inlineLinks);
  const mobileLinks = makeLinks(directory);
  inlineToc.hidden = false;
  if (inlineDetails) inlineDetails.open = !mobile.matches;
  toolbar.hidden = false;
  let current = -1;
  let frame = 0;
  let dialogAnimation: Animation | undefined;
  let closing = false;
  let restoreFocus = true;
  const readingOffset = () => (header?.getBoundingClientRect().height || 74) + (mobile.matches ? 82 : 40);

  const update = () => {
    frame = 0;
    const offset = readingOffset();
    let next = 0;
    headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top <= offset + 1) next = index; });
    if (next !== current) {
      current = next;
      [desktopLinks, mobileLinks].forEach(links => links.forEach((link, index) => {
        const selected = index === current;
        link.classList.toggle('is-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }));
      if (sectionLabel) sectionLabel.textContent = headings[current].textContent?.trim() || '';
      if (sectionNumber) sectionNumber.textContent = String(current + 1).padStart(2, '0');
      toggle.setAttribute('aria-label', `打开文章目录，当前章节：${sectionLabel?.textContent}`);
    }
    const visible = mobile.matches && headings[0].getBoundingClientRect().top <= offset + 1
      && article.getBoundingClientRect().bottom > offset + 80 && !mobileNav?.classList.contains('is-open');
    toolbar.classList.toggle('is-visible', visible);
    toolbar.inert = !visible;
    toolbar.setAttribute('aria-hidden', String(!visible));
  };
  const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };

  const closeDialog = async (focusTrigger = true, animate = true) => {
    if (!dialog.open || closing) return;
    closing = true;
    restoreFocus = focusTrigger;
    dialogAnimation?.cancel();
    dialogAnimation = animate ? animateUi(dialog, [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translateY(-4px) scale(.98)' },
    ], { duration: 140, easing: 'ease-in', fill: 'forwards' }) : undefined;
    await dialogAnimation?.finished.catch(() => {});
    dialog.close();
    dialogAnimation?.cancel();
    closing = false;
  };
  toggle.addEventListener('click', () => {
    if (dialog.open) return;
    restoreFocus = true;
    dialog.showModal();
    document.documentElement.classList.add('has-reading-dialog');
    toggle.setAttribute('aria-expanded', 'true');
    const activeLink = mobileLinks[current];
    directory.scrollTop = Math.max(0, activeLink.offsetTop - directory.offsetTop - directory.clientHeight / 2 + activeLink.clientHeight / 2);
    activeLink.focus({ preventScroll: true });
    dialogAnimation = animateUi(dialog, [
      { opacity: 0, transform: 'translateY(-6px) scale(.97)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 200 });
  });
  document.querySelector('#articleReadingClose')?.addEventListener('click', () => { void closeDialog(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); void closeDialog(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) void closeDialog();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-reading-dialog');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus && !toolbar.inert) toggle.focus({ preventScroll: true });
    scheduleUpdate();
  });
  mobileLinks.forEach((link, index) => link.addEventListener('click', async event => {
    event.preventDefault();
    if (closing) return;
    await closeDialog(false);
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    const heading = headings[index];
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    scrollTo({ top: Math.max(0, scrollY + heading.getBoundingClientRect().top - readingOffset()), behavior: uiMotionEnabled() ? 'smooth' : 'instant' });
    scheduleUpdate();
  }));
  mobile.addEventListener('change', () => {
    if (inlineDetails) inlineDetails.open = !mobile.matches;
    if (!mobile.matches) void closeDialog(false, false);
    scheduleUpdate();
  });
  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('resize', scheduleUpdate);
  addEventListener('hashchange', scheduleUpdate);
  new ResizeObserver(scheduleUpdate).observe(article);
  if (mobileNav) new MutationObserver(scheduleUpdate).observe(mobileNav, { attributes: true, attributeFilter: ['class'] });
  update();
}
