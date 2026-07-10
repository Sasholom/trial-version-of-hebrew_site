// ============================================================
//   ЗАПРОСЫ К СЕРВЕРУ
//   Единственная точка общения с бэкендом (api/chat.js).
// ============================================================

import { API_URL } from './config.js';

/**
 * Отправить вопрос AI.
 * @param {Object} payload
 * @param {string} [payload.question]      Текст вопроса
 * @param {Array}  [payload.history]       Контекст [{ role, content }]
 * @param {string} [payload.systemPrompt]  Системный промпт персонажа
 * @param {string} [payload.provider]      'chadgpt' | 'gemini'
 * @param {string} [payload.image]         base64 фото (data URL)
 * @returns {Promise<{answer?: string, error?: string}>}
 * @throws при сетевой ошибке (нет соединения, сервер недоступен)
 */
export async function askServer(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
