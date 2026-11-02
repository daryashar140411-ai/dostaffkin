import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-order',
  standalone: true,
  templateUrl: './order.html'
})
export class Order implements AfterViewInit {
  ngAfterViewInit(): void {
    const loader = document.createElement('script');
    loader.src = 'https://testologia.ru/ymc_min.js';
    loader.setAttribute('data-apikey', '6256457c-edf3-44bb-825c-f88a0c03160e');
    loader.setAttribute('data-suggest-apikey', '097b87cd-1068-486b-9d34-b507ebc6ccf2');
    document.head.appendChild(loader);
    const pageScript = document.createElement('script');
    pageScript.src = new URL('scripts/order.js', document.baseURI).toString();
    pageScript.onload = () => {};
    document.body.appendChild(pageScript);

  }
}
