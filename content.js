const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "CODE", "PRE"]);

let pairs = [];
let applying = false;
let suppressed = false;
let pinned = false;
let debounceTimer = 0;
let refreshSeq = 0;
let observer = null;
const snapshots = [];
let titleOriginal = null;

function remember(node, value) {
  if (snapshots.some((s) => s.node === node)) return;
  snapshots.push({ node, original: value });
}

async function loadFolder(folderId) {
  const state = await TextReplaceStore.getState();
  const folder = (state.folders || []).find((f) => f.id === folderId) || null;
  return {
    folder,
    pairs: folder ? TextReplaceStore.pairsForFolder(state, folder) : [],
  };
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

function restoreOriginals() {
  for (const snap of snapshots) {
    if (!snap.node || !snap.node.isConnected) continue;
    if (snap.node.nodeValue !== snap.original) snap.node.nodeValue = snap.original;
  }
  if (titleOriginal != null && document.title !== titleOriginal) document.title = titleOriginal;
}

function writeReplacements() {
  if (!pairs.length) return;
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
}

function applyToDocument() {
  if (applying || suppressed || !pairs.length) return;
  applying = true;
  try {
    writeReplacements();
  } finally {
    applying = false;
  }
}

function reapplyLive() {
  applying = true;
  suppressed = false;
  try {
    restoreOriginals();
    writeReplacements();
  } finally {
    applying = false;
  }
}

function restoreDocument() {
  applying = true;
  suppressed = true;
  try {
    restoreOriginals();
  } finally {
    applying = false;
  }
}

async function refreshFromStorage() {
  const seq = ++refreshSeq;
  const activeId = await TextReplaceStore.getActiveFolderId();
  if (seq !== refreshSeq) return;
  if (!activeId) {
    pinned = false;
    pairs = [];
    restoreDocument();
    return;
  }
  const loaded = await loadFolder(activeId);
  if (seq !== refreshSeq) return;
  if (!loaded.folder) {
    pinned = false;
    pairs = [];
    restoreDocument();
    return;
  }
  pairs = loaded.pairs;
  const auto = loaded.folder.autoApply !== false;
  if (!auto && !pinned) {
    restoreDocument();
    return;
  }
  reapplyLive();
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
  await refreshFromStorage();
  startObserver();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (!changes.textReplaceState && !changes.textReplaceActiveFolder && !changes.pairs) return;
  refreshFromStorage();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "SCAN_NOW") {
    loadFolder(msg.folderId).then((loaded) => {
      pairs = loaded.pairs;
      pinned = loaded.folder?.autoApply === false;
      reapplyLive();
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg?.type === "RESTORE" || msg?.type === "PAUSE_APPLY") {
    pinned = false;
    restoreDocument();
    sendResponse({ ok: true, restored: true });
    return true;
  }
  if (msg?.type === "RESUME_APPLY" || msg?.type === "ENTER_FOLDER" || msg?.type === "REFRESH_FOLDER") {
    if (msg.type === "RESUME_APPLY") pinned = false;
    refreshFromStorage().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "LEAVE_FOLDER") {
    pinned = false;
    pairs = [];
    restoreDocument();
    sendResponse({ ok: true });
    return true;
  }
  return false;
});
