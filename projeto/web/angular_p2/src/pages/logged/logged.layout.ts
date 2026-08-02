import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/layout/footer/footer';
import { HeaderComponent } from '../../components/layout/header/header';

@Component({
  selector: 'app-logged-layout',
  templateUrl: './logged.layout.html',
  styleUrl: './logged.layout.css',
  imports: [FooterComponent, RouterOutlet, HeaderComponent],
})
export class LoggedLayout {
  constructor() {
    // eslint-disable-next-line no-console
    console.log('LoggedLayout constructor');
  }
}
