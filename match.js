(function (root) {
  const RU_ENDINGS = [
    "ами", "ями", "ого", "ему", "ому", "его", "ах", "ях",
    "ов", "ев", "ом", "ем", "ой", "ей", "ью", "ия", "ие",
    "ые", "ая", "ое", "ую", "ий", "ый", "а", "я", "у", "ю", "е", "и", "ы", "о",
  ];

  const RU_PHONETIC = [
    { from: "э", to: "е" },
    { from: "ы", to: "и" },
    { from: "я", to: "иа" },
    { from: "ю", to: "иу" },
    { from: "й", to: "", end: true },
  ];

  const EN_ENDINGS = [
    "ational", "ization", "iveness", "fulness", "ousness", "ation", "tional",
    "ments", "ings", "edly", "ally", "ily", "able", "ible", "ment", "ness",
    "tion", "sion", "less", "ful", "ous", "ive", "ize", "ise", "ing", "ied",
    "ies", "ers", "est", "ly", "ed", "es", "er", "s",
  ];

  function cloneRules(list) {
    return (list || []).map((r) => (typeof r === "string" ? r : { ...r }));
  }

  function russianConfig() {
    return {
      lang: "ru",
      yoToE: true,
      stripSoftSigns: true,
      endings: cloneRules(RU_ENDINGS),
      phonetic: cloneRules(RU_PHONETIC),
      stemMinLen: 3,
      stemKeepMin: 2,
      prefixMinLen: 2,
      prefixMaxDiff: 3,
      fuzzyMinLen: 4,
      similarity: 0.82,
      maxPasses: 40,
    };
  }

  function englishConfig() {
    return {
      lang: "en",
      yoToE: false,
      stripSoftSigns: false,
      endings: cloneRules(EN_ENDINGS),
      phonetic: [
        { from: "ise", to: "ize", end: true },
        { from: "yse", to: "yze", end: true },
      ],
      stemMinLen: 4,
      stemKeepMin: 3,
      prefixMinLen: 3,
      prefixMaxDiff: 2,
      fuzzyMinLen: 5,
      similarity: 0.86,
      maxPasses: 40,
    };
  }

  function presetId(locale) {
    const id = String(locale || "ru").toLowerCase();
    if (id === "en" || id.startsWith("en-")) return "en";
    if (id === "ru" || id.startsWith("ru-")) return "ru";
    return "en";
  }

  function defaultConfig(locale) {
    return presetId(locale) === "en" ? englishConfig() : russianConfig();
  }

  function defaultConfigs() {
    return { ru: russianConfig(), en: englishConfig() };
  }

  function cfg(raw) {
    return raw && typeof raw === "object" ? raw : defaultConfig();
  }

  function fold(raw, settings) {
    const c = cfg(settings);
    let s = String(raw || "").toLowerCase();
    if (c.yoToE !== false) s = s.replace(/ё/g, "е");
    s = s
      .replace(/[«»""'`.,!?;:()[\]{}]/g, " ")
      .replace(/[-–—/\\]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return s;
  }

  function phonetic(raw, settings) {
    const c = cfg(settings);
    let s = fold(raw, c);
    if (c.stripSoftSigns !== false) s = s.replace(/[ъь]/g, "");
    for (const rule of c.phonetic || []) {
      const from = String(rule.from || "");
      if (!from) continue;
      const to = rule.to == null ? "" : String(rule.to);
      if (rule.end) {
        if (s.endsWith(from)) s = s.slice(0, -from.length) + to;
      } else {
        s = s.split(from).join(to);
      }
    }
    return s;
  }

  function stem(raw, settings) {
    const c = cfg(settings);
    const p = phonetic(raw, c);
    const minLen = Number(c.stemMinLen) || 3;
    const keep = Number(c.stemKeepMin) || 2;
    if (p.length <= minLen) return p;
    const endings = [...(c.endings || [])].sort((a, b) => b.length - a.length);
    for (const end of endings) {
      if (p.length - end.length >= keep && p.endsWith(end)) return p.slice(0, -end.length);
    }
    return p;
  }

  function tokensSimilar(a, b, settings) {
    const c = cfg(settings);
    const pa = phonetic(a, c);
    const pb = phonetic(b, c);
    if (!pa || !pb) return false;
    if (pa === pb) return true;
    const sa = stem(a, c);
    const sb = stem(b, c);
    if (sa && sb && sa === sb) return true;
    const prefixMin = Number(c.prefixMinLen) || 3;
    const prefixDiff = Number(c.prefixMaxDiff);
    const maxDiff = Number.isFinite(prefixDiff) ? prefixDiff : 3;
    if (sa.length >= prefixMin && sb.length >= prefixMin && (sa.startsWith(sb) || sb.startsWith(sa))) {
      if (Math.abs(sa.length - sb.length) <= maxDiff) return true;
    }
    const maxLen = Math.max(pa.length, pb.length);
    const fuzzyMin = Number(c.fuzzyMinLen) || 4;
    if (maxLen < fuzzyMin) return false;
    const sim = Number(c.similarity);
    const need = Number.isFinite(sim) ? sim : 0.82;
    return 1 - levenshtein(pa, pb) / maxLen >= need;
  }

  function escapeRe(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (a.length > 400 || b.length > 400) return Math.max(a.length, b.length);
    const row = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j += 1) row[j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      let prev = i - 1;
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const cur = row[j];
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
        prev = cur;
      }
    }
    return row[b.length];
  }

  function splitKeep(text) {
    return String(text).match(/[0-9A-Za-zА-Яа-яЁё]+|[^\s]|(\s+)/g) || [];
  }

  function isWord(part) {
    return /^[0-9A-Za-zА-Яа-яЁё]+$/.test(part);
  }

  function phraseWords(from, settings) {
    return fold(from, settings).split(" ").filter(Boolean);
  }

  function replaceOnce(text, from, to, settings) {
    const needles = phraseWords(from, settings);
    if (!needles.length) return text;
    const parts = splitKeep(text);
    const wordIdx = [];
    for (let i = 0; i < parts.length; i += 1) {
      if (isWord(parts[i])) wordIdx.push(i);
    }
    if (wordIdx.length < needles.length) return text;

    for (let w = 0; w <= wordIdx.length - needles.length; w += 1) {
      let ok = true;
      for (let k = 0; k < needles.length; k += 1) {
        if (!tokensSimilar(parts[wordIdx[w + k]], needles[k], settings)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      const start = wordIdx[w];
      const end = wordIdx[w + needles.length - 1];
      return parts.slice(0, start).join("") + to + parts.slice(end + 1).join("");
    }
    return text;
  }

  function replacePhrase(text, from, to, settings) {
    const c = cfg(settings);
    const limit = Math.min(80, Math.max(1, Number(c.maxPasses) || 40));
    let out = text;
    for (let i = 0; i < limit; i += 1) {
      const next = replaceOnce(out, from, to, c);
      if (next === out) return out;
      out = next;
    }
    return out;
  }

  function applyPairsToString(text, pairs) {
    let out = String(text ?? "");
    if (!out) return out;
    const sorted = [...(pairs || [])].sort(
      (a, b) => String(b.from || "").length - String(a.from || "").length
    );
    for (const pair of sorted) {
      const from = String(pair.from || "").trim();
      const to = pair.to == null ? "" : String(pair.to);
      if (!from) continue;
      if (out === to) continue;
      const settings = cfg(pair.match);
      if (pair.mode === "exact") {
        if (out.includes(from)) out = out.split(from).join(to);
        continue;
      }
      const next = replacePhrase(out, from, to, settings);
      if (next !== out) {
        out = next;
        continue;
      }
      const flex = new RegExp(
        phraseWords(from, settings).map(escapeRe).join("\\s+"),
        "gi"
      );
      if (phraseWords(from, settings).length && flex.test(out)) out = out.replace(flex, to);
    }
    return out;
  }

  root.TextReplaceMatch = {
    defaultConfig,
    defaultConfigs,
    presetId,
    fold,
    phonetic,
    stem,
    tokensSimilar,
    applyPairsToString,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
