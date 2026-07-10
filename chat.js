// ============================================================
//   ЧАТ: рендер сообщений, markdown, эффект печати,
//   история, экспорт и поиск.
// ============================================================

import { TYPEWRITER_SPEED } from './config.js';
import { el, refreshIcons } from './dom.js';
import { t } from './i18n.js';
import { getSavedHistory, saveHistoryData } from './storage.js';
import { speak } from './voice.js';

// --- Markdown и подсветка кода (marked + highlight.js с CDN) ---

export function renderMarkdown(text) {
  if (typeof marked === 'undefined') return text;
  return marked.parse(text, { breaks: true, html: false });
}

function highlightCode(element) {
  if (typeof hljs === 'undefined') return;
  element.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
}

// --- Добавление сообщения в чат ---

/**
 * Добавить сообщение в ленту.
 * @param {string} text    Текст (для AI — markdown)
 * @param {'user'|'ai'} sender
 * @param {boolean} save   Сохранять ли историю после добавления
 * @returns {HTMLElement}  Созданный элемент сообщения
 */
export function addMessage(text, sender, save = true) {
  const message = document.createElement('div');
  message.className = `message ${sender}-message`;

  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = sender === 'user' ? '👤' : '🧠';
  message.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  // Ответы AI рендерим как markdown; сообщения пользователя — только
  // как текст (textContent), чтобы исключить XSS
  if (sender === 'ai') bubble.innerHTML = renderMarkdown(text);
  else bubble.textContent = text;
  bubble.setAttribute('data-raw', text);
  message.appendChild(bubble);

  if (sender === 'ai') {
    message.appendChild(buildMessageActions(bubble));
  }

  el.chatHistory.appendChild(message);
  if (sender === 'ai') highlightCode(message);
  el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
  if (save) saveHistory();
  refreshIcons();
  return message;
}

// Кнопки под ответом AI: копировать, поделиться, озвучить.
function buildMessageActions(bubble) {
  const actions = document.createElement('div');
  actions.className = 'msg-actions';

  const copyBtn = document.createElement('button');
  copyBtn.title = t('copyTitle');
  copyBtn.innerHTML = '<i data-lucide="clipboard"></i>';
  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const raw = bubble.getAttribute('data-raw') || '';
    try {
      await navigator.clipboard.writeText(raw);
      flashIcon(copyBtn, 'check', 'clipboard');
    } catch {
      flashIcon(copyBtn, 'x', 'clipboard');
    }
  });
  actions.appendChild(copyBtn);

  const shareBtn = document.createElement('button');
  shareBtn.title = t('shareTitle');
  shareBtn.innerHTML = '<i data-lucide="share-2"></i>';
  shareBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const raw = bubble.getAttribute('data-raw') || '';
    if (navigator.share) {
      try { await navigator.share({ text: raw }); } catch { /* пользователь отменил */ }
    } else {
      addMessage(t('shareUnsupported'), 'ai');
    }
  });
  actions.appendChild(shareBtn);

  const speakBtn = document.createElement('button');
  speakBtn.title = t('speakTitle');
  speakBtn.innerHTML = '<i data-lucide="volume-2"></i>';
  speakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    speak(bubble.getAttribute('data-raw') || '');
  });
  actions.appendChild(speakBtn);

  return actions;
}

// Кратко показать иконку результата (галочку/крестик) и вернуть исходную.
function flashIcon(btn, tempIcon, normalIcon) {
  btn.innerHTML = `<i data-lucide="${tempIcon}"></i>`;
  refreshIcons();
  setTimeout(() => {
    btn.innerHTML = `<i data-lucide="${normalIcon}"></i>`;
    refreshIcons();
  }, 2000);
}

// --- Эффект печати ---

/**
 * «Печатает» текст по словам, затем вызывает onComplete.
 * Пока идёт печать, показывается сырой текст; после завершения
 * вызывающая сторона обычно заменяет его на rendered markdown.
 */
export function typewriterEffect(bubble, fullText, onComplete) {
  const words = fullText.split(/(\s+)/);
  let i = 0;
  bubble.textContent = '';
  (function typeNext() {
    if (i < words.length) {
      bubble.textContent += words[i];
      i++;
      el.chatHistory.scrollTop = el.chatHistory.scrollHeight;
      setTimeout(typeNext, TYPEWRITER_SPEED);
    } else {
      onComplete?.();
    }
  })();
}

// --- История ---

// Восстановить историю из localStorage. Возвращает true, если что-то было.
export function loadHistory() {
  const saved = getSavedHistory();
  if (!saved.length) return false;
  el.chatHistory.innerHTML = '';
  saved.forEach((msg) => addMessage(msg.text, msg.sender, false));
  return true;
}

// Сохранить текущую ленту (кроме индикатора «Думаю...»).
export function saveHistory() {
  const messages = [];
  el.chatHistory.querySelectorAll('.message').forEach((m) => {
    if (m.classList.contains('thinking')) return;
    const isUser = m.classList.contains('user-message');
    const rawText = m.querySelector('.bubble').getAttribute('data-raw') || '';
    messages.push({ text: rawText, sender: isUser ? 'user' : 'ai' });
  });
  saveHistoryData(messages);
}

// --- Экспорт диалога в .txt ---

export function exportHistory() {
  const lines = [];
  el.chatHistory.querySelectorAll('.message').forEach((m) => {
    const isUser = m.classList.contains('user-message');
    const text = m.querySelector('.bubble').innerText;
    lines.push(`${isUser ? t('exportYou') : t('exportAI')}: ${text}`);
  });
  const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sasholom-chat-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Поиск по истории ---

export function filterMessages(term) {
  const query = term.toLowerCase();
  el.chatHistory.querySelectorAll('.message').forEach((msg) => {
    const text = msg.querySelector('.bubble').innerText.toLowerCase();
    msg.style.display = text.includes(query) ? 'flex' : 'none';
  });
}
