(function (root) {
  const KEY = "textReplaceState";
  const LEGACY_KEY = "pairs";

  function uid() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function builtinMatch(locale) {
    if (root.TextReplaceMatch && typeof root.TextReplaceMatch.defaultConfig === "function") {
      return root.TextReplaceMatch.defaultConfig(locale);
    }
    return {
      yoToE: true,
      stripSoftSigns: true,
      endings: [],
      phonetic: [],
      stemMinLen: 3,
      stemKeepMin: 2,
      prefixMinLen: 2,
      prefixMaxDiff: 3,
      fuzzyMinLen: 4,
      similarity: 0.82,
      maxPasses: 40,
    };
  }

  function builtinMatchByLocale() {
    if (root.TextReplaceMatch && typeof root.TextReplaceMatch.defaultConfigs === "function") {
      const packs = root.TextReplaceMatch.defaultConfigs();
      const out = {};
      for (const [id, cfg] of Object.entries(packs)) out[id] = normalizeMatch(cfg, cfg);
      return out;
    }
    return { ru: normalizeMatch(null, builtinMatch("ru")), en: normalizeMatch(null, builtinMatch("en")) };
  }

  function clamp(n, min, max, fallback) {
    const x = Number(n);
    if (!Number.isFinite(x)) return fallback;
    return Math.min(max, Math.max(min, x));
  }

  function normalizePhonetic(list) {
    if (!Array.isArray(list)) return builtinMatch().phonetic;
    return list
      .map((rule) => {
        if (!rule || typeof rule !== "object") return null;
        const from = String(rule.from || "").trim();
        if (!from) return null;
        return {
          from,
          to: rule.to == null ? "" : String(rule.to),
          end: Boolean(rule.end),
        };
      })
      .filter(Boolean);
  }

  function normalizeMatch(raw, fallback) {
    const locale = raw?.lang || fallback?.lang;
    const base = fallback
      ? { ...builtinMatch(locale), ...fallback }
      : builtinMatch(locale);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {
        ...base,
        endings: Array.isArray(base.endings) ? base.endings.slice() : [],
        phonetic: normalizePhonetic(base.phonetic),
      };
    }
    const endings = Array.isArray(raw.endings)
      ? raw.endings.map((s) => String(s).trim()).filter(Boolean)
      : typeof raw.endings === "string"
        ? parseEndings(raw.endings)
        : (base.endings || []).slice();
    endings.sort((a, b) => b.length - a.length);
    return {
      lang: raw.lang || base.lang || locale || undefined,
      yoToE: typeof raw.yoToE === "boolean" ? raw.yoToE : base.yoToE !== false,
      stripSoftSigns: typeof raw.stripSoftSigns === "boolean" ? raw.stripSoftSigns : base.stripSoftSigns !== false,
      endings,
      phonetic: raw.phonetic != null ? normalizePhonetic(raw.phonetic) : normalizePhonetic(base.phonetic),
      stemMinLen: clamp(raw.stemMinLen, 1, 12, base.stemMinLen || 3),
      stemKeepMin: clamp(raw.stemKeepMin, 1, 12, base.stemKeepMin || 2),
      prefixMinLen: clamp(raw.prefixMinLen, 1, 12, base.prefixMinLen || 3),
      prefixMaxDiff: clamp(raw.prefixMaxDiff, 0, 12, Number.isFinite(Number(base.prefixMaxDiff)) ? base.prefixMaxDiff : 3),
      fuzzyMinLen: clamp(raw.fuzzyMinLen, 1, 16, base.fuzzyMinLen || 4),
      similarity: clamp(raw.similarity, 0.5, 1, Number.isFinite(Number(base.similarity)) ? base.similarity : 0.82),
      maxPasses: clamp(raw.maxPasses, 1, 80, base.maxPasses || 40),
    };
  }

  function parseEndings(text) {
    return String(text || "")
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function formatEndings(list) {
    return (list || []).join(", ");
  }

  function parsePhoneticText(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const idx = line.indexOf("=");
        if (idx < 0) return null;
        let from = line.slice(0, idx).trim();
        const to = line.slice(idx + 1);
        let end = false;
        if (from.endsWith("$")) {
          end = true;
          from = from.slice(0, -1);
        }
        if (!from) return null;
        return { from, to, end };
      })
      .filter(Boolean);
  }

  function formatPhoneticText(list) {
    return (list || [])
      .map((r) => `${r.from}${r.end ? "$" : ""}=${r.to == null ? "" : r.to}`)
      .join("\n");
  }

  function parseJsonc(text) {
    const src = String(text || "");
    let out = "";
    let inStr = false;
    let escape = false;
    for (let i = 0; i < src.length; i += 1) {
      const c = src[i];
      const next = src[i + 1];
      if (inStr) {
        out += c;
        if (escape) escape = false;
        else if (c === "\\") escape = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') {
        inStr = true;
        out += c;
        continue;
      }
      if (c === "/" && next === "/") {
        i += 1;
        while (i + 1 < src.length && src[i + 1] !== "\n") i += 1;
        continue;
      }
      if (c === "/" && next === "*") {
        i += 1;
        while (i + 1 < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
        i += 1;
        continue;
      }
      out += c;
    }
    return JSON.parse(out.replace(/,\s*([}\]])/g, "$1"));
  }

  function stringifyJsonc(value, comments) {
    const notes = comments && typeof comments === "object" ? comments : {};
    const header = notes.$header
      ? String(notes.$header)
          .split(/\r?\n/)
          .map((line) => `// ${line}`)
          .join("\n") + "\n"
      : "";
    const seen = new Set();
    const body = JSON.stringify(value, null, 2)
      .split("\n")
      .map((line) => {
        const m = line.match(/^(\s*)"([^"]+)":/);
        if (!m) return line;
        const key = m[2];
        const note = notes[key];
        if (!note || seen.has(key)) return line;
        seen.add(key);
        return `${line} // ${String(note).replace(/\s+/g, " ").trim()}`;
      })
      .join("\n");
    return `${header}${body}\n`;
  }

  function normalizeMatchByLocale(raw, legacyDefaults) {
    const base = builtinMatchByLocale();
    const src = raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
    if (legacyDefaults && typeof legacyDefaults === "object" && !src.ru) src.ru = legacyDefaults;
    const ids = new Set(["ru", "en", ...Object.keys(src)]);
    const out = {};
    for (const id of ids) {
      if (!id || id === "type" || id === "version") continue;
      out[id] = normalizeMatch(src[id], base[id] || builtinMatch(id));
    }
    return out;
  }

  function emptyState() {
    const matchByLocale = normalizeMatchByLocale();
    return {
      version: 5,
      locale: "ru",
      dictionaries: {},
      matchByLocale,
      matchDefaults: matchByLocale.ru,
      folders: [],
    };
  }

  function normalizeMode(mode) {
    return mode === "exact" ? "exact" : "fuzzy";
  }

  function normalizePair(pair) {
    return {
      id: pair.id || uid(),
      from: String(pair.from || ""),
      to: pair.to == null ? "" : String(pair.to),
      mode: normalizeMode(pair.mode),
    };
  }

  function untitledName() {
    return "Untitled";
  }

  function normalizeFolder(folder) {
    const inherit = folder?.matchInherit !== false && folder?.match?.inherit !== false;
    return {
      id: folder?.id || uid(),
      name: String(folder?.name || untitledName()).trim() || untitledName(),
      pairs: Array.isArray(folder?.pairs) ? folder.pairs.map(normalizePair) : [],
      matchInherit: inherit,
      match: inherit ? null : normalizeMatch(folder?.match),
      autoApply: folder?.autoApply !== false,
    };
  }

  function migrate(raw) {
    const dictionaries =
      raw && raw.dictionaries && typeof raw.dictionaries === "object" && !Array.isArray(raw.dictionaries)
        ? raw.dictionaries
        : raw && raw.languages && typeof raw.languages === "object"
          ? raw.languages
          : {};
    let locale = String(raw?.locale || "ru").trim() || "ru";
    const matchByLocale = normalizeMatchByLocale(raw?.matchByLocale, raw?.matchDefaults || raw?.match);
    const matchDefaults = matchByLocale[locale] || matchByLocale.ru;
    if (raw && Array.isArray(raw.folders)) {
      return {
        version: 5,
        locale,
        dictionaries,
        matchByLocale,
        matchDefaults,
        folders: raw.folders.map(normalizeFolder),
      };
    }
    const legacy = Array.isArray(raw?.pairs) ? raw.pairs : [];
    if (!legacy.length) {
      return { ...emptyState(), locale, dictionaries, matchByLocale, matchDefaults };
    }
    return {
      version: 5,
      locale,
      dictionaries,
      matchByLocale,
      matchDefaults,
      folders: [normalizeFolder({ name: "General", pairs: legacy })],
    };
  }

  function resolveMatch(state, folder) {
    const loc = state?.locale || "ru";
    const packs = state?.matchByLocale || {};
    const global = normalizeMatch(packs[loc] || packs.ru || state?.matchDefaults, builtinMatch(loc));
    if (!folder || folder.matchInherit !== false) return global;
    return normalizeMatch(folder.match, global);
  }

  function getState() {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve(emptyState());
        return;
      }
      chrome.storage.local.get({ [KEY]: null, [LEGACY_KEY]: [] }, (data) => {
        if (data[KEY] && (Array.isArray(data[KEY].folders) || data[KEY].locale || data[KEY].dictionaries || data[KEY].matchDefaults || data[KEY].matchByLocale)) {
          resolve(migrate(data[KEY]));
          return;
        }
        resolve(migrate({ pairs: data[LEGACY_KEY] }));
      });
    });
  }

  function setState(state) {
    const next = migrate(state);
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve(next);
        return;
      }
      chrome.storage.local.set({ [KEY]: next, [LEGACY_KEY]: [] }, () => resolve(next));
    });
  }

  function pairsForFolder(state, folder) {
    if (!folder) return [];
    const match = resolveMatch(state, folder);
    return (folder.pairs || []).map((p) => ({ ...p, match, folderId: folder.id }));
  }

  function allPairs(state, opts) {
    const autoOnly = Boolean(opts?.autoOnly);
    return (state.folders || []).flatMap((f) => {
      if (autoOnly && f.autoApply === false) return [];
      return pairsForFolder(state, f);
    });
  }

  function settingsPayload(state) {
    const migrated = migrate(state);
    return {
      type: "text-replace-settings",
      version: 5,
      locale: migrated.locale || "ru",
      dictionaries: migrated.dictionaries || {},
      matchByLocale: migrated.matchByLocale,
      matchDefaults: migrated.matchDefaults,
    };
  }

  function matchPayload(state) {
    const migrated = migrate(state);
    return {
      type: "text-replace-match",
      version: 5,
      locale: migrated.locale || "ru",
      matchByLocale: migrated.matchByLocale,
      matchDefaults: migrated.matchDefaults,
    };
  }

  function applySettings(state, payload) {
    const next = migrate(state);
    const incoming =
      payload && payload.dictionaries && typeof payload.dictionaries === "object" && Object.keys(payload.dictionaries).length
        ? payload.dictionaries
        : payload && payload.languages && typeof payload.languages === "object"
          ? payload.languages
          : payload && payload.strings && payload.locale
            ? { [payload.locale]: { label: payload.label || payload.locale, strings: payload.strings } }
            : payload && payload.currentStrings && payload.locale
              ? { [payload.locale]: { label: payload.label || payload.locale, strings: payload.currentStrings } }
              : null;
    let ok = false;
    if (incoming) {
      next.dictionaries = { ...next.dictionaries };
      for (const [id, pack] of Object.entries(incoming)) {
        if (!id || !pack || typeof pack !== "object") continue;
        const prev = next.dictionaries[id] || {};
        const strings = pack.strings || (pack.label ? {} : pack);
        next.dictionaries[id] = {
          label: pack.label || prev.label || id,
          strings: { ...(prev.strings || {}), ...strings },
        };
      }
      ok = true;
    }
    if (payload?.locale) {
      next.locale = String(payload.locale).trim() || next.locale;
      ok = true;
    }
    const matchByLocaleRaw =
      payload?.matchByLocale && typeof payload.matchByLocale === "object" ? payload.matchByLocale : null;
    if (matchByLocaleRaw) {
      next.matchByLocale = normalizeMatchByLocale({ ...next.matchByLocale, ...matchByLocaleRaw });
      ok = true;
    }
    const matchRaw = payload?.matchDefaults || (payload?.type === "text-replace-match" ? payload.match : payload?.match);
    if (matchRaw && typeof matchRaw === "object" && !matchByLocaleRaw) {
      const loc = payload.locale || next.locale || "ru";
      next.matchByLocale = {
        ...next.matchByLocale,
        [loc]: normalizeMatch(matchRaw, builtinMatch(loc)),
      };
      ok = true;
    }
    if (ok) {
      next.matchDefaults = next.matchByLocale[next.locale] || next.matchByLocale.ru;
    }
    return { state: next, ok };
  }

  root.TextReplaceStore = {
    KEY,
    uid,
    emptyState,
    migrate,
    getState,
    setState,
    allPairs,
    pairsForFolder,
    normalizeMode,
    normalizeMatch,
    resolveMatch,
    parseEndings,
    formatEndings,
    parsePhoneticText,
    formatPhoneticText,
    parseJsonc,
    stringifyJsonc,
    normalizeMatchByLocale,
    settingsPayload,
    matchPayload,
    applySettings,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
