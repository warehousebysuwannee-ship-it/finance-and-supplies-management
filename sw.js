// Service Worker สำหรับระบบบริหารจัดการข้อมูลกองคลังและพัสดุ
// กลยุทธ์: network-first (พยายามโหลดเวอร์ชันล่าสุดจากอินเทอร์เน็ตก่อนเสมอ
// เพื่อไม่ให้ผู้ใช้ติดค้างเวอร์ชันเก่าเมื่อมีการอัปเดตเว็บ)
// ใช้แคชเป็นสำรองเฉพาะตอนไม่มีสัญญาณอินเทอร์เน็ตเท่านั้น

const CACHE_NAME = 'finance-supplies-app-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
