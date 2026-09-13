(() => {
  let footerObserver = null;
  let footerNode = null;
  let lastClick = 0;

  // Префиксные селекторы вместо точных классов с хешем (хеш меняется при сборке)
  const FOOTER_SEL = '[class*="PointActions_root_"], [class*="DropBox_"], [class*="PointActions_"]';
  const BONUS_SEL = 'button[class*="PointActions_buttonBonus_"], button[class*="DropBox_root_"]';

  function tryClaim(scope) {
    const btn = (scope || document).querySelector(BONUS_SEL);
    if (!btn) return;
    if (Date.now() - lastClick < 2000) return;
    lastClick = Date.now();
    btn.click();
  }

  function watchFooter(footer) {
    if (footer !== footerNode || !footerObserver) {
      footerObserver?.disconnect();
      footerNode = footer;
      footerObserver = new MutationObserver(() => tryClaim(footerNode));
      footerObserver.observe(footer, { childList: true, subtree: true });
    }
    tryClaim(footer);
  }

  // Дешевый фильтр на добавленные узлы: на сообщение чата — пара проверок
  // класса (микросекунды), тяжелый поиск — только когда приехал нужный узел.
  // Поэтому не страшны ни медленная загрузка, ни пересборка чата:
  // когда бы футер/бонус ни появились и на какой бы глубине — поймаем.
  function handleNode(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(FOOTER_SEL)) {
      watchFooter(node);
      return;
    }
    if (node.matches(BONUS_SEL)) {
      tryClaim();
      return;
    }
    const footer = node.querySelector(FOOTER_SEL);
    if (footer) {
      watchFooter(footer);
      return;
    }
    if (node.querySelector(BONUS_SEL)) tryClaim();
  }

  if (!document.body) return;
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      const added = m.addedNodes;
      for (let i = 0; i < added.length; i++) handleNode(added[i]);
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Вдруг все уже на месте к моменту запуска
  const existing = document.querySelector(FOOTER_SEL);
  if (existing) watchFooter(existing);
  else tryClaim();
})();
