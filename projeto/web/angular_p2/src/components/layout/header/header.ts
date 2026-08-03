import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ThemeService } from '../../../services/theme/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  imports: [RouterLink, RouterLinkActive],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  get isDark() {
    return this.themeService.isDark();
  }

  get userName() {
    return this.authService.user?.name ?? '';
  }

  get roleName() {
    return this.authService.user?.role?.name ?? '';
  }

  logout() {
    this.authService.logout().subscribe();
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
