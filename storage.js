// ============================================================
//   РАБОТА С localStorage
//   Все чтения/записи хранилища — только через этот модуль.
//   История чата — [{ text, sender }], контекст — [{ role, content }].
// ============================================================

import { STORAGE_KEYS, CONTEXT_MESSAGES } from './config.js';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// --- История чата (для отображения) ---

export function getSavedHistory() {
  return readJSON(STORAGE_KEYS.history, []);
}

export function saveHistoryData(messages) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(messages));
}

export function clearHistoryData() {
  localStorage.removeItem(STORAGE_KEYS.history);
  localStorage.removeItem(STORAGE_KEYS.context);
}

// --- Контекст диалога (передаётся модели) ---

export function getContext() {
  return readJSON(STORAGE_KEYS.context, []);
}

export function saveContext(context) {
  localStorage.setItem(STORAGE_KEYS.context, JSON.stringify(context.slice(-CONTEXT_MESSAGES)));
}

// --- Заметки о пользователе ---

export function getNotes() {
  return readJSON(STORAGE_KEYS.notes, {});
}

export function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
}

// --- Счётчик запросов ---

export function getQueryCount() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.queryCount) || '0', 10);
}

export function saveQueryCount(count) {
  localStorage.setItem(STORAGE_KEYS.queryCount, String(count));
}

// --- Простые настройки ---

export function getSetting(key, fallback) {
  return localStorage.getItem(STORAGE_KEYS[key]) || fallback;
}

export function saveSetting(key, value) {
  localStorage.setItem(STORAGE_KEYS[key], value);
}
