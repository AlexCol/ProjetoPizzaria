import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GradientBackgroundComponent } from '../../../components/shared/gradient-background-component/gradient-background-component';
import { LoggerService } from '../../../services/logger/logger.service';

@Component({
  selector: 'app-not-logged-layout',
  templateUrl: './not-logged.layout.html',
  host: {
    class: 'relative block min-h-dvh overflow-hidden',
  },
  imports: [GradientBackgroundComponent, RouterOutlet],
})
export class NotLoggedLayoutComponent {
  private readonly _logger = inject(LoggerService);

  constructor() {
    this._logger.log('[NotLoggedLayoutComponent] constructor');
  }
}
