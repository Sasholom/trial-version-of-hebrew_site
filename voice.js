// ============================================================
//   ГОЛОС: распознавание речи (ввод) и озвучка (вывод)
//   Используются браузерные Web Speech API и SpeechSynthesis —
//   внешних сервисов нет.
// ============================================================

import { state } from './state.js';
import { el, refreshIcons } from './dom.js';
import { SPEECH_LANGS } from './i18n.js';

// Языки распознавания переключаются кнопкой 🌐 рядом с микрофоном
// независимо от языка интерфейса.
const VOICE_LANGS = [
  { code: 'ru-RU', label: '🇷🇺 RU' },
  { code: 'en-US', label: '🇺🇸 EN' },
  { code: 'he-IL', label: '🇮🇱 HE' },
];

let currentVoiceLang = 0;
let recognition = null;
let handlers = {};

/**
 * Инициализация распознавания речи.
 * @param {Object} callbacks
 * @param {(text: string) => void} callbacks.onTranscript  Распознанный текст
 * @param {() => void} callbacks.onError        Ошибка распознавания
 * @param {() => void} callbacks.onUnsupported  Браузер не поддерживает API
 */
export function initVoice(callbacks) {
  handlers = callbacks;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    stopListening();
    handlers.onTranscript?.(transcript);
  };
  recognition.onerror = () => {
    stopListening();
    handlers.onError?.();
  };
  recognition.onend = stopListening;

  updateVoiceLangButton();
}

export function toggleListening() {
  state.isListening ? stopListening() : startListening();
}

function startListening() {
  if (!recognition) {
    handlers.onUnsupported?.();
    return;
  }
  recognition.lang = VOICE_LANGS[currentVoiceLang].code;
  recognition.start();
  state.isListening = true;
  el.voiceBtn.classList.add('listening');
  el.voiceBtn.innerHTML = '<i data-lucide="mic-off"></i>';
  refreshIcons();
}

function stopListening() {
  state.isListening = false;
  el.voiceBtn.classList.remove('listening');
  el.voiceBtn.innerHTML = '<i data-lucide="mic"></i>';
  if (recognition) recognition.stop();
  refreshIcons();
}

// Переключить язык распознавания по кругу (RU → EN → HE).
export function switchVoiceLang() {
  currentVoiceLang = (currentVoiceLang + 1) % VOICE_LANGS.length;
  updateVoiceLangButton();
  if (state.isListening) {
    stopListening();
    startListening();
  }
}

function updateVoiceLangButton() {
  el.voiceLangBtn.textContent = VOICE_LANGS[currentVoiceLang].label;
}

// Озвучить текст голосом, соответствующим языку интерфейса.
export function speak(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANGS[state.uiLang] || 'ru-RU';
  speechSynthesis.speak(utterance);
}
