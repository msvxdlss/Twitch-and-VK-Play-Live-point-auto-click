(() => {
  let footerObserver = null;
  let footerNode = null;
  let lastClick = 0;

  const FOOTER_SEL = '[class*="PointActions_"], [class*="DropBox_"]';
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

  const existing = document.querySelector(FOOTER_SEL);
  if (existing) watchFooter(existing);
  else tryClaim();
})();
