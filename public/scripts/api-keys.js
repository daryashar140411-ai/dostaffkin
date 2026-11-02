// Ключи Яндекс.Карт для учебного проекта. После проверки перевыпустите их.
window.DOSTAFFKIN_YANDEX_KEYS = {
  maps: '6256457c-edf3-44bb-825c-f88a0c03160e',
  suggest: '097b87cd-1068-486b-9d34-b507ebc6ccf2'
};

// Загружаем JS API 2.1 с обоими ключами.
(function () {
  var keys = window.DOSTAFFKIN_YANDEX_KEYS;
  if (!keys || !keys.maps || !keys.suggest) {
    console.error('Не заданы ключи JavaScript API и Геосаджеста.');
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(keys.maps) +
    '&suggest_apikey=' + encodeURIComponent(keys.suggest) + '&lang=ru_RU';
  script.async = true;
  script.onerror = function () {
    console.error('Не удалось загрузить API Яндекс.Карт. Проверьте интернет, ключ и ограничения Referer.');
    window.dispatchEvent(new Event('yandex-api-error'));
  };
  document.head.appendChild(script);
})();
