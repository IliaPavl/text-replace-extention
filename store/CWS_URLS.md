# Почему 404 и что нажать

Сайт ещё не опубликован. Репозиторий есть, папка `docs/` есть, но GitHub Pages выключен (API `/pages` отвечает 404). Пока так, `*.github.io/...` всегда будет «There isn't a GitHub Pages site here».

## Включить сайт (без GitHub Actions)

1. Открой https://github.com/IliaPavl/text-replace-extention/settings/pages  
   (нужен вход владельцем репозитория.)
2. **Build and deployment → Source** выбери **Deploy from a branch** (не GitHub Actions).
3. Branch: **main**, папка: **/docs**.
4. Save.
5. Подожди 1–3 минуты. На той же странице Settings → Pages появится зелёная плашка с адресом.

Готовый адрес проекта (с именем репозитория в конце):

- Главная: https://iliapavl.github.io/text-replace-extention/
- Политика: https://iliapavl.github.io/text-replace-extention/privacy.html
- Поддержка: https://iliapavl.github.io/text-replace-extention/support.html
  (на странице только почта: liveproger234@gmail.com)

В кабинете Chrome, если есть отдельное поле email поддержки, тоже: liveproger234@gmail.com.
Поле «Support URL» всё равно должно быть HTTPS-страницей, не mailto.

Проверь их в обычном браузере. Если снова 404 — либо прошло меньше минуты, либо открыт адрес без `/text-replace-extention/` (это уже другой сайт).

Потом эти три URL вставь в кабинет Chrome.
