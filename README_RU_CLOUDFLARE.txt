КОНДИТЕРСКАЯ «ЗВЯГИНА» — ВЕРСИЯ ДЛЯ GITHUB + CLOUDFLARE PAGES

Что находится в архиве:
- index.html — сайт, сохранён существующий дизайн и форма;
- functions/api/order.js — серверная функция Cloudflare Pages, принимает POST /api/order и отправляет заявку в Telegram.

1. Загрузить проект на GitHub
- Создай репозиторий на GitHub.
- Распакуй архив и загрузи index.html и папку functions в корень репозитория.
- В корне репозитория должны лежать index.html и functions/api/order.js.

2. Подключить Cloudflare Pages к GitHub
- В Cloudflare открой Workers & Pages → Create → Pages → Connect to Git.
- Выбери GitHub и нужный репозиторий.
- Для обычного статического HTML оставь Build command пустой.
- Build output directory укажи: . (корень репозитория)
- Запусти Deploy.

3. Добавить настройки Telegram в Cloudflare
- Открой созданный Pages-проект → Settings → Variables and Secrets.
- Добавь TELEGRAM_BOT_TOKEN как Secret (секретное значение).
- Добавь TELEGRAM_CHAT_ID как обычную переменную или Secret.
- Сохрани изменения и сделай Redeploy (повторное развертывание).

4. Подготовить Telegram
- Создай бота через @BotFather и скопируй токен.
- Открой своего бота и нажми Start.
- Узнай свой числовой chat ID через @userinfobot.
- Внеси токен и ID в настройки Cloudflare, НЕ в index.html и НЕ в GitHub.

5. Проверка
- Открой опубликованный сайт.
- Заполни форму тестовыми данными и отправь.
- Заявка должна прийти в Telegram-чат, указанный в TELEGRAM_CHAT_ID.

ВАЖНО
- Не публикуй токен бота в GitHub, HTML или сообщениях.
- Если токен уже попадал в публичный репозиторий или кому-либо отправлялся, отзови его через BotFather и выпусти новый.
- Функция доступна по адресу /api/order и автоматически разворачивается Cloudflare Pages из папки functions.
- Python, Flask и requirements.txt для этой версии не нужны.
