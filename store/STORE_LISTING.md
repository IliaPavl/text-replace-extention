# Chrome Web Store listing (English)

Copy these fields into the Chrome Web Store developer dashboard.

## Title (max 45 characters)

Replace Similar Text

## Short description (max 132 characters)

Fix names and terms that auto-translate gets wrong. Replace similar spellings yourself—no AI. Data stays on your device.

## Category

Productivity

## Language

English (add Russian as an additional locale if you want)

## Single purpose

Replace user-defined names and phrases on web pages with the user’s own text, including close spellings.

## Detailed description

Replace Similar Text is for people who read books, novels, and web novels in the browser with automatic translation turned on.

Machine translation often mangles names, titles, and set phrases—especially when the source is Chinese. The same character can show up as Wei, Weia, Lian, or Lyan depending on the engine and the sentence. You should not have to send your reading list through another AI just to keep a name consistent.

This extension does one job: it finds the text you care about on the page and replaces it with the wording you chose.

How it works:

• Create folders (for example one per book) and add pairs: original → your text.
• Matching mode catches endings and close transliteration (Wei / Weia, Lian / Lyan).
• Exact mode replaces only the literal string.
• Auto-replace can run as the page loads, or you can scan the tab from that folder.
• Restore puts the page text back the way it was.
• Import and export JSON so you can share name lists for a book without sharing an account.

Nothing is sent to a cloud translator. Pairs and settings stay in chrome.storage.local on your device.

Permission note: the extension needs access to page text on sites you visit so replacements can run in the reader. It does not upload that text.

## Justification for “Read and change all your data on all websites”

Replacements must run on whatever site you use as a reader (web novel sites, translated book pages, docs). The extension only changes text according to pairs you created. It does not send page contents off the device.

## Support / privacy

Host store/privacy.html on a public URL and paste that URL into the Privacy policy field. Support: liveproger234@gmail.com (page: GitHub Pages support.html).

## Store images

All files are 24-bit PNG (RGB, no alpha) in `store/screenshots/`:

- Global screenshots (1280×800): `01-hero` … `05-import-privacy`
- Small promo (440×280): `promo-small-440x280.png`
- Marquee promo (1400×560): `promo-marquee-1400x560.png`

---

# Листинг Chrome Web Store (русский)

## Название (до 45 символов)

Замена похожего текста

## Краткое описание (до 132 символов)

Исправляет кривые автопереводы имён и названий. Подмена похожих написаний без ИИ. Данные только на этом устройстве.

## Категория

Продуктивность

## Язык

Русский

## Одно назначение

Подменяет на страницах заданные пользователем имена и фразы на его текст, в том числе похожие написания.

## Полное описание

«Замена похожего текста» — для тех, кто читает в браузере книги, новеллы и веб-новеллы с включённым автопереводом.

Машинный перевод часто ломает имена, названия и устойчивые обороты — особенно с китайского. Один и тот же персонаж может стать Wei, Weia, Lian или Lyan в зависимости от движка и предложения. Не нужно гонять список чтения через ещё один ИИ, чтобы имя оставалось одним и тем же.

Расширение делает одну вещь: находит на странице нужный текст и подменяет его на формулировку, которую вы задали.

Как это работает:

• Папки (например, по книге) и пары: исходник → ваш текст.
• Режим сопоставления ловит окончания и близкий транслит (Вэй / Вэя, Lian / Lyan).
• Точное совпадение меняет только буквальную строку.
• Автозамена может идти при загрузке страницы, либо сканирование вкладки из папки.
• «Как было» возвращает исходный текст страницы.
• Импорт и экспорт JSON, чтобы делиться списками имён к книге без аккаунта.

Ничего не уходит в облачный переводчик. Пары и настройки лежат в chrome.storage.local на вашем устройстве.

Доступ к тексту сайтов нужен, чтобы замены работали в ридере. Текст страницы никуда не загружается.

## Обоснование разрешения «Читать и изменять все данные на всех сайтах»

Замены должны работать на том сайте, где вы читаете (веб-новеллы, переведённые книги, документы). Расширение меняет только текст по вашим парам и не отправляет содержимое страницы с устройства.
