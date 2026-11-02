/* Only progressive enhancement: profiles and consultation links work without JS. */
(() => {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.talent-card')];
  const categoryButtons = [...document.querySelectorAll('[data-category-filter]')];
  const filters = [...document.querySelectorAll('.talents-filters, .talents-extra-filters')];
  const empty = document.querySelector('[data-filter-empty]');
  const status = document.querySelector('.talents-result');
  const selectedFilter = () => new URL(location.href).searchParams.get('work') || 'all';
  function renderFilter() {
    const requested = selectedFilter();
    const active = buttons.some(button => button.dataset.filter === requested) ? requested : 'all';
    const requestedCategory = new URL(location.href).searchParams.get('category') || 'all';
    const category = categoryButtons.some(button => button.dataset.categoryFilter === requestedCategory) ? requestedCategory : 'all';
    let count = 0;
    cards.forEach(card => {
      card.hidden = (active !== 'all' && !card.dataset.work.split(' ').includes(active)) || (category !== 'all' && !card.dataset.category.split(' ').includes(category));
      if (!card.hidden) count++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
    categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category)));
    if (status) status.textContent = `${count}名のプロフィール`;
    if (empty) empty.hidden = count !== 0;
  }
  function setFilter(value, key = 'work') {
    const url = new URL(location.href);
    value === 'all' ? url.searchParams.delete(key) : url.searchParams.set(key, value);
    history.pushState(null, '', url);
    renderFilter();
  }
  if (buttons.length) {
    filters.forEach(filter => { filter.hidden = false; });
    categoryButtons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.categoryFilter, 'category')));
    buttons.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
    document.querySelector('[data-reset-filter]')?.addEventListener('click', () => {
      const url = new URL(location.href);
      url.searchParams.delete('work');
      url.searchParams.delete('category');
      history.pushState(null, '', url);
      renderFilter();
      categoryButtons[0].focus();
    });
    window.addEventListener('popstate', renderFilter);
    // Reconcile query state after restoring the page from the browser back/forward cache.
    window.addEventListener('pageshow', renderFilter);
    renderFilter();
  }
  const copyButton = document.querySelector('[data-copy-brief]');
  if (copyButton) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const brief = `【モデル出演のご相談】\n希望モデル：${copyButton.dataset.modelName || '未定（企画に合う方を相談したい）'}\n撮影目的・企画・出演内容：\n撮影・出演希望日時（所要時間）：\n場所：\nご予算：\n使用媒体：\n掲載・使用期間：\nその他の条件：`;
      const live = document.querySelector('.copy-status');
      const fallback = document.querySelector('.copy-fallback');
      try {
        await navigator.clipboard.writeText(brief);
        fallback.hidden = true;
        live.textContent = 'コピーしました。相談窓口で内容を追記してお送りください。';
      } catch {
        fallback.value = brief;
        fallback.hidden = false;
        fallback.focus();
        fallback.select();
        live.textContent = '相談メモを選択しています。コピーして相談窓口でお使いください。';
      }
    });
  }
})();
