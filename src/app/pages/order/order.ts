import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-order',
  standalone: true,
  templateUrl: './order.html'
})
export class Order implements AfterViewInit {
  ngAfterViewInit(): void {
    const loadOrderScript = () => {
      // Не добавляем обработчик повторно при повторном открытии страницы.
      if (document.querySelector('script[data-dostaffkin-order]')) return;
      const pageScript = document.createElement('script');
      pageScript.src = new URL('scripts/order.js', document.baseURI).toString();
      pageScript.dataset.dostaffkinOrder = 'true';
      pageScript.onerror = () => console.error('Не удалось загрузить scripts/order.js');
      document.body.appendChild(pageScript);
    };

    // Сначала полностью загружаем библиотеку Яндекс.Карт, и только затем
    // запускаем order.js, который использует window.ymaps.
    if (window.ymaps) {
      loadOrderScript();
      return;
    }

    const existingLoader = document.querySelector<HTMLScriptElement>('script[data-dostaffkin-yandex]');
    if (existingLoader) {
      existingLoader.addEventListener('load', loadOrderScript, { once: true });
      existingLoader.addEventListener('error', () => console.error('Не удалось загрузить API Яндекс.Карт'), { once: true });
      return;
    }

    const loader = document.createElement('script');
    loader.src = 'https://testologia.ru/ymc_min.js';
    loader.setAttribute('data-apikey', '6256457c-edf3-44bb-825c-f88a0c03160e');
    loader.setAttribute('data-suggest-apikey', '097b87cd-1068-486b-9d34-b507ebc6ccf2');
    loader.dataset.dostaffkinYandex = 'true';
    loader.onload = loadOrderScript;
    loader.onerror = () => console.error('Не удалось загрузить API Яндекс.Карт');
    document.head.appendChild(loader);
  }
}

