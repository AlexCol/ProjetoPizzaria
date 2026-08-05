import { Component, inject } from '@angular/core';
import { AuthDirective } from '../../../directives/auth.directive';
import { AuthService } from '../../../services/auth/auth.service';
import { ThemeService } from '../../../services/theme/theme.service';
import { ButtonComponent } from '../../shared/button/button';
import { LinkComponent } from '../../shared/link/link';
import { headerStyles } from './header.styles';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [AuthDirective, ButtonComponent, LinkComponent],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  protected get styles() {
    return headerStyles;
  }

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
