// ============================================================
//   ССЫЛКИ НА DOM-ЭЛЕМЕНТЫ
//   Все getElementById собраны здесь, чтобы остальные модули
//   не искали элементы по всему документу.
// ============================================================

const byId = (id) => document.getElementById(id);

export const el = {
  // Основной ввод и кнопки
  askBtn: byId('ai-ask-btn'),
  askInput: byId('ai-question'),
  chatHistory: byId('chat-history'),
  clearBtn: byId('clear-chat-btn'),

  // Переключатели темы и языка интерфейса
  themeToggle: byId('theme-toggle'),
  langToggle: byId('lang-toggle'),

  // Голосовой ввод
  voiceBtn: byId('voice-btn'),
  voiceLangBtn: byId('lang-btn'),

  // Фото и камера
  imageBtn: byId('image-btn'),
  imageInput: byId('image-input'),
  cameraBtn: byId('camera-btn'),
  previewDiv: byId('image-preview'),
  previewImg: byId('preview-img'),
  removePreviewBtn: byId('remove-preview'),

  // Файлы (PDF/TXT)
  fileBtn: byId('file-btn'),
  fileInput: byId('file-input'),

  // Инструменты чата
  exportBtn: byId('export-btn'),
  searchInput: byId('search-input'),
  counterSpan: byId('counter'),

  // Заметки о пользователе
  notesBtn: byId('notes-btn'),
  notesPanel: byId('notes-panel'),
  noteName: byId('note-name'),
  notePrefs: byId('note-prefs'),
  saveNotesBtn: byId('save-notes-btn'),

  // Выбор персонажа
  categorySelect: byId('category-select'),
  characterSelect: byId('character-select'),
  defaultCharBtn: byId('default-char-btn'),
};

// Перерисовать иконки Lucide (нужно после любой вставки <i data-lucide>).
export function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}
