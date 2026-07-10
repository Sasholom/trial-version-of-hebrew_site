// ============================================================
//   МЕДИА: загрузка фото, камера, файлы (PDF/TXT)
//   Фото сжимается на клиенте (canvas → JPEG) и отправляется
//   на сервер как base64 — там его обрабатывает vision-модель.
// ============================================================

import { MAX_IMAGE_SIZE, MAX_QUESTION_LENGTH, IMAGE_COMPRESSION } from './config.js';
import { state } from './state.js';
import { el, refreshIcons } from './dom.js';
import { t } from './i18n.js';
import { addMessage } from './chat.js';

// pdf.js по умолчанию требует указать воркер, иначе парсит
// в основном потоке с предупреждением в консоли.
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Подключить все обработчики. Вызывается один раз из main.js.
export function initMedia() {
  el.imageBtn.addEventListener('click', () => el.imageInput.click());
  el.imageInput.addEventListener('change', onImageSelected);
  el.removePreviewBtn.addEventListener('click', resetImageState);
  el.cameraBtn.addEventListener('click', openCamera);
  el.fileBtn.addEventListener('click', () => el.fileInput.click());
  el.fileInput.addEventListener('change', onFileSelected);
}

// Сбросить прикреплённое фото (после отправки или по крестику).
export function resetImageState() {
  state.selectedImage = null;
  el.askInput.placeholder = t('placeholder');
  el.imageBtn.innerHTML = '<i data-lucide="image"></i>';
  el.imageInput.value = '';
  el.previewDiv.style.display = 'none';
  refreshIcons();
}

// --- Загрузка фото из галереи ---

async function onImageSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > MAX_IMAGE_SIZE) {
    addMessage(t('imageTooLarge'), 'ai');
    return;
  }
  try {
    const compressed = await compressImage(file);
    attachImage(compressed);
    flashImageBtn();
  } catch {
    addMessage(t('imageReadError'), 'ai');
  }
  refreshIcons();
}

// Показать превью и запомнить фото до отправки.
function attachImage(dataUrl) {
  state.selectedImage = dataUrl;
  el.previewImg.src = dataUrl;
  el.previewDiv.style.display = 'block';
  el.askInput.placeholder = t('photoPlaceholder');
}

function flashImageBtn() {
  el.imageBtn.innerHTML = '<i data-lucide="check"></i>';
  refreshIcons();
  setTimeout(() => {
    el.imageBtn.innerHTML = '<i data-lucide="image"></i>';
    refreshIcons();
  }, 2000);
}

// Сжать изображение до заданных размеров, вернуть JPEG data URL.
function compressImage(file) {
  const { maxWidth, maxHeight, quality } = IMAGE_COMPRESSION;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Камера ---

async function openCamera() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch {
    addMessage(t('cameraError'), 'ai');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'camera-modal';
  modal.innerHTML = `
    <video id="cam-video" autoplay playsinline></video>
    <div class="camera-controls">
      <button id="capture-btn" class="tool-btn"><i data-lucide="camera"></i> ${t('cameraShoot')}</button>
      <button id="close-cam" class="tool-btn"><i data-lucide="x"></i> ${t('cameraClose')}</button>
    </div>
  `;
  document.body.appendChild(modal);

  const video = modal.querySelector('#cam-video');
  video.srcObject = stream;

  const closeCamera = () => {
    stream.getTracks().forEach((track) => track.stop());
    modal.remove();
  };

  modal.querySelector('#capture-btn').onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    attachImage(canvas.toDataURL('image/jpeg', IMAGE_COMPRESSION.quality));
    closeCamera();
  };
  modal.querySelector('#close-cam').onclick = closeCamera;

  refreshIcons();
}

// --- Файлы: PDF и TXT ---
// Текст файла вставляется в поле ввода (обрезается до лимита вопроса),
// дальше пользователь отправляет его как обычное сообщение.

async function onFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const typedarray = new Uint8Array(ev.target.result);
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(' ') + '\n';
        }
        el.askInput.value = text.substring(0, MAX_QUESTION_LENGTH);
        addMessage(t('pdfLoaded'), 'ai');
      } catch {
        addMessage(t('imageReadError'), 'ai');
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (ev) => {
      el.askInput.value = ev.target.result.substring(0, MAX_QUESTION_LENGTH);
    };
    reader.readAsText(file);
  } else {
    addMessage(t('fileUnsupported'), 'ai');
  }
  el.fileInput.value = '';
}
