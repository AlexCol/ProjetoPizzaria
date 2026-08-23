import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ThemeService } from '../../../services/theme/theme.service';
import { AuthStore } from '../../../stores/auth/auth.store';
import { ButtonComponent } from '../../shared/button/button';
import { LinkComponent } from '../../shared/link/link';
import { PopoverComponent } from '../../shared/popover/popover';
import { headerStyles } from './header.styles';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [ButtonComponent, LinkComponent, PopoverComponent],
})
export class HeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly isRegistrationsRoute = computed(() =>
    /^\/(usuarios|produtos|categorias)(?:[/?#]|$)/.test(this.currentUrl()),
  );
  readonly registrationsTriggerClass = computed(() =>
    [headerStyles.registrationsTrigger, this.isRegistrationsRoute() ? headerStyles.activeRegistrationsTrigger : '']
      .filter(Boolean)
      .join(' '),
  );

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
