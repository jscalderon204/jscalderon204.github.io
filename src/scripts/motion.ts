/* ============================================================================
   Motion layer, progressive enhancement only.
   The no-JS and reduced-motion renders are the final, visible content; this
   module only *adds* motion when it is welcome. The `.motion` class on <html>
   (set synchronously by an inline gate in BaseLayout) already scopes every
   pre-animation CSS state, so by the time this deferred module runs, anything
   it touches is already allowed to move.
   ========================================================================= */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- ease-out expo, matched to the site's --ease token ------------------- */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ---- Count-up ------------------------------------------------------------ *
   Animates an element's number from 0 to its real value, then writes the exact
   source string on the final frame so nothing is ever rounded away. Honors the
   "measured truth" rule: the last frame is byte-identical to the static value. */
function formatNumber(v: number, decimals: number, group: boolean): string {
  const fixed = v.toFixed(decimals);
  if (!group) return fixed;
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return frac ? `${grouped}.${frac}` : grouped;
}

function countUp(el: HTMLElement) {
  const target = parseFloat(el.dataset.countup || '');
  if (!Number.isFinite(target)) return;
  const decimals = parseInt(el.dataset.countupDecimals || '0', 10);
  const prefix = el.dataset.countupPrefix || '';
  const suffix = el.dataset.countupSuffix || '';
  const group = el.dataset.countupGroup === 'true' || /,/.test(el.textContent || '');
  const finalText = `${prefix}${formatNumber(target, decimals, group)}${suffix}`;
  const dur = 1100;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const v = easeOutExpo(t) * target;
    el.textContent = `${prefix}${formatNumber(v, decimals, group)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = finalText; // exact source value, guaranteed
  };
  requestAnimationFrame(tick);
}

/* ---- Reveal-on-scroll: one shared observer for everything ---------------- */
function initReveals() {
  const targets = document.querySelectorAll<HTMLElement>(
    '.reveal, .chart-anim, [data-countup]'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-in');
        if (el.dataset.countup) countUp(el);
        obs.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
  );

  targets.forEach((el) => io.observe(el));
}

/* ---- Confusion-matrix: hover/focus highlights row + column, reads out ----
   This is informational (not animation), so it runs even under reduced motion. */
function initConfusionMatrix() {
  const cm = document.querySelector<HTMLElement>('[data-cm]');
  if (!cm) return;
  const readout = cm.querySelector<HTMLElement>('[data-cm-readout]');
  const defaultReadout = readout?.textContent || '';
  const cols = cm.querySelectorAll<SVGTextElement>('[data-cm-col]');
  const rows = cm.querySelectorAll<SVGTextElement>('[data-cm-row]');
  const cells = cm.querySelectorAll<SVGGElement>('[data-cm-cell]');

  const clear = () => {
    cm.querySelectorAll('.is-axis-hi').forEach((n) => n.classList.remove('is-axis-hi'));
    cm.querySelectorAll('.is-cell-hi').forEach((n) => n.classList.remove('is-cell-hi'));
    if (readout) readout.textContent = defaultReadout;
  };

  const activate = (cell: SVGGElement) => {
    clear();
    const i = +(cell.dataset.i || -1);
    const j = +(cell.dataset.j || -1);
    cell.classList.add('is-cell-hi');
    rows[i]?.classList.add('is-axis-hi');
    cols[j]?.classList.add('is-axis-hi');
    if (readout) {
      const { trueCity, predCity, count, total, pct } = cell.dataset;
      readout.textContent =
        `True ${trueCity} → predicted ${predCity}: ${count} of ${total} · ${pct}%`;
    }
  };

  cells.forEach((cell) => {
    cell.addEventListener('pointerenter', () => activate(cell));
    cell.addEventListener('focus', () => activate(cell));
  });
  cm.addEventListener('pointerleave', clear);
  cm.addEventListener('focusout', (e) => {
    // only clear when focus leaves the matrix entirely
    if (!cm.contains((e as FocusEvent).relatedTarget as Node)) clear();
  });
}

/* ---- Reading-progress bar (case pages) + nav elevate-on-scroll ----------- */
function initScrollChrome() {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const root = document.documentElement;
  let ticking = false;

  const update = () => {
    ticking = false;
    const scrolled = window.scrollY;
    root.classList.toggle('is-scrolled', scrolled > 8);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const frac = max > 0 ? Math.min(1, scrolled / max) : 0;
      bar.style.transform = `scaleX(${frac})`;
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---- Boot ---------------------------------------------------------------- */
// Reveals + count-ups are motion; skip entirely under reduced motion (the CSS
// never hid them, so they are already visible at their final state).
if (!reduce) initReveals();
// These two are useful regardless of motion preference.
initConfusionMatrix();
initScrollChrome();
