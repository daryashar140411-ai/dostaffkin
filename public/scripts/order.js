// Dostaffkin — оформление доставки. Реализация по заметкам дня 4.
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const calcButton = document.getElementById('calc');
const submitButton = document.getElementById('submit');

const distanceValue = document.getElementById('distanceValue');
const durationValue = document.getElementById('durationValue');
const rateValue = document.getElementById('rateValue');
const totalValue = document.getElementById('totalValue');

const orderForm = document.getElementById('orderForm');
const nameInput = document.getElementById('customerName');
const phoneInput = document.getElementById('customerPhone');
const commentInput = document.getElementById('comment');
const orderSuccessBlock = document.getElementById('orderSuccess');
const orderIdValue = document.getElementById('orderId');

const sizes = document.querySelectorAll('.main-size-card');
const speedCards = document.querySelectorAll('.main-speed-card');

let map;
let mapRoute;
let calculation;
let mapReady = false;

const RATES = {xs:9, s:13, m:20, l:27, xl:35, max:70};
const MIN_BY_SIZE = {xs:149, s:199, m:249, l:349, xl:499, max:999};

// Карта и подсказки адресов подключаются через JavaScript API Яндекс.Карт 2.1.
function initYandexMap() {
  if (!window.ymaps || !document.getElementById('yandex-map')) return;
  ymaps.ready(() => {
    map = new ymaps.Map('yandex-map', {center:[55.751244,37.618423], zoom:5, controls:['zoomControl']});
    mapReady = true;
    // Ключ Геосаджеста передаётся в подключении ymc_min.js в order.html.
    // Поэтому не проверяем старый объект DOSTAFFKIN_YANDEX_KEYS,
    // который больше не создаётся отдельным файлом api-keys.js.
    if (typeof ymaps.SuggestView === 'function') {
      new ymaps.SuggestView('from', {results:5});
      new ymaps.SuggestView('to', {results:5});
    } else {
      console.error('Подсказки адресов недоступны: SuggestView не загружен.');
    }
  });
}
initYandexMap();
window.addEventListener('yandex-api-error', () => {
  alert('Яндекс.Карты не загрузились. Проверьте, что ключи активны и разрешён запуск с localhost.');
});
// Если API загрузилось позже основного скрипта, повторно запускаем инициализацию.
let mapInitAttempts = 0;
const mapInitTimer = setInterval(() => {
  mapInitAttempts += 1;
  if (!mapReady && window.ymaps) { initYandexMap(); }
  if (mapReady || mapInitAttempts >= 20) clearInterval(mapInitTimer);
}, 500);

function renderInfo(info = null) {
  distanceValue.textContent = info ? `${info.distance} км` : '—';
  durationValue.textContent = info ? `${info.duration} дн.` : '—';
  rateValue.textContent = info ? `${info.rate} ₽/км` : '—';
  totalValue.textContent = info ? `${info.total.toLocaleString('ru-RU')} ₽` : '—';
}
function failedCalculation() {
  calculation = null;
  renderInfo();
  alert('Не удалось построить маршрут. Проверьте адреса и выбранные параметры.');
  submitButton.disabled = true;
}
function resetCalculation() {
  calculation = null;
  renderInfo();
  submitButton.disabled = true;
  if (mapRoute && map) { map.geoObjects.remove(mapRoute); mapRoute = null; }
}
async function buildRealRoute(from, to) {
  if (!mapReady || !window.ymaps) throw new Error('Карта ещё загружается. Подождите несколько секунд.');
  const route = await ymaps.route([from, to], {mapStateAutoApply:true});
  if (mapRoute) map.geoObjects.remove(mapRoute);
  mapRoute = route;
  map.geoObjects.add(route);
  const distance = route.getLength() / 1000;
  const durationSeconds = route.getJamsTime ? route.getJamsTime() : route.getTime();
  map.setBounds(route.getBounds(), {checkZoomRange:true, zoomMargin:30});
  return {distance, durationSeconds};
}
function getSelectedSize() {
  const active=document.querySelector('.main-size-card.is-active, .main-size-card.active');
  return active?.dataset.value || 's';
}
function getSelectedSpeed() {
  return document.querySelector('.main-speed-card.is-active')?.dataset.value || 'regular';
}

// Выбор размера посылки — по заметкам урока.
sizes.forEach(element => {
  element.addEventListener('click', () => {
    sizes.forEach(card => card.classList.toggle('is-active', card.dataset.value === element.dataset.value));
    sizes.forEach(card => card.classList.toggle('active', card.dataset.value === element.dataset.value));
    resetCalculation();
  });
});

// Выбор скорости доставки — сохранено из предыдущего урока.
speedCards.forEach(card => {
  const choose = () => {
    speedCards.forEach(item => {
      const active=item===card;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-pressed',String(active));
    });
    resetCalculation();
  };
  card.addEventListener('click',choose);
  card.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();choose();}
  });
});

// Кнопка «Рассчитать» активируется, когда заполнены оба адреса.
// Обновляем состояние и при обычном вводе, и после выбора подсказки Яндекса.
function updateCalculateButton() {
  const hasBothAddresses = Boolean(fromInput.value.trim() && toInput.value.trim());
  calcButton.disabled = !hasBothAddresses;
}
[fromInput, toInput].forEach(input => {
  input.addEventListener('input', () => {
    updateCalculateButton();
    resetCalculation();
  });
  input.addEventListener('change', () => {
    updateCalculateButton();
    resetCalculation();
  });
  input.addEventListener('keyup', updateCalculateButton);
  input.addEventListener('paste', () => setTimeout(updateCalculateButton, 0));
  input.addEventListener('blur', () => setTimeout(updateCalculateButton, 100));
});
updateCalculateButton();

// Расчёт маршрута и стоимости. При отсутствии ключа карт используем локальную
// демонстрационную карту для городов из списка.
calcButton.addEventListener('click', async () => {
  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  if (!from || !to || from.toLowerCase() === to.toLowerCase()) return failedCalculation();
  calcButton.disabled = true;
  calcButton.textContent = 'Строим маршрут…';
  try {
    const routeInfo = await buildRealRoute(from, to);
    const km = routeInfo.distance;
    const size = getSelectedSize();
    const speed = getSelectedSpeed();
    const rate = RATES[size];
    let total = Math.max(MIN_BY_SIZE[size], Math.ceil(km * rate));
    let duration = Math.min(30, 1 + Math.ceil(km / 80));
    // По заметкам дня 4: быстрая доставка дороже на 15% и быстрее на 30%.
    if (speed === 'fast') {
      total = Math.ceil(total * 1.15);
      duration = Math.ceil(duration - duration * 0.30);
    }
    calculation = {from, to, size, distance:km.toFixed(1), duration, rate, total, speed};
    renderInfo({distance:calculation.distance,duration,rate,total});
    submitButton.disabled = false;
  } catch (error) {
    console.error(error);
    alert(error.message || 'Не удалось построить маршрут. Проверьте адреса и настройки API.');
    calculation = null; renderInfo(); submitButton.disabled = true;
  } finally {
    updateCalculateButton();
    calcButton.textContent = 'Рассчитать';
  }
});

// Отправка заявки — демо без реального бэкенда.
submitButton.addEventListener('click', async () => {
  if (!calculation) {
    alert('Сначала рассчитайте стоимость, чтобы оформить заявку.');
    return;
  }
  const name=nameInput.value.trim();
  const phone=phoneInput.value.trim();
  const comment=commentInput.value.trim();
  if (!name) { alert('Введите имя'); nameInput.focus(); return; }
  if (phone.replace(/\D/g,'').length<10) {
    alert('Введите корректный телефон (минимум 10 цифр)');
    phoneInput.focus(); return;
  }
  const payload={
    id:Math.floor(Math.random()*(100000-10000+1))+10000,
    customer:{name,phone,comment},
    route:{from:calculation.from,to:calculation.to},
    calculation,
    createdAt:new Date().toLocaleDateString('ru-RU')
  };
  console.log('Заказ: '+payload.id,payload);
  try {
    const orders=JSON.parse(localStorage.getItem('dostaffkinOrders')||'{}');
    orders[String(payload.id)]=payload;
    localStorage.setItem('dostaffkinOrders',JSON.stringify(orders));
  } catch(error) { console.warn('Локальное сохранение недоступно',error); }
  orderIdValue.textContent=payload.id;
  orderForm.style.display='none';
  orderSuccessBlock.hidden=false;
});
renderInfo();
submitButton.disabled=true;
updateCalculateButton();
