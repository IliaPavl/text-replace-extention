(function (root) {
  const BUILTIN = {
    ru: {
      label: "Русский",
      strings: {
        foldersTitle: "Папки",
        scanPage: "Сканировать страницу",
        scan: "Сканировать",
        foldersHint:
          "Каждая папка — свой набор замен. Пока папка открыта и автозамена включена, её пары применяются сами, в том числе после добавления и удаления. Кнопка «← Папки» выключает автозамену и возвращает исходный текст.",
        folderNamePlaceholder: "Название папки",
        createFolder: "Создать",
        noFolders: "Папок нет — создай первую.",
        pairsCount: "Пар: {{count}}",
        rename: "Переименовать",
        delete: "Удалить",
        renameFolderPrompt: "Название папки",
        deleteFolderConfirm: "Удалить папку «{{name}}» и все её пары?",
        exportData: "Выгрузить JSON",
        importData: "Импорт JSON",
        exportSettings: "Выгрузить настройки",
        importSettings: "Импорт настроек",
        language: "Язык интерфейса",
        storageInfo:
          "Где хранятся данные: <strong>chrome.storage.local</strong> этого расширения, не синхронизируются между устройствами и профилями.<br>Ключ: <code>{{key}}</code>. ID расширения: <code>{{id}}</code>.<br>Посмотреть: chrome://extensions → это расширение → «Проверить представление хранилища» или DevTools попапа → Application → Extension storage → Local.",
        backFolders: "← Папки",
        folderFallback: "Папка",
        sourceText: "Исходный текст",
        sourcePlaceholder: "Ли Кэ, Вэй, Лянь Хуа Ган",
        replacement: "Замена",
        replacementPlaceholder: "На что заменить",
        addPair: "Добавить пару",
        savePair: "Сохранить",
        cancel: "Отмена",
        noPairs: "Пар пока нет — добавь исходный текст и замену.",
        noSearchHits: "Ничего не найдено по этому запросу.",
        emptyReplacement: "(пусто)",
        edit: "Изменить",
        modeFuzzy: "Сопоставление",
        modeExact: "Точное совпадение",
        untitled: "Без названия",
        generalFolder: "Общее",
        importNoFolders: "В файле нет папок.",
        importDataConfirm: "OK — заменить все текущие данные. Отмена — дописать папки из файла к существующим.",
        importBadJson: "Не удалось прочитать JSON.",
        importSettingsOk: "Настройки обновлены.",
        importSettingsBad: "В файле нет настроек интерфейса или сопоставления.",
        importMatchOk: "Правила сопоставления обновлены.",
        howItWorks: "Как это работает",
        settingsSection: "Настройки",
        foldersIoTitle: "Импорт и экспорт",
        importReplace: "Импорт с заменой всего",
        importAppend: "Импорт без замены",
        exportAll: "Экспортировать всё",
        exportFolder: "Экспорт",
        importReplaceOk: "Данные заменены файлом.",
        importAppendOk: "Папки из файла добавлены.",
        settingsTitle: "Интерфейс",
        storageSummary: "Где хранятся данные",
        scanDone: "Страница просканирована",
        scanFail: "Не удалось применить на этой вкладке",
        restore: "Как было",
        restoreDone: "Вернули исходный текст",
        restoreFail: "Не удалось вернуть текст на этой вкладке",
        autoApply: "Автозамена",
        autoOff: "авто выкл",
        helpAuto:
          "Пока вы в этой папке, включённая автозамена держит на странице именно её пары. Новые и удалённые пары применяются сразу.\n\nВыключите переключатель — замены только по «Сканировать».\n\n«← Папки» выключает автозамену и возвращает исходный текст.\n\n«Как было» откатывает текущую вкладку, пока пары снова не изменятся или вы не нажмёте «Сканировать».",
        brand: "Замены",
        openFolder: "Открыть",
        searchPairs: "Поиск замен",
        searchPlaceholder: "Искать по тексту, замене и режиму",
        matchSettingsGlobal: "Сопоставление · {{lang}}",
        matchSettingsFolder: "Сопоставление этой папки",
        matchSettingsFolderHint: "Правила только для этой папки",
        matchInherit: "Брать общие правила",
        matchSimilarity: "Порог похожести",
        matchEndings: "Окончания",
        matchPhonetic: "Буквы и транслит",
        matchPrefixDiff: "Допуск по длине корня",
        matchPrefixMin: "Мин. длина для префикса",
        matchFuzzyMin: "Мин. длина для опечаток",
        matchStemMin: "Не резать короче",
        matchStemKeep: "Оставлять в корне не меньше",
        matchMaxPasses: "Проходов замены",
        matchYo: "ё считать как е",
        matchSoft: "Игнорировать ъ и ь",
        exportMatch: "Выгрузить правила",
        importMatch: "Импорт правил",
        helpAria: "Что это",
        helpMode:
          "Сопоставление находит похожие написания: окончания (Вэй / Вэя) и близкий транслит (Ли Кэ / Ли Ке).\n\nТочное совпадение меняет только буквальную подстроку, как ты её ввёл, без окончаний и фонетики.\n\nДля имён и склонений обычно нужно сопоставление; для кода, id и уникальных фраз — точное.",
        helpMatchGlobal:
          "Эти правила относятся к выбранному языку интерфейса. Переключи язык сверху, чтобы править русское или английское сопоставление.\n\nОни действуют для новых папок и для папок с «брать общие правила». Выгрузи JSON, чтобы поделиться алгоритмом.",
        helpMatchFolder:
          "Папка может наследовать общие правила или жить со своими.\n\nВыключи «брать общие», чтобы подкрутить алгоритм только здесь (в момент выключения копируются текущие общие). Включи обратно — снова общие, локальная копия не применяется.",
        helpSimilarity:
          "Насколько близки слова после фонетики, чтобы считать их одним. 0.82 ≈ отличие до ~18% букв.\n\nНиже — больше совпадений и больше ложных замен (кот / кит). Выше — строже, могут не схватиться варианты вроде Лиан / Лянь, если они далеки по буквам.",
        helpEndings:
          "Суффиксы, которые отбрасываются перед сравнением. «Вэя» и «Вэй» сходятся к одному корню.\n\nПиши через запятую или с новой строки. Длинные проверяются раньше коротких. Если режет слишком агрессивно — убери короткие вроде «а», «и», «о».",
        helpPhonetic:
          "Замены букв до сравнения, по одной в строке: что=на_что.\n\nэ=е делает «Кэ» ≈ «Ке». й$= убирает «й» только в конце слова. Строки с # — комментарии.\n\nПорядок важен: правила применяются сверху вниз.",
        helpPrefixDiff:
          "Если один корень начинается с другого, разница длин не больше этого числа — слова считаются одним («Лиан» / «Лянь» после фонетики).\n\n0 — префикс почти не сработает. 4–5 — мягче, но могут склеиться разные короткие имена.",
        helpPrefixMin:
          "Короче этой длины префиксное правило не включается. Защита от склейки «ли» и «лиан».",
        helpFuzzyMin:
          "Левенштейн (опечатки) сравнивает только слова не короче этого. Короткие имена лучше ловить окончаниями и фонетикой, иначе «ли» заденет случайные куски.",
        helpStemMin:
          "Слова короче этого не укорачивают окончаниями — целиком идут в сравнение.",
        helpStemKeep:
          "После снятия окончания в корне должно остаться не меньше стольких букв. Иначе «Вэй» может схлопнуться в пустышку.",
        helpMaxPasses:
          "Сколько раз подряд одна пара может сработать в одной строке. Больше — надёжнее на длинных абзацах, чуть медленнее.",
        helpYo:
          "Ё и Е считаются одной буквой. Для русских имён обычно включено.",
        helpSoft:
          "Ъ и Ь выкидываются до сравнения. «Вэй» и «Веи» ближе. Выключи, если твёрдый знак для тебя смысловой.",
        helpData:
          "Экспорт всего — папки, пары, язык и правила этой копии. В JSON есть подсказки после // — импорт их пропускает.\n\nИмпорт с заменой стирает текущие папки и ставит файл как есть.\nИмпорт без замены дописывает папки из файла (id новые). Если в файле есть словари или правила сопоставления по языкам — они подмешаются.\nЭкспорт у папки сохраняет только её.",
        helpUiSettings:
          "Файл настроек: язык интерфейса, свои словари перевода и общие правила сопоставления.\n\nИмпорт не удаляет папки. Можно прислать другу только «выгрузить правила» из блока сопоставления, если менять язык не нужно.",
        helpSearch:
          "Фильтр по исходному тексту, замене и названию режима (сопоставление / точное). Регистр не важен.",
        jsonCommentHeader:
          "Файл расширения «Замена похожего текста». Строки с // — подсказки, их можно не трогать: импорт их игнорирует.",
        jsonCommentType: "Тип файла: data / settings / match",
        jsonCommentVersion: "Версия формата",
        jsonCommentLocale: "Язык интерфейса",
        jsonCommentDictionaries: "Свои строки перевода интерфейса",
        jsonCommentMatchByLocale: "Правила сопоставления по языкам (ru, en, …)",
        jsonCommentMatchDefaults: "Копия правил для текущего языка (совместимость)",
        jsonCommentRu: "Русские окончания, фонетика (Кэ/Ке, Вэй/Вэя)",
        jsonCommentEn: "Английские суффиксы (ing, ed, s) и ise→ize",
        jsonCommentFolders: "Папки с парами замен",
        jsonCommentPairs: "Пары: from → to",
        jsonCommentMode: "fuzzy = сопоставление, exact = точная строка",
        jsonCommentAutoApply: "Применять пары, пока эта папка открыта",
        jsonCommentMatchInherit: "true = брать общие правила языка",
        jsonCommentMatch: "Свои правила папки, если inherit выключен",
        jsonCommentEndings: "Окончания, которые отбрасываются перед сравнением",
        jsonCommentPhonetic: "Замены букв до сравнения; end:true только в конце слова",
        jsonCommentSimilarity: "Порог похожести 0.5–1",
        jsonCommentYoToE: "Считать ё как е",
        jsonCommentStripSoft: "Игнорировать ъ и ь",
        jsonCommentPrefixMax: "Допуск разницы длин корня",
        jsonCommentPrefixMin: "Мин. длина для префиксного совпадения",
        jsonCommentFuzzyMin: "Мин. длина для опечаток",
        jsonCommentStemMin: "Короче этого окончания не снимать",
        jsonCommentStemKeep: "После снятия окончания столько букв оставить",
        jsonCommentMaxPasses: "Сколько раз пара может сработать в одной строке",
      },
    },
    en: {
      label: "English",
      strings: {
        foldersTitle: "Folders",
        scanPage: "Scan page",
        scan: "Scan",
        foldersHint:
          "Each folder has its own replacements. While a folder is open and auto-replace is on, its pairs apply by themselves, including after adds and deletes. Back to Folders turns auto-replace off and restores the original text.",
        folderNamePlaceholder: "Folder name",
        createFolder: "Create",
        noFolders: "No folders yet — create one.",
        pairsCount: "Pairs: {{count}}",
        rename: "Rename",
        delete: "Delete",
        renameFolderPrompt: "Folder name",
        deleteFolderConfirm: "Delete folder “{{name}}” and all its pairs?",
        exportData: "Export JSON",
        importData: "Import JSON",
        exportSettings: "Export settings",
        importSettings: "Import settings",
        language: "Interface language",
        storageInfo:
          "Data lives in this extension’s <strong>chrome.storage.local</strong> and is not synced across devices or profiles.<br>Key: <code>{{key}}</code>. Extension ID: <code>{{id}}</code>.<br>Inspect: chrome://extensions → this extension → “Inspect views / storage” or popup DevTools → Application → Extension storage → Local.",
        backFolders: "← Folders",
        folderFallback: "Folder",
        sourceText: "Original text",
        sourcePlaceholder: "Li Ke, Wei, Lian Hua Gang",
        replacement: "Replacement",
        replacementPlaceholder: "Replace with",
        addPair: "Add pair",
        savePair: "Save",
        cancel: "Cancel",
        noPairs: "No pairs yet — add original text and a replacement.",
        noSearchHits: "Nothing matches this search.",
        emptyReplacement: "(empty)",
        edit: "Edit",
        modeFuzzy: "Matching",
        modeExact: "Exact match",
        untitled: "Untitled",
        generalFolder: "General",
        importNoFolders: "The file has no folders.",
        importDataConfirm: "OK — replace all current data. Cancel — append folders from the file.",
        importBadJson: "Could not read JSON.",
        importSettingsOk: "Settings updated.",
        importSettingsBad: "The file has no interface or matching settings.",
        importMatchOk: "Matching rules updated.",
        howItWorks: "How it works",
        settingsSection: "Settings",
        foldersIoTitle: "Import and export",
        importReplace: "Import and replace all",
        importAppend: "Import without replacing",
        exportAll: "Export everything",
        exportFolder: "Export",
        importReplaceOk: "Data replaced from the file.",
        importAppendOk: "Folders from the file were added.",
        settingsTitle: "Interface",
        storageSummary: "Where data is stored",
        scanDone: "Page scanned",
        scanFail: "Could not apply on this tab",
        restore: "Restore",
        restoreDone: "Original text restored",
        restoreFail: "Could not restore text on this tab",
        autoApply: "Auto-replace",
        autoOff: "auto off",
        helpAuto:
          "While you are in this folder, auto-replace keeps this folder’s pairs on the page. Added and deleted pairs apply immediately.\n\nTurn the switch off to apply them only with Scan.\n\nBack to Folders turns auto-replace off and restores the original text.\n\nRestore rolls the current tab back until pairs change again or you press Scan.",
        brand: "Replace",
        openFolder: "Open",
        searchPairs: "Search replacements",
        searchPlaceholder: "Search original, replacement, and mode",
        matchSettingsGlobal: "Matching · {{lang}}",
        matchSettingsFolder: "This folder’s matching",
        matchSettingsFolderHint: "Rules for this folder only",
        matchInherit: "Use shared rules",
        matchSimilarity: "Similarity threshold",
        matchEndings: "Endings",
        matchPhonetic: "Letters and translit",
        matchPrefixDiff: "Stem length slack",
        matchPrefixMin: "Min length for prefix",
        matchFuzzyMin: "Min length for typos",
        matchStemMin: "Do not stem shorter than",
        matchStemKeep: "Keep at least this in the stem",
        matchMaxPasses: "Replace passes",
        matchYo: "Treat ё as е",
        matchSoft: "Ignore ъ and ь",
        exportMatch: "Export rules",
        importMatch: "Import rules",
        helpAria: "What is this",
        helpMode:
          "Matching finds close spellings: endings (Wei / Weya) and near transliteration (Li Ke / Li Ke).\n\nExact match replaces only the literal substring you typed — no endings, no phonetics.\n\nUse matching for names and inflections; exact for ids, code, and unique phrases.",
        helpMatchGlobal:
          "These rules belong to the current interface language. Switch the language at the top to edit English vs Russian matching.\n\nThey apply to new folders and folders that “use shared rules”. Export JSON to share the algorithm.",
        helpMatchFolder:
          "A folder can inherit the shared rules or keep its own.\n\nTurn off “use shared rules” to tune only this folder (the current shared rules are copied at that moment). Turn it back on to follow the global set again.",
        helpSimilarity:
          "How close two words must be after phonetics. 0.82 ≈ up to ~18% different letters.\n\nLower = more hits and more false positives. Higher = stricter; some Lian / Lyan pairs may miss if they differ a lot in letters.",
        helpEndings:
          "Suffixes stripped before compare. “Weya” and “Wei” collapse to one stem.\n\nComma or newline separated. Longer endings are tried first. If it over-stems, remove short ones like “a” / “i”.",
        helpPhonetic:
          "Letter rewrites before compare, one per line: from=to.\n\nэ=е makes “Кэ” ≈ “Ке”. й$= drops “й” only at the end of a word. Lines starting with # are comments.\n\nOrder matters: rules run top to bottom.",
        helpPrefixDiff:
          "If one stem starts with the other, they match when the length gap is at most this number.\n\n0 almost disables prefix matching. 4–5 is looser and may glue short distinct names.",
        helpPrefixMin:
          "Prefix matching ignores stems shorter than this, so “li” does not swallow “lian”.",
        helpFuzzyMin:
          "Levenshtein (typos) only runs on words at least this long. Short names are better caught by endings and phonetics.",
        helpStemMin:
          "Words shorter than this are not stripped of endings; they compare as a whole.",
        helpStemKeep:
          "After stripping an ending, at least this many letters must remain. Otherwise a short name can collapse to almost nothing.",
        helpMaxPasses:
          "How many times one pair may fire inside a single string. Higher is safer on long paragraphs, a bit slower.",
        helpYo:
          "Ё and Е count as the same letter. Usually on for Russian names.",
        helpSoft:
          "Ъ and Ь are dropped before compare. Turn off if the hard sign is meaningful for you.",
        helpData:
          "Export everything — folders, pairs, language, and rules of this copy. JSON includes // hints; import skips them.\n\nImport and replace wipes current folders and loads the file as-is.\nImport without replacing appends folders (new ids). Dictionaries and per-language matching rules in the file are merged.\nA folder’s Export saves only that folder.",
        helpUiSettings:
          "Settings file: UI language, custom translation packs, and shared matching rules.\n\nImport does not delete folders. Use “export rules” in the matching block if you only want to share the algorithm.",
        helpSearch:
          "Filters by original text, replacement, and mode name. Case does not matter.",
        jsonCommentHeader:
          "File for the Similar Text Replace extension. Lines starting with // are hints; import ignores them.",
        jsonCommentType: "File kind: data / settings / match",
        jsonCommentVersion: "Format version",
        jsonCommentLocale: "Interface language",
        jsonCommentDictionaries: "Custom UI translation strings",
        jsonCommentMatchByLocale: "Matching rules per language (ru, en, …)",
        jsonCommentMatchDefaults: "Copy of rules for the current language (compat)",
        jsonCommentRu: "Russian endings and phonetics (Ke/Ke, Wei/Weya)",
        jsonCommentEn: "English suffixes (ing, ed, s) and ise→ize",
        jsonCommentFolders: "Folders with replacement pairs",
        jsonCommentPairs: "Pairs: from → to",
        jsonCommentMode: "fuzzy = matching, exact = literal string",
        jsonCommentAutoApply: "Apply pairs while this folder is open",
        jsonCommentMatchInherit: "true = use shared rules for the current language",
        jsonCommentMatch: "Folder-specific rules if inherit is off",
        jsonCommentEndings: "Suffixes stripped before compare",
        jsonCommentPhonetic: "Letter rewrites before compare; end:true only at word end",
        jsonCommentSimilarity: "Similarity threshold 0.5–1",
        jsonCommentYoToE: "Treat ё as е",
        jsonCommentStripSoft: "Ignore ъ and ь",
        jsonCommentPrefixMax: "Allowed stem length gap",
        jsonCommentPrefixMin: "Min length for prefix matching",
        jsonCommentFuzzyMin: "Min length for typo matching",
        jsonCommentStemMin: "Do not strip endings from shorter words",
        jsonCommentStemKeep: "Letters to keep after stripping an ending",
        jsonCommentMaxPasses: "How many times a pair may fire in one string",
      },
    },
  };

  function interpolate(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] == null ? "" : String(vars[k])));
  }

  function builtinIds() {
    return Object.keys(BUILTIN);
  }

  function mergedStrings(dictionaries, locale) {
    const extra = dictionaries && dictionaries[locale];
    return {
      ...(BUILTIN.ru?.strings || {}),
      ...(BUILTIN.en?.strings || {}),
      ...(BUILTIN[locale]?.strings || {}),
      ...(extra && extra.strings ? extra.strings : extra && typeof extra === "object" && !extra.strings ? extra : {}),
    };
  }

  function languageLabel(dictionaries, locale) {
    if (dictionaries?.[locale]?.label) return dictionaries[locale].label;
    if (BUILTIN[locale]?.label) return BUILTIN[locale].label;
    return locale;
  }

  function listLocales(dictionaries) {
    const ids = new Set([...builtinIds(), ...Object.keys(dictionaries || {})]);
    return [...ids];
  }

  function translate(dictionaries, locale, key, vars) {
    const pack = mergedStrings(dictionaries, locale);
    return interpolate(pack[key] || key, vars);
  }

  root.TextReplaceI18n = {
    BUILTIN,
    builtinIds,
    mergedStrings,
    languageLabel,
    listLocales,
    translate,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
