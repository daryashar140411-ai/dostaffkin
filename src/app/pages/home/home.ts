import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html'
})
export class Home implements AfterViewInit {
  ngAfterViewInit(): void {
    // Главная страница не требует отдельного JavaScript.\n
  }
}
