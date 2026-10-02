const foldersScreen = document.getElementById("screen-folders");
const pairsScreen = document.getElementById("screen-pairs");
const folderListEl = document.getElementById("folder-list");
const pairListEl = document.getElementById("pair-list");
const folderForm = document.getElementById("folder-form");
const folderNameEl = document.getElementById("folder-name");
const folderTitleEl = document.getElementById("folder-title");
const pairForm = document.getElementById("pair-form");
const fromEl = document.getElementById("from");
const toEl = document.getElementById("to");
const editIdEl = document.getElementById("edit-id");
const pairModeEl = document.getElementById("pair-mode");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const storageInfoEl = document.getElementById("storage-info");
const localeEl = document.getElementById("locale");
const toastEl = document.getElementById("toast");
const helpPop = document.getElementById("help-pop");
const pairSearchEl = document.getElementById("pair-search");
const globalMatchEl = document.getElementById("global-match-editor");
const folderMatchEl = document.getElementById("folder-match-editor");
const inheritEl = document.getElementById("folder-match-inherit");

let state = TextReplaceStore.emptyState();
let openFolderId = null;
let toastTimer = 0;
let matchSaveTimer = 0;
let pairQuery = "";
let openHelpBtn = null;

function showToast(message, kind) {
  toastEl.hidden = false;
  toastEl.classList.toggle("error", kind === "error");
  toastEl.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

function t(key, vars) {
  return TextReplaceI18n.translate(state.dictionaries, state.locale || "ru", key, vars);
}

function applyStaticI18n() {
  document.documentElement.lang = state.locale || "ru";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll(".help-btn").forEach((el) => {
    el.setAttribute("aria-label", t("helpAria"));
    el.title = t("helpAria");
  });
  fillStorageInfo();
  fillLocaleSelect();
  const matchTitle = document.getElementById("match-global-title");
  if (matchTitle) {
    matchTitle.textContent = t("matchSettingsGlobal", {
      lang: TextReplaceI18n.languageLabel(state.dictionaries, state.locale || "ru"),
    });
  }
  if (!editIdEl.value) saveBtn.textContent = t("addPair");
}

function fillLocaleSelect() {
  const current = state.locale || "ru";
  const locales = TextReplaceI18n.listLocales(state.dictionaries);
  localeEl.innerHTML = "";
  for (const id of locales) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = TextReplaceI18n.languageLabel(state.dictionaries, id);
    if (id === current) opt.selected = true;
    localeEl.append(opt);
  }
}

function folderById(id) {
  return state.folders.find((f) => f.id === id) || null;
}

let persistChain = Promise.resolve();

function persist() {
  const job = persistChain.then(() => TextReplaceStore.setState(state));
  persistChain = job.then(
    () => {},
    () => {}
  );
  return job;
}

function liveFolder() {
  return openFolderId ? folderById(openFolderId) : null;
}

let sessionChain = Promise.resolve();

function runSession(fn) {
  const job = sessionChain.then(fn, fn);
  sessionChain = job.then(
    () => {},
    () => {}
  );
  return job;
}

async function enterFolder(id) {
  await TextReplaceStore.setActiveFolderId(id);
  try {
    await sendToTab({ type: "ENTER_FOLDER", folderId: id });
  } catch {
    /* tab may not allow the script */
  }
}

async function leaveFolder() {
  await TextReplaceStore.setActiveFolderId(null);
  try {
    await sendToTab({ type: "LEAVE_FOLDER" });
  } catch {
    /* tab may not allow the script */
  }
}

async function refreshOpenFolder() {
  if (!openFolderId) return;
  try {
    await sendToTab({ type: "REFRESH_FOLDER", folderId: openFolderId });
  } catch {
    /* tab may not allow the script */
  }
}

function setPairMode(mode) {
  const next = TextReplaceStore.normalizeMode(mode);
  pairModeEl.value = next;
  document.getElementById("mode-fuzzy").classList.toggle("active", next === "fuzzy");
  document.getElementById("mode-exact").classList.toggle("active", next === "exact");
}

function resetPairForm() {
  pairForm.reset();
  editIdEl.value = "";
  setPairMode("fuzzy");
  saveBtn.textContent = t("addPair");
  cancelBtn.hidden = true;
}

function helpButton(key) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "help-btn";
  btn.dataset.help = key;
  btn.textContent = "?";
  btn.setAttribute("aria-label", t("helpAria"));
  btn.title = t("helpAria");
  return btn;
}

function labeledControl(labelKey, helpKey, control) {
  const wrap = document.createElement("label");
  wrap.className = "field";
  const lab = document.createElement("span");
  lab.className = "field-label";
  const text = document.createElement("span");
  text.textContent = t(labelKey);
  lab.append(text, helpButton(helpKey));
  wrap.append(lab, control);
  return wrap;
}

function numInput(name, value, min, max, step) {
  const input = document.createElement("input");
  input.type = "number";
  input.name = name;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  return input;
}

function renderMatchEditor(root, cfg, disabled) {
  root.innerHTML = "";
  const simWrap = document.createElement("div");
  simWrap.className = "range-row";
  const range = document.createElement("input");
  range.type = "range";
  range.name = "similarity";
  range.min = "0.5";
  range.max = "1";
  range.step = "0.01";
  range.value = String(cfg.similarity);
  const simVal = document.createElement("span");
  simVal.className = "range-val";
  simVal.textContent = Number(cfg.similarity).toFixed(2);
  range.addEventListener("input", () => {
    simVal.textContent = Number(range.value).toFixed(2);
  });
  simWrap.append(range, simVal);
  root.append(labeledControl("matchSimilarity", "helpSimilarity", simWrap));

  const endings = document.createElement("textarea");
  endings.name = "endings";
  endings.rows = 3;
  endings.value = TextReplaceStore.formatEndings(cfg.endings);
  root.append(labeledControl("matchEndings", "helpEndings", endings));

  const phonetic = document.createElement("textarea");
  phonetic.name = "phonetic";
  phonetic.rows = 5;
  phonetic.value = TextReplaceStore.formatPhoneticText(cfg.phonetic);
  root.append(labeledControl("matchPhonetic", "helpPhonetic", phonetic));

  root.append(labeledControl("matchPrefixDiff", "helpPrefixDiff", numInput("prefixMaxDiff", cfg.prefixMaxDiff, 0, 12, 1)));
  root.append(labeledControl("matchPrefixMin", "helpPrefixMin", numInput("prefixMinLen", cfg.prefixMinLen, 1, 12, 1)));
  root.append(labeledControl("matchFuzzyMin", "helpFuzzyMin", numInput("fuzzyMinLen", cfg.fuzzyMinLen, 1, 16, 1)));
  root.append(labeledControl("matchStemMin", "helpStemMin", numInput("stemMinLen", cfg.stemMinLen, 1, 12, 1)));
  root.append(labeledControl("matchStemKeep", "helpStemKeep", numInput("stemKeepMin", cfg.stemKeepMin, 1, 12, 1)));
  root.append(labeledControl("matchMaxPasses", "helpMaxPasses", numInput("maxPasses", cfg.maxPasses, 1, 80, 1)));

  const yo = document.createElement("input");
  yo.type = "checkbox";
  yo.name = "yoToE";
  yo.checked = cfg.yoToE !== false;
  const yoRow = document.createElement("label");
  yoRow.className = "check-row";
  const yoText = document.createElement("span");
  yoText.textContent = t("matchYo");
  yoRow.append(yo, yoText, helpButton("helpYo"));
  root.append(yoRow);

  const soft = document.createElement("input");
  soft.type = "checkbox";
  soft.name = "stripSoftSigns";
  soft.checked = cfg.stripSoftSigns !== false;
  const softRow = document.createElement("label");
  softRow.className = "check-row";
  const softText = document.createElement("span");
  softText.textContent = t("matchSoft");
  softRow.append(soft, softText, helpButton("helpSoft"));
  root.append(softRow);

  root.querySelectorAll("input, textarea").forEach((el) => {
    el.disabled = Boolean(disabled);
  });
}

function readMatchEditor(root) {
  const g = (name) => root.querySelector(`[name="${name}"]`);
  return TextReplaceStore.normalizeMatch({
    similarity: g("similarity")?.value,
    endings: TextReplaceStore.parseEndings(g("endings")?.value || ""),
    phonetic: TextReplaceStore.parsePhoneticText(g("phonetic")?.value || ""),
    prefixMaxDiff: g("prefixMaxDiff")?.value,
    prefixMinLen: g("prefixMinLen")?.value,
    fuzzyMinLen: g("fuzzyMinLen")?.value,
    stemMinLen: g("stemMinLen")?.value,
    stemKeepMin: g("stemKeepMin")?.value,
    maxPasses: g("maxPasses")?.value,
    yoToE: Boolean(g("yoToE")?.checked),
    stripSoftSigns: Boolean(g("stripSoftSigns")?.checked),
  });
}

function fillMatchEditors() {
  renderMatchEditor(globalMatchEl, TextReplaceStore.resolveMatch(state, { matchInherit: true }), false);
  const folder = folderById(openFolderId);
  if (!folder) return;
  inheritEl.checked = folder.matchInherit !== false;
  const cfg = TextReplaceStore.resolveMatch(state, folder);
  renderMatchEditor(folderMatchEl, cfg, folder.matchInherit !== false);
}

function scheduleMatchSave(source) {
  clearTimeout(matchSaveTimer);
  matchSaveTimer = setTimeout(() => {
    saveMatchFromEditor(source);
  }, 280);
}

async function saveMatchFromEditor(source) {
  if (source === "global") {
    const loc = state.locale || "ru";
    state.matchByLocale = { ...(state.matchByLocale || {}), [loc]: readMatchEditor(globalMatchEl) };
    state.matchDefaults = state.matchByLocale[loc];
    await persist();
    return;
  }
  const folder = folderById(openFolderId);
  if (!folder || folder.matchInherit !== false) return;
  folder.match = readMatchEditor(folderMatchEl);
  await persist();
}

function showFolders(options) {
  const leave = options?.leave !== false && openFolderId != null;
  openFolderId = null;
  foldersScreen.hidden = false;
  pairsScreen.hidden = true;
  applyStaticI18n();
  fillMatchEditors();
  renderFolders();
  if (leave) void runSession(() => leaveFolder());
}

function showFolder(id, options) {
  const folder = folderById(id);
  if (!folder) {
    showFolders();
    return;
  }
  openFolderId = id;
  foldersScreen.hidden = true;
  pairsScreen.hidden = false;
  applyStaticI18n();
  folderTitleEl.textContent = folder.name;
  document.getElementById("folder-auto").checked = folder.autoApply !== false;
  pairSearchEl.value = pairQuery;
  if (!options?.keepForm) resetPairForm();
  fillMatchEditors();
  renderPairs(folder);
  if (options?.enter !== false) void runSession(() => enterFolder(id));
}

function renderFolders() {
  folderListEl.innerHTML = "";
  if (!state.folders.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = t("noFolders");
    folderListEl.append(empty);
    return;
  }
  for (const folder of state.folders) {
    const li = document.createElement("li");
    li.className = "card";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "card-main";
    open.setAttribute("aria-label", `${t("openFolder")}: ${folder.name}`);
    const name = document.createElement("p");
    name.className = "card-name";
    name.textContent = folder.name;
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = t("pairsCount", { count: (folder.pairs || []).length });
    if (folder.autoApply === false) meta.textContent += ` · ${t("autoOff")}`;
    open.append(name, meta);
    open.addEventListener("click", () => showFolder(folder.id));
    const chev = document.createElement("span");
    chev.className = "disclosure";
    chev.setAttribute("aria-hidden", "true");
    const actions = document.createElement("div");
    actions.className = "card-side";
    const rename = document.createElement("button");
    rename.type = "button";
    rename.className = "iconish";
    rename.textContent = t("rename");
    rename.addEventListener("click", async (e) => {
      e.stopPropagation();
      const nextName = prompt(t("renameFolderPrompt"), folder.name);
      if (!nextName || !nextName.trim()) return;
      folder.name = nextName.trim();
      await persist();
      renderFolders();
    });
    const exp = document.createElement("button");
    exp.type = "button";
    exp.className = "iconish";
    exp.textContent = t("exportFolder");
    exp.addEventListener("click", (e) => {
      e.stopPropagation();
      downloadJson(safeFileName(`text-replace-${folder.name}.json`), {
        type: "text-replace-data",
        version: 5,
        locale: state.locale || "ru",
        matchByLocale: state.matchByLocale,
        matchDefaults: state.matchDefaults,
        dictionaries: state.dictionaries || {},
        folders: [folder],
      });
    });
    const del = document.createElement("button");
    del.type = "button";
    del.className = "danger iconish";
    del.textContent = t("delete");
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(t("deleteFolderConfirm", { name: folder.name }))) return;
      state.folders = state.folders.filter((f) => f.id !== folder.id);
      await persist();
      renderFolders();
    });
    actions.append(rename, exp, del);
    li.append(open, chev, actions);
    folderListEl.append(li);
  }
}

function pairMatchesQuery(pair, query) {
  if (!query) return true;
  const mode = pair.mode === "exact" ? t("modeExact") : t("modeFuzzy");
  const hay = `${pair.from}\n${pair.to}\n${mode}\n${pair.mode || ""}`.toLowerCase();
  return hay.includes(query);
}

function renderPairs(folder) {
  pairListEl.innerHTML = "";
  const pairs = folder.pairs || [];
  const query = pairQuery.trim().toLowerCase();
  const visible = pairs.filter((p) => pairMatchesQuery(p, query));
  if (!pairs.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = t("noPairs");
    pairListEl.append(empty);
    return;
  }
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = t("noSearchHits");
    pairListEl.append(empty);
    return;
  }
  for (const pair of visible) {
    const li = document.createElement("li");
    li.className = "card";
    const body = document.createElement("div");
    body.className = "card-main";
    const from = document.createElement("p");
    from.className = "pair-from";
    from.textContent = pair.from;
    const to = document.createElement("p");
    to.className = "pair-to";
    to.textContent = `→ ${pair.to || t("emptyReplacement")}`;
    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = `badge${pair.mode === "exact" ? " exact" : ""}`;
    badge.textContent = pair.mode === "exact" ? t("modeExact") : t("modeFuzzy");
    badge.title = pair.mode === "exact" ? t("modeFuzzy") : t("modeExact");
    badge.addEventListener("click", async () => {
      const current = liveFolder();
      const item = current?.pairs.find((p) => p.id === pair.id);
      if (!item) return;
      item.mode = item.mode === "exact" ? "fuzzy" : "exact";
      await persist();
      const fresh = liveFolder();
      if (fresh) renderPairs(fresh);
      await refreshOpenFolder();
    });
    body.append(from, to, badge);
    const actions = document.createElement("div");
    actions.className = "card-side";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "iconish";
    edit.textContent = t("edit");
    edit.addEventListener("click", () => {
      fromEl.value = pair.from;
      toEl.value = pair.to;
      editIdEl.value = pair.id;
      setPairMode(pair.mode);
      saveBtn.textContent = t("savePair");
      cancelBtn.hidden = false;
      fromEl.focus();
    });
    const del = document.createElement("button");
    del.type = "button";
    del.className = "danger iconish";
    del.textContent = t("delete");
    del.addEventListener("click", async () => {
      const current = liveFolder();
      if (!current) return;
      current.pairs = current.pairs.filter((p) => p.id !== pair.id);
      await persist();
      const fresh = liveFolder();
      if (fresh) renderPairs(fresh);
      await refreshOpenFolder();
    });
    actions.append(edit, del);
    li.append(body, actions);
    pairListEl.append(li);
  }
}

function fillStorageInfo() {
  const id =
    typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id
      ? chrome.runtime.id
      : "—";
  storageInfoEl.innerHTML = t("storageInfo", { key: TextReplaceStore.KEY, id });
}

function jsonComments() {
  return {
    $header: t("jsonCommentHeader"),
    type: t("jsonCommentType"),
    version: t("jsonCommentVersion"),
    locale: t("jsonCommentLocale"),
    dictionaries: t("jsonCommentDictionaries"),
    matchByLocale: t("jsonCommentMatchByLocale"),
    matchDefaults: t("jsonCommentMatchDefaults"),
    ru: t("jsonCommentRu"),
    en: t("jsonCommentEn"),
    folders: t("jsonCommentFolders"),
    pairs: t("jsonCommentPairs"),
    mode: t("jsonCommentMode"),
    autoApply: t("jsonCommentAutoApply"),
    matchInherit: t("jsonCommentMatchInherit"),
    match: t("jsonCommentMatch"),
    endings: t("jsonCommentEndings"),
    phonetic: t("jsonCommentPhonetic"),
    similarity: t("jsonCommentSimilarity"),
    yoToE: t("jsonCommentYoToE"),
    stripSoftSigns: t("jsonCommentStripSoft"),
    prefixMaxDiff: t("jsonCommentPrefixMax"),
    prefixMinLen: t("jsonCommentPrefixMin"),
    fuzzyMinLen: t("jsonCommentFuzzyMin"),
    stemMinLen: t("jsonCommentStemMin"),
    stemKeepMin: t("jsonCommentStemKeep"),
    maxPasses: t("jsonCommentMaxPasses"),
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([TextReplaceStore.stringifyJsonc(payload, jsonComments())], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeFileName(name) {
  return String(name || "folder")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

let importMode = "append";

async function importFoldersFromFile(file, replaceAll) {
  const parsed = TextReplaceStore.parseJsonc(await file.text());
  const incoming = TextReplaceStore.migrate(parsed);
  if (!incoming.folders.length) {
    alert(t("importNoFolders"));
    return;
  }
  if (replaceAll) {
    state = incoming;
  } else {
    for (const folder of incoming.folders) {
      state.folders.push({
        ...folder,
        id: TextReplaceStore.uid(),
        pairs: (folder.pairs || []).map((p) => ({ ...p, id: TextReplaceStore.uid() })),
      });
    }
    const applied = TextReplaceStore.applySettings(state, parsed);
    if (applied.ok) state = applied.state;
  }
  await persist();
  showFolders();
  showToast(t(replaceAll ? "importReplaceOk" : "importAppendOk"));
}

function hideHelp() {
  helpPop.hidden = true;
  openHelpBtn = null;
}

function toggleHelp(btn) {
  if (openHelpBtn === btn && !helpPop.hidden) {
    hideHelp();
    return;
  }
  helpPop.textContent = t(btn.dataset.help);
  helpPop.hidden = false;
  openHelpBtn = btn;
  const rect = btn.getBoundingClientRect();
  const bodyW = document.body.clientWidth;
  const left = Math.min(Math.max(8, rect.left), bodyW - 292);
  let top = rect.bottom + 6;
  helpPop.style.left = `${left}px`;
  helpPop.style.top = `${top}px`;
  const popH = helpPop.offsetHeight;
  if (top + popH > window.innerHeight - 8) {
    helpPop.style.top = `${Math.max(8, rect.top - popH - 6)}px`;
  }
}

async function sendToTab(payload) {
  if (typeof chrome === "undefined" || !chrome.tabs) return null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  try {
    return await chrome.tabs.sendMessage(tab.id, payload);
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["match.js", "storage.js", "content.js"],
    });
    return chrome.tabs.sendMessage(tab.id, payload);
  }
}

async function scanPage() {
  try {
    const result = await sendToTab({ type: "SCAN_NOW", folderId: openFolderId });
    if (!result) {
      showToast(t("scanFail"), "error");
      return;
    }
    showToast(t("scanDone"));
  } catch {
    showToast(t("scanFail"), "error");
  }
}

async function restorePage() {
  try {
    const result = await sendToTab({ type: "RESTORE" });
    if (!result) {
      showToast(t("restoreFail"), "error");
      return;
    }
    showToast(t("restoreDone"));
  } catch {
    showToast(t("restoreFail"), "error");
  }
}

document.addEventListener(
  "click",
  (e) => {
    const btn = e.target.closest(".help-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggleHelp(btn);
      return;
    }
    if (!e.target.closest("#help-pop")) hideHelp();
  },
  true
);

localeEl.addEventListener("change", async () => {
  state.locale = localeEl.value || "ru";
  await persist();
  if (openFolderId && folderById(openFolderId)) showFolder(openFolderId, { keepForm: true, enter: false });
  else showFolders({ leave: false });
});

document.getElementById("mode-fuzzy").addEventListener("click", () => setPairMode("fuzzy"));
document.getElementById("mode-exact").addEventListener("click", () => setPairMode("exact"));

folderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = folderNameEl.value.trim();
  if (!name) return;
  state.folders.push({
    id: TextReplaceStore.uid(),
    name,
    pairs: [],
    matchInherit: true,
    match: null,
    autoApply: true,
  });
  folderNameEl.value = "";
  await persist();
  renderFolders();
});

pairForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const folder = liveFolder();
  if (!folder) return;
  const from = fromEl.value.trim();
  const to = toEl.value;
  const mode = TextReplaceStore.normalizeMode(pairModeEl.value);
  if (!from) return;
  const id = editIdEl.value;
  if (id) {
    const idx = folder.pairs.findIndex((p) => p.id === id);
    if (idx >= 0) folder.pairs[idx] = { ...folder.pairs[idx], from, to, mode };
  } else {
    folder.pairs.push({ id: TextReplaceStore.uid(), from, to, mode });
  }
  await persist();
  resetPairForm();
  const fresh = liveFolder();
  if (fresh) renderPairs(fresh);
  await refreshOpenFolder();
});

cancelBtn.addEventListener("click", resetPairForm);
document.getElementById("back").addEventListener("click", showFolders);
document.getElementById("scan").addEventListener("click", scanPage);
document.getElementById("restore").addEventListener("click", restorePage);

document.getElementById("folder-auto").addEventListener("change", async () => {
  const folder = liveFolder();
  if (!folder) return;
  folder.autoApply = document.getElementById("folder-auto").checked;
  await persist();
  try {
    await sendToTab({ type: folder.autoApply ? "RESUME_APPLY" : "PAUSE_APPLY" });
  } catch {
    /* tab may not allow the script */
  }
});

pairSearchEl.addEventListener("input", () => {
  pairQuery = pairSearchEl.value;
  const folder = folderById(openFolderId);
  if (folder) renderPairs(folder);
});

globalMatchEl.addEventListener("input", () => scheduleMatchSave("global"));
globalMatchEl.addEventListener("change", () => scheduleMatchSave("global"));
folderMatchEl.addEventListener("input", () => scheduleMatchSave("folder"));
folderMatchEl.addEventListener("change", () => scheduleMatchSave("folder"));

inheritEl.addEventListener("change", async () => {
  const folder = folderById(openFolderId);
  if (!folder) return;
  if (inheritEl.checked) {
    folder.matchInherit = true;
    folder.match = null;
  } else {
    folder.matchInherit = false;
    folder.match = TextReplaceStore.resolveMatch(state, { matchInherit: true });
  }
  await persist();
  fillMatchEditors();
});

document.getElementById("export-all").addEventListener("click", () => {
  downloadJson("text-replace-data.json", state);
});

document.getElementById("import-replace").addEventListener("click", () => {
  importMode = "replace";
  document.getElementById("import-file").click();
});

document.getElementById("import-append").addEventListener("click", () => {
  importMode = "append";
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    await importFoldersFromFile(file, importMode === "replace");
  } catch {
    alert(t("importBadJson"));
  }
});

document.getElementById("export-settings").addEventListener("click", () => {
  const locale = state.locale || "ru";
  downloadJson("text-replace-settings.json", {
    ...TextReplaceStore.settingsPayload(state),
    builtin: TextReplaceI18n.BUILTIN,
    currentStrings: TextReplaceI18n.mergedStrings(state.dictionaries, locale),
  });
});

document.getElementById("import-settings").addEventListener("click", () => {
  document.getElementById("import-settings-file").click();
});

async function importSettingsFile(file, okKey) {
  try {
    const parsed = TextReplaceStore.parseJsonc(await file.text());
    const applied = TextReplaceStore.applySettings(state, parsed);
    if (!applied.ok) {
      alert(t("importSettingsBad"));
      return;
    }
    state = applied.state;
    await persist();
    if (openFolderId) showFolder(openFolderId, { keepForm: true, enter: false });
    else showFolders({ leave: false });
    showToast(t(okKey));
  } catch {
    alert(t("importBadJson"));
  }
}

document.getElementById("import-settings-file").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (file) await importSettingsFile(file, "importSettingsOk");
});

document.getElementById("export-match").addEventListener("click", () => {
  downloadJson("text-replace-match.json", TextReplaceStore.matchPayload(state));
});

document.getElementById("import-match").addEventListener("click", () => {
  document.getElementById("import-match-file").click();
});

document.getElementById("import-match-file").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (file) await importSettingsFile(file, "importMatchOk");
});

Promise.all([TextReplaceStore.getState(), TextReplaceStore.getActiveFolderId()]).then(([loaded, activeId]) => {
  state = loaded;
  if (activeId && folderById(activeId)) showFolder(activeId);
  else {
    if (activeId) void TextReplaceStore.setActiveFolderId(null);
    showFolders({ leave: false });
  }
});
