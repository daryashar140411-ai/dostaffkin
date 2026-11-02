import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-track',
  standalone: true,
  templateUrl: './track.html'
})
export class Track implements AfterViewInit {
  ngAfterViewInit(): void {
    const pageScript = document.createElement('script');
    pageScript.src = new URL('scripts/track.js', document.baseURI).toString();
    pageScript.onload = () => {};
    document.body.appendChild(pageScript);

  }
}
