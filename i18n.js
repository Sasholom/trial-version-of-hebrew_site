// ============================================================
//   ЛОКАЛИЗАЦИЯ (русский / English / עברית)
//
//   Как это работает:
//   - Статичные тексты в index.html помечены атрибутами
//     data-i18n / data-i18n-placeholder / data-i18n-title —
//     applyLanguage() проставляет их автоматически.
//   - Динамические тексты берутся через t('ключ').
//   - Для иврита включается направление письма RTL.
//
//   Чтобы добавить язык: добавь объект в translations,
//   код языка в LANGS и подпись в LANG_LABELS.
// ============================================================

import { state } from './state.js';
import { saveSetting } from './storage.js';
import { el } from './dom.js';

export const LANGS = ['ru', 'en', 'he'];

const LANG_LABELS = { ru: '🇷🇺 RU', en: '🇺🇸 EN', he: '🇮🇱 HE' };

// Язык озвучки ответов (SpeechSynthesis) для каждого языка интерфейса.
export const SPEECH_LANGS = { ru: 'ru-RU', en: 'en-US', he: 'he-IL' };

export const translations = {
  ru: {
    title: '🚀 SaSholom',
    cardTitle: '🧠 Hebrew AI',
    placeholder: 'Задай любой вопрос...',
    photoPlaceholder: '📷 Фото загружено. Можно добавить вопрос...',
    askBtn: 'Спросить 💬',
    clearBtn: '🗑️ Очистить',
    welcome: 'Привет! Выбери персонажа или просто спроси 😎',
    thinking: 'Думаю...',
    longMsg: '⚠️ Сообщение слишком длинное (макс. 2000 символов)',
    serverError: '❌ Не могу соединиться с сервером. Проверь интернет и попробуй снова.',
    clearConfirm: 'Точно удалить всю историю чата? 🗑️',
    voiceError: '❌ Ошибка распознавания речи. Попробуй ещё раз.',
    voiceUnsupported: '🎤 Голосовой ввод не поддерживается в твоём браузере. Попробуй Chrome.',
    imageTooLarge: '⚠️ Фото слишком большое (макс. 10MB)',
    imageReadError: '❌ Ошибка чтения файла',
    photoQuestion: '📷 Что изображено на этом фото?',
    withPhoto: ' (с фото)',
    cameraShoot: 'Снять',
    cameraClose: 'Закрыть',
    cameraError: '❌ Нет доступа к камере',
    pdfLoaded: '📄 Текст из PDF загружен в поле ввода (первые 2000 символов)',
    fileUnsupported: '⚠️ Поддерживаются только файлы PDF и TXT',
    shareUnsupported: 'Поделиться доступно на мобильных устройствах. Используй кнопку копирования 😉',
    notesSaved: 'Заметки сохранены! ✓',
    allCategories: 'Все категории',
    choosePersona: 'Выберите персонажа',
    defaultMode: '💬 Обычный',
    exportBtn: 'Экспорт',
    searchPlaceholder: 'Поиск...',
    counterLabel: 'Запросов',
    notesBtn: 'Заметки',
    notesName: 'Имя:',
    notesPrefs: 'Предпочтения:',
    notesSave: 'Сохранить',
    exportYou: 'Вы',
    exportAI: 'AI',
    copyTitle: 'Копировать',
    shareTitle: 'Поделиться',
    speakTitle: 'Озвучить',
    voiceTitle: 'Голосовой ввод',
    voiceLangTitle: 'Язык распознавания речи',
    imageTitle: 'Загрузить фото',
    cameraTitle: 'Сделать снимок',
    fileTitle: 'Загрузить файл (PDF/TXT)',
    themeTitle: 'Сменить тему',
    langTitle: 'Сменить язык',
    // Инструкция модели: на каком языке отвечать
    replyLangHint: 'Отвечай на том языке, на котором пишет пользователь.',
  },

  en: {
    title: '🚀 SaSholom',
    cardTitle: '🧠 Hebrew AI',
    placeholder: 'Ask any question...',
    photoPlaceholder: '📷 Photo uploaded. You can add a question...',
    askBtn: 'Ask 💬',
    clearBtn: '🗑️ Clear',
    welcome: 'Hello! Choose a character or just ask 😎',
    thinking: 'Thinking...',
    longMsg: '⚠️ Message too long (max 2000 characters)',
    serverError: '❌ Cannot connect to the server. Check your internet and try again.',
    clearConfirm: 'Really delete the entire chat history? 🗑️',
    voiceError: '❌ Speech recognition error. Please try again.',
    voiceUnsupported: '🎤 Voice input is not supported in your browser. Try Chrome.',
    imageTooLarge: '⚠️ Image too large (max 10MB)',
    imageReadError: '❌ File read error',
    photoQuestion: '📷 What is in this photo?',
    withPhoto: ' (with photo)',
    cameraShoot: 'Capture',
    cameraClose: 'Close',
    cameraError: '❌ No camera access',
    pdfLoaded: '📄 PDF text loaded into the input field (first 2000 characters)',
    fileUnsupported: '⚠️ Only PDF and TXT files are supported',
    shareUnsupported: 'Sharing is available on mobile devices. Use the copy button instead 😉',
    notesSaved: 'Notes saved! ✓',
    allCategories: 'All categories',
    choosePersona: 'Choose a character',
    defaultMode: '💬 Default',
    exportBtn: 'Export',
    searchPlaceholder: 'Search...',
    counterLabel: 'Requests',
    notesBtn: 'Notes',
    notesName: 'Name:',
    notesPrefs: 'Preferences:',
    notesSave: 'Save',
    exportYou: 'You',
    exportAI: 'AI',
    copyTitle: 'Copy',
    shareTitle: 'Share',
    speakTitle: 'Read aloud',
    voiceTitle: 'Voice input',
    voiceLangTitle: 'Speech recognition language',
    imageTitle: 'Upload photo',
    cameraTitle: 'Take a photo',
    fileTitle: 'Upload file (PDF/TXT)',
    themeTitle: 'Switch theme',
    langTitle: 'Switch language',
    replyLangHint: 'Reply in the language the user writes in.',
  },

  he: {
    title: '🚀 SaSholom',
    cardTitle: '🧠 Hebrew AI',
    placeholder: 'שאל כל שאלה...',
    photoPlaceholder: '📷 התמונה הועלתה. אפשר להוסיף שאלה...',
    askBtn: 'שאל 💬',
    clearBtn: '🗑️ נקה',
    welcome: 'שלום! בחר דמות או פשוט שאל 😎',
    thinking: 'חושב...',
    longMsg: '⚠️ ההודעה ארוכה מדי (מקסימום 2000 תווים)',
    serverError: '❌ לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב.',
    clearConfirm: 'בטוח למחוק את כל ההיסטוריה? 🗑️',
    voiceError: '❌ שגיאת זיהוי דיבור. נסה שוב.',
    voiceUnsupported: '🎤 קלט קולי לא נתמך בדפדפן שלך. נסה Chrome.',
    imageTooLarge: '⚠️ התמונה גדולה מדי (מקסימום 10MB)',
    imageReadError: '❌ שגיאת קריאת קובץ',
    photoQuestion: '📷 מה מופיע בתמונה הזו?',
    withPhoto: ' (עם תמונה)',
    cameraShoot: 'צלם',
    cameraClose: 'סגור',
    cameraError: '❌ אין גישה למצלמה',
    pdfLoaded: '📄 הטקסט מה-PDF נטען לשדה הקלט (2000 התווים הראשונים)',
    fileUnsupported: '⚠️ נתמכים רק קבצי PDF ו-TXT',
    shareUnsupported: 'שיתוף זמין במכשירים ניידים. השתמש בכפתור ההעתקה 😉',
    notesSaved: 'ההערות נשמרו! ✓',
    allCategories: 'כל הקטגוריות',
    choosePersona: 'בחר דמות',
    defaultMode: '💬 רגיל',
    exportBtn: 'ייצוא',
    searchPlaceholder: 'חיפוש...',
    counterLabel: 'בקשות',
    notesBtn: 'הערות',
    notesName: 'שם:',
    notesPrefs: 'העדפות:',
    notesSave: 'שמור',
    exportYou: 'אתה',
    exportAI: 'AI',
    copyTitle: 'העתק',
    shareTitle: 'שתף',
    speakTitle: 'הקרא',
    voiceTitle: 'קלט קולי',
    voiceLangTitle: 'שפת זיהוי דיבור',
    imageTitle: 'העלה תמונה',
    cameraTitle: 'צלם תמונה',
    fileTitle: 'העלה קובץ (PDF/TXT)',
    themeTitle: 'החלף ערכת נושא',
    langTitle: 'החלף שפה',
    replyLangHint: 'ענה בשפה שבה כותב המשתמש.',
  },
};

// Отображаемые названия категорий персонажей.
// Ключи — категории из characters.js (данные хранятся на русском).
export const categoryNames = {
  ru: null, // null = показывать как есть
  en: {
    'Бизнес и продуктивность': 'Business & Productivity',
    'Творчество': 'Creativity',
    'Технологии и разработка': 'Tech & Development',
    'Образование и саморазвитие': 'Education & Self-Growth',
    'Здоровье и психология': 'Health & Psychology',
    'Дом и быт': 'Home & Everyday Life',
    'Финансы': 'Finance',
    'Путешествия': 'Travel',
    'Развлечения и хобби': 'Fun & Hobbies',
    'Другое': 'Other',
  },
  he: {
    'Бизнес и продуктивность': 'עסקים ופרודוקטיביות',
    'Творчество': 'יצירתיות',
    'Технологии и разработка': 'טכנולוגיה ופיתוח',
    'Образование и саморазвитие': 'חינוך והתפתחות אישית',
    'Здоровье и психология': 'בריאות ופסיכולוגיה',
    'Дом и быт': 'בית ויומיום',
    'Финансы': 'כספים',
    'Путешествия': 'טיולים',
    'Развлечения и хобби': 'בילוי ותחביבים',
    'Другое': 'אחר',
  },
};

// Перевод по ключу для текущего языка.
export function t(key) {
  return translations[state.uiLang]?.[key] ?? translations.ru[key] ?? key;
}

// Отображаемое имя категории для текущего языка.
export function categoryName(category) {
  return categoryNames[state.uiLang]?.[category] ?? category;
}

// Применить язык ко всем статичным элементам страницы.
// Динамические списки (категории, счётчик) обновляет вызывающая
// сторона — см. setLanguage() в main.js.
export function applyLanguage(lang) {
  state.uiLang = lang;
  const dict = translations[lang];

  document.title = dict.title;
  document.documentElement.lang = lang;
  // Для иврита — направление письма справа налево
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    if (dict[node.dataset.i18n] != null) node.textContent = dict[node.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    if (dict[node.dataset.i18nPlaceholder] != null) node.placeholder = dict[node.dataset.i18nPlaceholder];
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    if (dict[node.dataset.i18nTitle] != null) node.title = dict[node.dataset.i18nTitle];
  });

  // Плейсхолдер зависит от того, прикреплено ли фото
  el.askInput.placeholder = state.selectedImage ? dict.photoPlaceholder : dict.placeholder;
  el.langToggle.textContent = LANG_LABELS[lang];

  saveSetting('uiLang', lang);
}
