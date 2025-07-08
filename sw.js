// Service Worker لتطبيق الطقس
const CACHE_NAME = 'weather-app-v1.2';
const STATIC_CACHE = 'weather-static-v1.2';
const DYNAMIC_CACHE = 'weather-dynamic-v1.2';

// الملفات الأساسية للتخزين المؤقت
const STATIC_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
];

// الملفات الديناميكية (API calls وصور الطقس)
const DYNAMIC_FILES = [
  'https://api.openweathermap.org/',
  'https://openweathermap.org/img/wn/',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Static files cached successfully');
        return self.skipWaiting(); // تفعيل فوري للـ SW الجديد
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error caching static files:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // حذف الكاشات القديمة
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated successfully');
        return self.clients.claim(); // السيطرة على جميع الصفحات
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error during activation:', error);
      })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // استراتيجية مختلفة حسب نوع الطلب
  if (isStaticFile(request.url)) {
    // الملفات الثابتة: Cache First
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // طلبات API: Network First مع Fallback
    event.respondWith(networkFirstWithFallback(request));
  } else if (isImageRequest(request.url)) {
    // صور الطقس: Cache First مع Network Fallback
    event.respondWith(cacheFirstWithNetworkFallback(request));
  } else {
    // باقي الطلبات: Network First
    event.respondWith(networkFirst(request));
  }
});

// التحقق من نوع الملف
function isStaticFile(url) {
  return (
    STATIC_FILES.some((file) => url.includes(file)) ||
    url.includes('.css') ||
    url.includes('.js') ||
    url.includes('.html') ||
    url.includes('fonts.googleapis.com')
  );
}

function isAPIRequest(url) {
  return url.includes('api.openweathermap.org');
}

function isImageRequest(url) {
  return (
    url.includes('openweathermap.org/img/wn/') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.jpeg') ||
    url.includes('.svg')
  );
}

// استراتيجية Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Cache Hit:', request.url);
      return cachedResponse;
    }

    console.log('🌐 Network Request:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First Error:', error);
    return new Response('خطأ في تحميل المورد', {
      status: 500,
      statusText: 'Service Worker Error',
    });
  }
}

// استراتيجية Network First مع Fallback
async function networkFirstWithFallback(request) {
  try {
    console.log('🌐 API Request:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('📦 Fallback to Cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // إرجاع استجابة افتراضية للـ API
    return new Response(
      JSON.stringify({
        error: true,
        message: 'لا يوجد اتصال بالإنترنت',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// استراتيجية Cache First مع Network Fallback
async function cacheFirstWithNetworkFallback(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Image Cache Hit:', request.url);
      return cachedResponse;
    }

    console.log('🌐 Image Network Request:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.error('❌ Image Load Error:', error);
    // إرجاع أيقونة افتراضية
    return new Response('🌤️', {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

// استراتيجية Network First
async function networkFirst(request) {
  try {
    console.log('🌐 Network First:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('📦 Network First Fallback:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('المورد غير متاح', {
      status: 404,
      statusText: 'Not Found',
    });
  }
}

// تنظيف الكاش القديم
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.includes('weather-')) {
              console.log('🗑️ Clearing cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// معالجة الأخطاء العامة
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker Unhandled Rejection:', event.reason);
  event.preventDefault();
});

console.log('🎉 Service Worker: Loaded successfully');
