(() => {
  let summaryObserver = null;
  let summaryNode = null;
  let lastClick = 0;

  const SUMMARY_SEL = '.community-points-summary';
  const BONUS_SEL = '.claimable-bonus__icon, button[aria-label="Claim Bonus"]';

  function tryClaim(scope) {
    const found = (scope || document).querySelector(BONUS_SEL);
    if (!found) return;
    if (Date.now() - lastClick < 2000) return;
    lastClick = Date.now();
    (found.closest('button') || found).click();
  }

  function watchSummary(summary) {
    if (summary !== summaryNode || !summaryObserver) {
      summaryObserver?.disconnect();
      summaryNode = summary;
      summaryObserver = new MutationObserver(() => tryClaim(summaryNode));
      summaryObserver.observe(summary, { childList: true, subtree: true });
    }
    tryClaim(summary);
  }

  function handleNode(node) {
    if (node.nodeType !== 1) return;
    if (node.matches(SUMMARY_SEL)) {
      watchSummary(node);
      return;
    }
    if (node.matches(BONUS_SEL)) {
      tryClaim();
      return;
    }
    const summary = node.querySelector(SUMMARY_SEL);
    if (summary) {
      watchSummary(summary);
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

  const existing = document.querySelector(SUMMARY_SEL);
  if (existing) watchSummary(existing);
  else tryClaim();
})();
