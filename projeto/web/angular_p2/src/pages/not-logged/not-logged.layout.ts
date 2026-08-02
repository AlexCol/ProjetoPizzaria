import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-not-logged-layout',
  template: '<router-outlet/>',
  imports: [RouterOutlet],
})
export class NotLoggedLayoutComponent {
  constructor() {
    // eslint-disable-next-line no-console
    console.log('NotLoggedLayoutComponent constructor');
  }
}
