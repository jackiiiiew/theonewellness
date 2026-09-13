/* ==========================================================================
   学员见证：长文折叠 + 按病症分类筛选
   两个语言版本、首页与见证专页共用同一个脚本。
   文案通过 <body data-more-label / data-less-label / data-empty-label> 传入。
   ========================================================================== */
(function () {
  const cards = Array.from(document.querySelectorAll('.tcard'));
  if (!cards.length) return;

  const MORE = document.body.dataset.moreLabel || '展开全文';
  const LESS = document.body.dataset.lessLabel || '收起';

  /* ---------- 1. 长见证折叠（超过一定高度才出现“展开全文”） ---------- */
  function measure(card) {
    if (card.classList.contains('is-open') || card.hidden) return;
    const body = card.querySelector('.tcard-body');
    const btn = card.querySelector('.tcard-more');
    if (!body || !btn) return;
    card.classList.add('is-clamped');
    if (body.scrollHeight > body.clientHeight + 8) {
      btn.classList.add('is-visible');
      btn.textContent = MORE;
      btn.setAttribute('aria-expanded', 'false');
    } else {
      card.classList.remove('is-clamped');
      btn.classList.remove('is-visible');
    }
  }

  cards.forEach((card) => {
    measure(card);
    const btn = card.querySelector('.tcard-more');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      card.classList.toggle('is-clamped', !open);
      btn.textContent = open ? LESS : MORE;
      btn.setAttribute('aria-expanded', String(open));
      if (!open) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });

  // 字体、图片加载完成后重新测量一次，避免高度判断不准
  window.addEventListener('load', () => cards.forEach(measure));
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => cards.forEach(measure), 200);
  });

  /* ---------- 2. 按病症分类筛选（仅见证专页有筛选条） ---------- */
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const chips = Array.from(bar.querySelectorAll('.filter-chip'));
  const emptyNote = document.querySelector('.filter-empty');
  const catsOf = (card) => (card.dataset.cats || '').split(/\s+/).filter(Boolean);

  chips.forEach((chip) => {
    const cat = chip.dataset.cat;
    const n = cat === 'all' ? cards.length : cards.filter((c) => catsOf(c).includes(cat)).length;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = n;
    chip.appendChild(count);
    if (n === 0 && cat !== 'all') chip.hidden = true;   // 暂时没有见证的分类不显示
  });

  function apply(cat) {
    let visible = 0;
    cards.forEach((card) => {
      const match = cat === 'all' || catsOf(card).includes(cat);
      card.hidden = !match;
      if (match) visible += 1;
    });
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.cat === cat)));
    if (emptyNote) emptyNote.hidden = visible > 0;
    cards.forEach(measure);
    if (history.replaceState) {
      history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
    }
  }

  chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.cat)));

  // 支持通过链接直达某个分类，例如 testimonials-zh.html#heart
  const fromHash = location.hash.replace('#', '');
  const initial = chips.some((c) => c.dataset.cat === fromHash && !c.hidden) ? fromHash : 'all';
  apply(initial);
})();
