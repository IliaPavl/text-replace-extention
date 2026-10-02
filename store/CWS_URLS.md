# URL для Chrome Web Store

Ссылки вида `github.com/.../blob/main/store/privacy.html` кабинет **не принимает**: это страница GitHub, не отдельный сайт политики.

После пуша папок `docs/` и `.github/workflows/pages.yml` в репозиторий:

1. GitHub → репозиторий → **Settings → Pages**
2. Source: **GitHub Actions**
3. Подожди минуту, пока workflow *GitHub Pages* станет зелёным
4. Проверь в обычном браузере (без VPN-логина), что страницы открываются

Затем в кабинете Chrome:

- Главная: https://iliapavl.github.io/text-replace-extention/
- Политика конфиденциальности: https://iliapavl.github.io/text-replace-extention/privacy.html
- Служба поддержки: https://iliapavl.github.io/text-replace-extention/support.html

Пока Pages не включён, эти адреса будут 404 — кабинет снова напишет «URL недоступен».
