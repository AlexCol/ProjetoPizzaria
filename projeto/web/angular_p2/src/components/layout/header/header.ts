import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme/theme.service';
import { AuthStore } from '../../../stores/auth/auth.store';
import { ButtonComponent } from '../../shared/button/button';
import { LinkComponent } from '../../shared/link/link';
import { headerStyles } from './header.styles';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [ButtonComponent, LinkComponent],
})
export class HeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly themeService = inject(ThemeService);

  protected get styles() {
    return headerStyles;
  }

  get isDark() {
    return this.themeService.isDark();
  }

  get userName() {
    return this.authStore.user?.name ?? '';
  }

  get roleName() {
    return this.authStore.user?.role?.name ?? '';
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
