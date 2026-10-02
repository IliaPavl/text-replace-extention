const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "CODE", "PRE"]);

let pairs = [];
let applying = false;
let suppressed = false;
let debounceTimer = 0;
let observer = null;
const snapshots = [];
let titleOriginal = null;

function remember(node, value) {
  if (snapshots.some((s) => s.node === node)) return;
  snapshots.push({ node, original: value });
}

async function loadAutoPairs() {
  const state = await TextReplaceStore.getState();
  pairs = TextReplaceStore.allPairs(state, { autoOnly: true });
  return pairs;
}

async function loadScanPairs(folderId) {
  const state = await TextReplaceStore.getState();
  const auto = TextReplaceStore.allPairs(state, { autoOnly: true });
  const folder = (state.folders || []).find((f) => f.id === folderId);
  const extra = TextReplaceStore.pairsForFolder(state, folder);
  const byId = new Map();
  for (const pair of [...auto, ...extra]) byId.set(pair.id, pair);
  pairs = [...byId.values()];
  return pairs;
}

function shouldSkip(node) {
  if (!node) return true;
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (SKIP.has(node.nodeName)) return true;
    if (node.isContentEditable) return true;
  }
  const parent = node.parentElement;
  if (!parent) return false;
  if (SKIP.has(parent.nodeName) || parent.isContentEditable) return true;
  if (parent.closest("textarea, input, select, [contenteditable='true']")) return true;
  return false;
}

function walkTextNodes(root, out) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let current = walker.nextNode();
  while (current) {
    out.push(current);
    current = walker.nextNode();
  }
}

function applyToDocument() {
  if (applying || suppressed || !pairs.length) return;
  applying = true;
  try {
    const nodes = [];
    walkTextNodes(document.body || document.documentElement, nodes);
    for (const node of nodes) {
      remember(node, node.nodeValue);
      const next = TextReplaceMatch.applyPairsToString(node.nodeValue, pairs);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    if (document.title) {
      if (titleOriginal == null) titleOriginal = document.title;
      const nextTitle = TextReplaceMatch.applyPairsToString(document.title, pairs);
      if (nextTitle !== document.title) document.title = nextTitle;
    }
  } finally {
    applying = false;
  }
}

function restoreDocument() {
  applying = true;
  suppressed = true;
  try {
    for (const snap of snapshots) {
      if (!snap.node || !snap.node.isConnected) continue;
      if (snap.node.nodeValue !== snap.original) snap.node.nodeValue = snap.original;
    }
    if (titleOriginal != null && document.title !== titleOriginal) {
      document.title = titleOriginal;
    }
  } finally {
    applying = false;
  }
}

function scheduleApply() {
  if (suppressed) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyToDocument, 250);
}

function startObserver() {
  if (observer || !document.body) return;
  observer = new MutationObserver((mutations) => {
    if (applying || suppressed) return;
    for (const m of mutations) {
      if (m.type === "characterData" || m.addedNodes.length) {
        scheduleApply();
        return;
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}

async function boot() {
  await loadAutoPairs();
  applyToDocument();
  startObserver();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (!changes.textReplaceState && !changes.pairs) return;
  loadAutoPairs().then(() => {
    if (!suppressed) scheduleApply();
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "SCAN_NOW") {
    suppressed = false;
    loadScanPairs(msg.folderId).then(() => {
      applyToDocument();
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg?.type === "RESTORE") {
    restoreDocument();
    sendResponse({ ok: true, restored: true });
    return true;
  }
  if (msg?.type === "RESUME_APPLY") {
    suppressed = false;
    loadAutoPairs().then(() => {
      applyToDocument();
      sendResponse({ ok: true });
    });
    return true;
  }
  return false;
});
