// Progressive enhancements for article pages. Everything here is optional:
// without JavaScript the TOC links still jump to headings and code blocks
// still render; the copy buttons just stay hidden.

setUpCopyButtons();
setUpTableOfContents();

function setUpCopyButtons() {
  if (!navigator.clipboard) return;

  for (const block of document.querySelectorAll<HTMLElement>('.code-block')) {
    const button = block.querySelector<HTMLButtonElement>('.code-block__copy');
    const label = button?.querySelector('.code-block__copy-label');
    const code = block.querySelector('pre code');
    if (!button || !label || !code) continue;

    button.hidden = false;
    button.setAttribute('aria-label', 'Copy code to clipboard');
    label.setAttribute('aria-live', 'polite');
    let reset: number | undefined;

    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent ?? '');
        label.textContent = 'Copied';
        button.dataset.state = 'copied';
      } catch {
        // Clipboard access was refused; select the code so a manual copy works.
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection?.removeAllRanges();
        selection?.addRange(range);
        label.textContent = 'Selected — copy manually';
        button.dataset.state = 'failed';
      }
      window.clearTimeout(reset);
      reset = window.setTimeout(() => {
        label.textContent = 'Copy';
        delete button.dataset.state;
      }, 1800);
    });
  }
}

function setUpTableOfContents() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]')];
  if (links.length === 0) return;

  const ids = [...new Set(links.map((link) => decodeURIComponent(link.hash.slice(1))))];
  const headings = ids
    .map((id) => document.getElementById(id))
    .filter((heading): heading is HTMLElement => heading !== null);
  if (headings.length === 0) return;

  const sidebar = document.querySelector<HTMLElement>('.toc-side');
  const marker = sidebar?.querySelector<HTMLElement>('.toc__marker');
  const inlineToc = document.querySelector<HTMLDetailsElement>('.toc-inline');
  // A heading becomes "current" once it passes this line near the top of the viewport.
  const activationLine = () => Math.min(140, window.innerHeight * 0.25);

  let current: string | undefined;
  let frame = 0;
  // After a TOC click, keep the clicked entry active until the smooth scroll ends,
  // instead of flickering through every section on the way.
  let pinned = false;

  function setActive(id: string) {
    if (id === current) return;
    current = id;

    for (const link of links) {
      const active = decodeURIComponent(link.hash.slice(1)) === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }

    const activeLink = sidebar?.querySelector<HTMLElement>('a.is-active');
    if (!sidebar || !marker || !activeLink) return;
    marker.style.transform = `translateY(${activeLink.offsetTop}px)`;
    marker.style.height = `${activeLink.offsetHeight}px`;
    marker.classList.add('is-visible');

    // Keep the active entry in view when the TOC is taller than the viewport.
    const linkTop = activeLink.getBoundingClientRect().top - sidebar.getBoundingClientRect().top;
    if (linkTop < 0 || linkTop > sidebar.clientHeight - activeLink.offsetHeight) {
      sidebar.scrollTo({ top: sidebar.scrollTop + linkTop - sidebar.clientHeight / 2 });
    }
  }

  function update() {
    frame = 0;
    if (pinned) return;

    const line = activationLine();
    let id = headings[0].id;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > line) break;
      id = heading.id;
    }
    // Short final sections can never reach the activation line; at the very
    // bottom of the page, the last heading is the one being read.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) id = headings[headings.length - 1].id;

    setActive(id);
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // Don't recompute on release: the clicked entry stays active until the reader scrolls.
  const unpin = () => {
    pinned = false;
  };

  for (const link of links) {
    link.addEventListener('click', () => {
      setActive(decodeURIComponent(link.hash.slice(1)));
      pinned = true;
      if (inlineToc) inlineToc.open = false;
    });
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    current = undefined;
    schedule();
  });
  window.addEventListener('scrollend', unpin);
  // If the click didn't scroll at all (already in place), release the pin on
  // the next deliberate interaction.
  for (const type of ['wheel', 'touchstart', 'keydown'] as const) {
    window.addEventListener(type, unpin, { passive: true });
  }

  update();
}
