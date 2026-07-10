// ============================================================
//   КОНСТАНТЫ И КЛЮЧИ ХРАНИЛИЩА
//   Единственное место, где заданы лимиты и имена ключей
//   localStorage — при изменении здесь меняется везде.
// ============================================================

export const API_URL = '/api/chat';

export const STORAGE_KEYS = {
  history: 'sasholom_chat_history',
  context: 'sasholom_context',
  uiLang: 'sasholom_ui_lang',
  notes: 'sasholom_notes',
  queryCount: 'sasholom_query_count',
  character: 'sasholom_character',
  provider: 'sasholom_provider',
  theme: 'sasholom_theme',
};

// Максимальная длина вопроса (символов) — синхронизировано
// с валидацией на сервере (api/chat.js) и maxlength в textarea.
export const MAX_QUESTION_LENGTH = 2000;

// Максимальный размер загружаемого фото до сжатия (байт).
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Сколько последних сообщений передаётся модели как контекст.
export const CONTEXT_MESSAGES = 10;

// Скорость «печати» ответа, мс на слово.
export const TYPEWRITER_SPEED = 30;

// Параметры сжатия фото перед отправкой.
export const IMAGE_COMPRESSION = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7,
};
