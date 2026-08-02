import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { LoaderComponent } from '../components/shared/loader/loader';
import { AuthService } from '../services/auth/auth.service';
import { ThemeService } from '../services/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterOutlet, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  constructor() {
    inject(ThemeService);

    effect(() => {
      const isLoading = this.authService.isLoading;
      if (isLoading) {
        return;
      }
      const isAuthenticated = this.authService.isAuthenticated;
      const destination = isAuthenticated ? '/home' : '/auth/login';
      void this.router.navigateByUrl(destination);
    });
  }
}
