import { Component, computed, inject } from '@angular/core';
import { LinkComponent } from '../../../components/shared/link/link';
import { AuthStore } from '../../../stores/auth/auth.store';
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
  private readonly authStore = inject(AuthStore);

  readonly styles = notFoundStyles;
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated);
  readonly pageClasses = computed(() =>
    [this.styles.page, this.isAuthenticated() ? this.styles.authenticatedPage : this.styles.anonymousPage].join(' '),
  );
  readonly destination = computed(() => (this.isAuthenticated() ? '/home' : '/auth/login'));
  readonly actionLabel = computed(() => (this.isAuthenticated() ? 'Voltar ao início' : 'Ir para o login'));
}
