import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoggerService } from '../../../services/logger/logger.service';

@Component({
  selector: 'app-not-logged-layout',
  template: '<router-outlet/>',
  imports: [RouterOutlet],
})
export class NotLoggedLayoutComponent {
  private readonly _logger = inject(LoggerService);

  constructor() {
    this._logger.log('[NotLoggedLayoutComponent] constructor');
  }
}
