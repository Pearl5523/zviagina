import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()

app = Flask(__name__)

@app.get("/")
def home():
    # Serve the website from the same local server so the form can use /order.
    return send_from_directory(BASE_DIR, "index.html")

@app.post("/order")
def receive_order():
    if not BOT_TOKEN or not CHAT_ID:
        return jsonify({
            "success": False,
            "error": "Telegram is not configured. Fill in the .env file."
        }), 500

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Invalid form data."}), 400

    fields = {
        "Имя": str(data.get("firstName", "")).strip()[:100],
        "Телефон": str(data.get("phone", "")).strip()[:50],
        "Что хотят заказать": str(data.get("dessertType", "")).strip()[:150],
        "Количество / размер": str(data.get("quantity", "")).strip()[:200],
        "Желаемая дата": str(data.get("date", "")).strip()[:30],
        "Получение": str(data.get("deliveryMethod", "")).strip()[:100],
        "Вкус / начинка": str(data.get("flavor", "")).strip()[:200],
        "Примерный бюджет": str(data.get("budget", "")).strip()[:100],
        "Пожелания": str(data.get("about", "")).strip()[:1000],
    }

    required = ["Имя", "Телефон", "Что хотят заказать", "Количество / размер",
                "Желаемая дата", "Получение"]
    if any(not fields[name] for name in required):
        return jsonify({"success": False, "error": "Fill in all required fields."}), 400

    message = "🍰 Новая заявка — кондитерская «Звягина»\n\n" + "\n".join(
        f"{label}: {value or 'Не указано'}" for label, value in fields.items()
    )

    try:
        response = requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={"chat_id": CHAT_ID, "text": message},
            timeout=15,
        )
        response.raise_for_status()
        telegram_result = response.json()
        if not telegram_result.get("ok"):
            app.logger.error("Telegram API returned an unsuccessful response.")
            return jsonify({"success": False, "error": "Telegram could not deliver the message."}), 502
    except requests.RequestException:
        app.logger.exception("Could not send the order to Telegram.")
        return jsonify({"success": False, "error": "Could not connect to Telegram."}), 502

    return jsonify({"success": True})

if __name__ == "__main__":
    # Local-only server; it is not exposed to the internet.
    app.run(host="127.0.0.1", port=5000, debug=False)
