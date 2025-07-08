// متغيرات عامة
const API_KEY = '07ab8bbd34797a34e35b3fd1d99b493e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// عناصر DOM
let searchInput, searchBtn, errorMessage, weatherContent, retryBtn;
let cityName, countryName, currentTime, temperature, weatherIcon, weatherText;
let humidityValue, windValue, visibilityValue, feelsLikeValue;
let sunriseTime, sunsetTime, updateTimeArabic, updateTimeEnglish;

// تهيئة التطبيق
function initializeApp() {
  initializeElements();
  bindEvents();
  updateCurrentTime();
  loadLastSearch();
}

// تهيئة عناصر DOM
function initializeElements() {
  // عناصر البحث
  searchInput = document.querySelector('.search-input');
  searchBtn = document.querySelector('.search-btn');

  // عناصر العرض
  errorMessage = document.querySelector('.error-message');
  weatherContent = document.querySelector('.weather-content');
  retryBtn = document.querySelector('.retry-btn');

  // عناصر معلومات الطقس
  cityName = document.querySelector('.city-name');
  countryName = document.querySelector('.country-name');
  currentTime = document.querySelector('.current-time');
  temperature = document.querySelector('.temperature');
  weatherIcon = document.querySelector('.weather-icon-img');
  weatherText = document.querySelector('.weather-text');

  // عناصر التفاصيل
  humidityValue = document.querySelector('.humidity-value');
  windValue = document.querySelector('.wind-value');
  visibilityValue = document.querySelector('.visibility-value');
  feelsLikeValue = document.querySelector('.feels-like-value');
  sunriseTime = document.querySelector('.sunrise-time');
  sunsetTime = document.querySelector('.sunset-time');
  updateTimeArabic = document.querySelector('.ar');
  updateTimeEnglish = document.querySelector('.en');
}


// ربط الأحداث
function bindEvents() {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  retryBtn.addEventListener('click', hideError);

  // تحسين تجربة المستخدم
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim()) {
      searchBtn.style.opacity = '1';
      searchBtn.style.transform = 'scale(1.02)';
    } else {
      searchBtn.style.opacity = '0.7';
      searchBtn.style.transform = 'scale(1)';
    }
  });

  // تحسين الاستجابة للمس
  searchBtn.addEventListener('touchstart', () => {
    searchBtn.style.transform = 'scale(0.98)';
  });

  searchBtn.addEventListener('touchend', () => {
    searchBtn.style.transform = '';
  });

  // تحسين التركيز
  searchInput.addEventListener('focus', () => {
    searchInput.parentElement.style.transform = 'translateY(-2px)';
  });

  searchInput.addEventListener('blur', () => {
    if (!searchInput.value.trim()) {
      searchInput.parentElement.style.transform = '';
    }
  });
}

// معالجة البحث
async function handleSearch() {
  const city = searchInput.value.trim();

  if (!city) {
    showInputError();
    return;
  }

  showLoading();

  try {
    const weatherData = await fetchWeatherData(city);
    displayWeatherData(weatherData);
    saveLastSearch(city);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// جلب بيانات الطقس
async function fetchWeatherData(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${API_KEY}&lang=ar`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.cod === '404') {
    throw new Error('المدينة غير موجودة');
  }

  if (data.cod !== 200) {
    throw new Error('حدث خطأ في جلب البيانات');
  }

  return data;
}

// عرض بيانات الطقس
function displayWeatherData(data) {
  // معلومات الموقع
  cityName.textContent = data.name;
  countryName.textContent = getCountryName(data.sys.country);

  // درجة الحرارة
  temperature.textContent = Math.round(data.main.temp);

  // وصف الطقس والأيقونة
  weatherText.textContent = translateWeatherDescription(
    data.weather[0].description
  );
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  // التفاصيل
  humidityValue.textContent = `${data.main.humidity}%`;
  windValue.textContent = `${Math.round(data.wind.speed * 3.6)} كم/س`;
  visibilityValue.textContent = `${(data.visibility / 1000).toFixed(1)} كم`;
  feelsLikeValue.textContent = `${Math.round(data.main.feels_like)}°`;

  // أوقات الشروق والغروب
  sunriseTime.textContent = formatTime(data.sys.sunrise);
  sunsetTime.textContent = formatTime(data.sys.sunset);

  // وقت التحديث
  updateTimeArabic.textContent = formatDateTime(new Date()).ar;
  updateTimeEnglish.textContent = formatDateTime(new Date()).en;

  // إظهار النتائج
  showWeatherContent();

  // تحديث لون الخلفية حسب الطقس
  updateBackgroundTheme(data.weather[0].main);
}

// إظهار محتوى الطقس
function showWeatherContent() {
  hideError();
  weatherContent.style.display = 'block';
  weatherContent.style.animation = 'slideIn 0.5s ease-out';
}

// إظهار رسالة خطأ
function showError(message) {
  weatherContent.style.display = 'none';
  errorMessage.style.display = 'block';
  errorMessage.querySelector('.error-text').textContent = message;
}

// إخفاء رسالة الخطأ
function hideError() {
  errorMessage.style.display = 'none';
}

// إظهار حالة التحميل
function showLoading() {
  searchBtn.classList.add('loading');
  searchBtn.disabled = true;
}

// إخفاء حالة التحميل
function hideLoading() {
  searchBtn.classList.remove('loading');
  searchBtn.disabled = false;
}

// إظهار خطأ في الإدخال
function showInputError() {
  searchInput.style.borderColor = '#e53e3e';
  searchInput.style.animation = 'shake 0.5s ease-in-out';

  setTimeout(() => {
    searchInput.style.borderColor = '';
    searchInput.style.animation = '';
  }, 500);
}

// تحديث الوقت الحالي
function updateCurrentTime() {
  const updateTimeDisplay = () => {
    if (currentTime) {
      currentTime.textContent = formatDateTime(new Date()).en;
    }
  };

  updateTimeDisplay();
  setInterval(updateTimeDisplay, 60000); // تحديث كل دقيقة
}

// تنسيق الوقت
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// تنسيق التاريخ والوقت
function formatDateTime(date) {
  const en_date = date.toLocaleString('ar-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const ar_date = date.toLocaleString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    en: en_date,
    ar: ar_date,
  };
}

// الحصول على اسم الدولة
function getCountryName(countryCode) {
  const countries = {
    SA: 'المملكة العربية السعودية',
    EG: 'مصر',
    AE: 'الإمارات العربية المتحدة',
    JO: 'الأردن',
    LB: 'لبنان',
    SY: 'سوريا',
    IQ: 'العراق',
    KW: 'الكويت',
    QA: 'قطر',
    BH: 'البحرين',
    OM: 'عُمان',
    YE: 'اليمن',
    MA: 'المغرب',
    TN: 'تونس',
    DZ: 'الجزائر',
    LY: 'ليبيا',
    SD: 'السودان',
    SO: 'الصومال',
    DJ: 'جيبوتي',
    KM: 'جزر القمر',
    MR: 'موريتانيا',
    US: 'الولايات المتحدة',
    GB: 'المملكة المتحدة',
    FR: 'فرنسا',
    DE: 'ألمانيا',
    IT: 'إيطاليا',
    ES: 'إسبانيا',
    TR: 'تركيا',
    IN: 'الهند',
    CN: 'الصين',
    JP: 'اليابان',
    RU: 'روسيا',
    BR: 'البرازيل',
    CA: 'كندا',
    AU: 'أستراليا',
  };

  return countries[countryCode] || countryCode;
}

// ترجمة وصف الطقس
function translateWeatherDescription(description) {
  const translations = {
    'clear sky': 'سماء صافية',
    'few clouds': 'غيوم قليلة',
    'scattered clouds': 'غيوم متناثرة',
    'broken clouds': 'غيوم متكسرة',
    'overcast clouds': 'غيوم كثيفة',
    'shower rain': 'زخات مطر',
    'light rain': 'مطر خفيف',
    'moderate rain': 'مطر متوسط',
    'heavy intensity rain': 'مطر غزير',
    'very heavy rain': 'مطر شديد الغزارة',
    'extreme rain': 'مطر استثنائي',
    'freezing rain': 'مطر متجمد',
    'light intensity shower rain': 'زخات مطر خفيفة',
    'heavy intensity shower rain': 'زخات مطر غزيرة',
    'ragged shower rain': 'زخات مطر متقطعة',
    'thunderstorm with light rain': 'عاصفة رعدية مع مطر خفيف',
    'thunderstorm with rain': 'عاصفة رعدية مع مطر',
    'thunderstorm with heavy rain': 'عاصفة رعدية مع مطر غزير',
    'light thunderstorm': 'عاصفة رعدية خفيفة',
    thunderstorm: 'عاصفة رعدية',
    'heavy thunderstorm': 'عاصفة رعدية قوية',
    'ragged thunderstorm': 'عاصفة رعدية متقطعة',
    'thunderstorm with light drizzle': 'عاصفة رعدية مع رذاذ خفيف',
    'thunderstorm with drizzle': 'عاصفة رعدية مع رذاذ',
    'thunderstorm with heavy drizzle': 'عاصفة رعدية مع رذاذ كثيف',
    'light intensity drizzle': 'رذاذ خفيف',
    drizzle: 'رذاذ',
    'heavy intensity drizzle': 'رذاذ كثيف',
    'light intensity drizzle rain': 'رذاذ مطر خفيف',
    'drizzle rain': 'رذاذ مطر',
    'heavy intensity drizzle rain': 'رذاذ مطر كثيف',
    'shower rain and drizzle': 'زخات مطر ورذاذ',
    'heavy shower rain and drizzle': 'زخات مطر ورذاذ كثيف',
    'shower drizzle': 'زخات رذاذ',
    'light snow': 'ثلج خفيف',
    snow: 'ثلج',
    'heavy snow': 'ثلج كثيف',
    sleet: 'مطر ثلجي',
    'light shower sleet': 'زخات مطر ثلجي خفيفة',
    'shower sleet': 'زخات مطر ثلجي',
    'light rain and snow': 'مطر وثلج خفيف',
    'rain and snow': 'مطر وثلج',
    'light shower snow': 'زخات ثلج خفيفة',
    'shower snow': 'زخات ثلج',
    'heavy shower snow': 'زخات ثلج كثيفة',
    mist: 'ضباب خفيف',
    smoke: 'دخان',
    haze: 'غبار',
    'sand/dust whirls': 'دوامات رملية',
    fog: 'ضباب كثيف',
    sand: 'رمال',
    dust: 'غبار',
    'volcanic ash': 'رماد بركاني',
    squalls: 'عواصف',
    tornado: 'إعصار',
  };

  return translations[description.toLowerCase()] || description;
}

// تحديث خلفية التطبيق حسب الطقس
function updateBackgroundTheme(weatherMain) {
  const body = document.body;
  const themes = {
    Clear: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    Clouds: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    Rain: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
    Drizzle: 'linear-gradient(135deg, #81ecec 0%, #6c5ce7 100%)',
    Thunderstorm: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    Snow: 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)',
    Mist: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    Fog: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    Haze: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    Dust: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    Sand: 'linear-gradient(135deg, #eacda3 0%, #d6ae7b 100%)',
  };

  body.style.background = themes[weatherMain] || themes['Clear'];
}

// حفظ آخر بحث
function saveLastSearch(city) {
  try {
    localStorage.setItem('lastSearchedCity', city);
  } catch (error) {
    console.warn('لا يمكن حفظ البيانات في التخزين المحلي:', error);
  }
}

// تحميل آخر بحث
function loadLastSearch() {
  try {
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
      searchInput.value = lastCity;
      // يمكن تفعيل البحث التلقائي هنا إذا رغبت
      // handleSearch();
    }
  } catch (error) {
    console.warn('لا يمكن تحميل البيانات من التخزين المحلي:', error);
  }
}

// إضافة أنيميشن الاهتزاز للـ CSS
function addShakeAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  addShakeAnimation();
  initializeApp();
});

// إضافة Service Worker للعمل بدون إنترنت (اختياري)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('✅ Service Worker مسجل بنجاح:', registration.scope);

        // التحقق من التحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // إظهار رسالة التحديث للمستخدم
              showUpdateNotification();
            }
          });
        });
      })
      .catch((registrationError) => {
        console.warn('❌ فشل تسجيل Service Worker:', registrationError);
      });
  });
}

// إظهار إشعار التحديث
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: 'Cairo', sans-serif;
      max-width: 300px;
      animation: slideInRight 0.5s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span style="font-size: 1.2rem;">🔄</span>
        <strong>تحديث متاح!</strong>
      </div>
      <p style="margin: 0 0 15px 0; font-size: 0.9rem; opacity: 0.9;">
        يتوفر إصدار جديد من التطبيق
      </p>
      <div style="display: flex; gap: 10px;">
        <button onclick="updateApp()" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
        ">تحديث</button>
        <button onclick="this.closest('div').remove()" style="
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
        ">لاحقاً</button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // إزالة الإشعار تلقائياً بعد 10 ثوان
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

// تحديث التطبيق
function updateApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
}

// إضافة أنيميشن للإشعار
const updateStyle = document.createElement('style');
updateStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(updateStyle);

// معالجة حالة عدم الاتصال
window.addEventListener('online', () => {
  console.log('🌐 الاتصال بالإنترنت متاح');
  // يمكن إضافة منطق إضافي هنا
});

window.addEventListener('offline', () => {
  console.log('📱 وضع عدم الاتصال');
  // يمكن إضافة منطق إضافي هنا
});
