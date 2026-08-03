import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { LoaderComponent } from '../components/shared/loader/loader';
import { AuthService } from '../services/auth/auth.service';
import { SSEService } from '../services/sse/sse.service';
import { ThemeService } from '../services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterOutlet, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _sseService = inject(SSEService);

  get isLoading() {
    return this._authService.isLoading;
  }

  constructor() {
    inject(ThemeService);

    //! Responsável pela navegação
    effect(() => {
      const isLoading = this._authService.isLoading;
      if (isLoading) {
        return;
      }
      const isAuthenticated = this._authService.isAuthenticated;
      const destination = isAuthenticated ? '/home' : '/auth/login';
      void this._router.navigateByUrl(destination);
    });

    //! Responsável pela conexão SSE
    effect((onCleanup) => {
      const isAuthenticated = this._authService.isAuthenticated;
      if (!isAuthenticated) {
        this._sseService.setEnableSSE = false;
        return;
      }
      this._sseService.setEnableSSE = true;

      onCleanup(() => {
        this._sseService.setEnableSSE = false;
      });
    });
  }
}
