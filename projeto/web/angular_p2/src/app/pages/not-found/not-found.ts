import { Component, computed, inject } from '@angular/core';
import { LinkComponent } from '../../../components/shared/link/link';
import { AuthService } from '../../../services/auth/auth.service';
import { notFoundStyles } from './not-found.styles';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [LinkComponent],
})
export class NotFoundComponent {
  private readonly authService = inject(AuthService);

  readonly styles = notFoundStyles;
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated);
  readonly pageClasses = computed(() =>
    [
      this.styles.page,
      this.isAuthenticated() ? this.styles.authenticatedPage : this.styles.anonymousPage,
    ].join(' '),
  );
  readonly destination = computed(() => (this.isAuthenticated() ? '/home' : '/auth/login'));
  readonly actionLabel = computed(() => (this.isAuthenticated() ? 'Voltar ao início' : 'Ir para o login'));
}
