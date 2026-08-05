import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../../components/layout/footer/footer';
import { HeaderComponent } from '../../../components/layout/header/header';
import { LoggerService } from '../../../services/logger/logger.service';
import { loggedLayoutStyles } from './logged.layout.styles';

@Component({
  selector: 'app-logged-layout',
  templateUrl: './logged.layout.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [FooterComponent, RouterOutlet, HeaderComponent],
})
export class LoggedLayout {
  private readonly _logger = inject(LoggerService);

  constructor() {
    this._logger.log('[LoggedLayout] constructor');
  }

  protected get styles() {
    return loggedLayoutStyles;
  }
}
