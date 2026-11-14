const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const clean = (value, maxLength) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export async function onRequestPost({ request, env }) {
  // The form and this endpoint should be served from the same site.
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return json({ success: false, error: "Недопустимый источник запроса." }, 403);
      }
    } catch {
      return json({ success: false, error: "Некорректный источник запроса." }, 403);
    }
  }

  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ success: false, error: "Ожидались данные формы в формате JSON." }, 415);
  }

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ success: false, error: "На сайте ещё не настроена отправка в Telegram." }, 500);
  }

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 10000) {
      return json({ success: false, error: "Слишком большой запрос." }, 413);
    }
    data = JSON.parse(raw);
  } catch {
    return json({ success: false, error: "Не удалось прочитать данные формы." }, 400);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return json({ success: false, error: "Некорректные данные формы." }, 400);
  }

  const fields = {
    "Имя": clean(data.firstName, 100),
    "Телефон": clean(data.phone, 50),
    "Что хотят заказать": clean(data.dessertType, 150),
    "Количество / размер": clean(data.quantity, 200),
    "Желаемая дата": clean(data.date, 30),
    "Получение": clean(data.deliveryMethod, 100),
    "Вкус / начинка": clean(data.flavor, 200),
    "Примерный бюджет": clean(data.budget, 100),
    "Пожелания": clean(data.about, 1000),
  };

  const required = [
    "Имя",
    "Телефон",
    "Что хотят заказать",
    "Количество / размер",
    "Желаемая дата",
    "Получение",
  ];
  if (required.some((key) => !fields[key])) {
    return json({ success: false, error: "Заполни все обязательные поля." }, 400);
  }

  const message =
    "🍰 Новая заявка — кондитерская «Звягина»\n\n" +
    Object.entries(fields)
      .map(([label, value]) => `${label}: ${value || "Не указано"}`)
      .join("\n");

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    const result = await telegramResponse.json();
    if (!telegramResponse.ok || !result.ok) {
      return json(
        { success: false, error: "Telegram не принял заявку. Попробуй позже." },
        502
      );
    }

    return json({ success: true });
  } catch {
    return json(
      { success: false, error: "Не удалось связаться с Telegram. Попробуй позже." },
      502
    );
  }
}
