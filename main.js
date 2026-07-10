// ============================================================
//   ТОЧКА ВХОДА
//   Связывает модули: инициализация, обработчики событий
//   и главный сценарий «вопрос → ответ» (askAI).
//
//   Карта модулей:
//   config.js     — константы и ключи хранилища
//   state.js      — общее состояние
//   dom.js        — ссылки на элементы
//   i18n.js       — переводы (ru/en/he)
//   characters.js — библиотека из 100 персонажей
//   storage.js    — localStorage
//   api.js        — запрос к серверу
//   chat.js       — рендер сообщений, история, экспорт, поиск
//   media.js      — фото, камера, PDF/TXT
//   voice.js      — распознавание речи и озвучка
// ============================================================

import { MAX_QUESTION_LENGTH } from './config.js';
import { state } from './state.js';
import { el, refreshIcons } from './dom.js';
import { LANGS, t, categoryName, applyLanguage } from './i18n.js';
import { characters, categories, findCharacter } from './characters.js';
import {
  getContext, saveContext, getNotes, saveNotes,
  getQueryCount, saveQueryCount, getSetting, saveSetting, clearHistoryData,
} from './storage.js';
import { askServer } from './api.js';
import {
  addMessage, typewriterEffect, renderMarkdown,
  loadHistory, saveHistory, exportHistory, filterMessages,
} from './chat.js';
import { initMedia, resetImageState } from './media.js';
import { initVoice, toggleListening, switchVoiceLang } from './voice.js';

// ============================================================
//   ГЛАВНЫЙ СЦЕНАРИЙ: ОТПРАВКА ВОПРОСА
// ============================================================

async function askAI() {
  const question = el.askInput.value.trim();
  if (!question && !state.selectedImage) return;
  if (question.length > MAX_QUESTION_LENGTH) {
    addMessage(t('longMsg'), 'ai');
    return;
  }

  // Сообщение пользователя в ленте
  const image = state.selectedImage;
  const userText = image
    ? (question ? question + t('withPhoto') : t('photoQuestion'))
    : question;
  addMessage(userText, 'user');
  el.askInput.value = '';

  // Индикатор «Думаю...» (не сохраняется в историю)
  const thinking = addMessage(t('thinking'), 'ai', false);
  thinking.classList.add('thinking');
  el.askBtn.disabled = true;

  const context = getContext();

  try {
    const data = await askServer({
      // Если отправлено только фото — задаём нейтральный вопрос
      // на языке пользователя
      question: question || (image ? t('photoQuestion') : undefined),
      history: context,
      systemPrompt: buildSystemPrompt(),
      provider: state.provider,
      image: image || undefined,
    });

    thinking.remove();
    resetImageState();

    const answer = data.answer || data.error || t('serverError');
    const aiMsg = addMessage('', 'ai', false);
    const bubble = aiMsg.querySelector('.bubble');

    // Печатаем ответ по словам, затем заменяем на полноценный markdown
    typewriterEffect(bubble, answer, () => {
      bubble.innerHTML = renderMarkdown(answer);
      bubble.setAttribute('data-raw', answer);
      saveHistory();
      refreshIcons();

      context.push({ role: 'user', content: question || t('photoQuestion') });
      context.push({ role: 'assistant', content: answer });
      saveContext(context);

      state.queryCount++;
      saveQueryCount(state.queryCount);
      updateCounter();
    });
  } catch {
    thinking.remove();
    resetImageState();
    addMessage(t('serverError'), 'ai');
  } finally {
    el.askBtn.disabled = false;
    refreshIcons();
  }
}

// Системный промпт: персонаж + заметки о пользователе + язык ответа.
function buildSystemPrompt() {
  const base = state.character
    ? state.character.prompt
    : 'Ты — дружелюбный помощник SaSholom AI. Отвечай кратко, с юмором.';
  const notes = getNotes();
  const notesPart = (notes.name || notes.prefs)
    ? `[Информация о пользователе] Имя: ${notes.name || 'неизвестно'}. Предпочтения: ${notes.prefs || 'нет'}.`
    : '';
  return [base, notesPart, t('replyLangHint')].filter(Boolean).join(' ');
}

// ============================================================
//   ПЕРСОНАЖИ: СЕЛЕКТЫ КАТЕГОРИИ И ПЕРСОНАЖА
// ============================================================

function populateCategories() {
  const current = el.categorySelect.value;
  el.categorySelect.innerHTML = '';
  el.categorySelect.append(new Option(t('allCategories'), ''));
  categories.forEach((cat) => el.categorySelect.append(new Option(categoryName(cat), cat)));
  el.categorySelect.value = current || '';
}

function populateCharacters() {
  const category = el.categorySelect.value;
  const currentName = state.character?.name || '';
  el.characterSelect.innerHTML = '';
  el.characterSelect.append(new Option(t('choosePersona'), ''));

  const list = category ? characters.filter((c) => c.category === category) : characters;
  list.forEach((c) => {
    const opt = new Option(c.name, c.name);
    opt.title = c.description; // описание — во всплывающей подсказке
    el.characterSelect.append(opt);
  });
  el.characterSelect.disabled = false;

  // Сохраняем выбор, если персонаж есть в отфильтрованном списке
  el.characterSelect.value = list.some((c) => c.name === currentName) ? currentName : '';
}

function selectCharacter(name) {
  state.character = findCharacter(name);
  el.defaultCharBtn.classList.toggle('active', !state.character);
  saveSetting('character', name || 'default');
}

// ============================================================
//   ТЕМА И ЯЗЫК
// ============================================================

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  saveSetting('theme', theme);
  el.themeToggle.textContent = theme === 'light' ? '☀️' : '🌓';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// Смена языка: статичные тексты + динамические списки и счётчик.
function setLanguage(lang) {
  applyLanguage(lang);
  populateCategories();
  populateCharacters();
  updateCounter();
  refreshIcons();
}

function updateCounter() {
  el.counterSpan.textContent = `${t('counterLabel')}: ${state.queryCount}`;
}

// ============================================================
//   ОЧИСТКА ЧАТА И ЗАМЕТКИ
// ============================================================

function clearChat() {
  if (!confirm(t('clearConfirm'))) return;
  clearHistoryData();
  el.chatHistory.innerHTML = '';
  addMessage(t('welcome'), 'ai', false);
}

function toggleNotesPanel() {
  const isHidden = el.notesPanel.style.display === 'none';
  el.notesPanel.style.display = isHidden ? 'block' : 'none';
}

function handleSaveNotes() {
  saveNotes({ name: el.noteName.value, prefs: el.notePrefs.value });
  el.notesPanel.style.display = 'none';
  addMessage(t('notesSaved'), 'ai');
}

// ============================================================
//   ПОДПИСКА НА СОБЫТИЯ
// ============================================================

el.askBtn.addEventListener('click', askAI);
el.askInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    askAI();
  }
});
el.clearBtn.addEventListener('click', clearChat);

el.themeToggle.addEventListener('click', toggleTheme);
el.langToggle.addEventListener('click', () => {
  const next = LANGS[(LANGS.indexOf(state.uiLang) + 1) % LANGS.length];
  setLanguage(next);
});

el.voiceBtn.addEventListener('click', toggleListening);
el.voiceLangBtn.addEventListener('click', switchVoiceLang);

document.querySelectorAll('.provider-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.provider = btn.dataset.provider;
    document.querySelectorAll('.provider-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    saveSetting('provider', state.provider);
  });
});

el.categorySelect.addEventListener('change', populateCharacters);
el.characterSelect.addEventListener('change', (e) => selectCharacter(e.target.value));
el.defaultCharBtn.addEventListener('click', () => {
  selectCharacter('');
  el.characterSelect.value = '';
});

el.exportBtn.addEventListener('click', exportHistory);
el.searchInput.addEventListener('input', (e) => filterMessages(e.target.value));
el.notesBtn.addEventListener('click', toggleNotesPanel);
el.saveNotesBtn.addEventListener('click', handleSaveNotes);

// ============================================================
//   ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
  // Тема и провайдер
  setTheme(getSetting('theme', 'dark'));
  state.provider = getSetting('provider', 'chadgpt');
  document.querySelectorAll('.provider-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.provider === state.provider);
  });

  // Голос, медиа, заметки
  initVoice({
    onTranscript: (text) => {
      el.askInput.value = text;
      askAI();
    },
    onError: () => addMessage(t('voiceError'), 'ai'),
    onUnsupported: () => addMessage(t('voiceUnsupported'), 'ai'),
  });
  initMedia();
  const notes = getNotes();
  el.noteName.value = notes.name || '';
  el.notePrefs.value = notes.prefs || '';

  // Счётчик запросов
  state.queryCount = getQueryCount();

  // Сохранённый персонаж (до setLanguage, чтобы селекты его подхватили)
  const savedChar = getSetting('character', 'default');
  if (savedChar && savedChar !== 'default') selectCharacter(savedChar);

  // Язык: применяет переводы и наполняет селекты
  setLanguage(getSetting('uiLang', 'ru'));

  // История чата; если её нет — приветствие
  if (!loadHistory()) addMessage(t('welcome'), 'ai', false);

  refreshIcons();
}

init();
