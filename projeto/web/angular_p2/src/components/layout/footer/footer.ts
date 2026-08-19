import { Component, computed, inject } from '@angular/core';
import { PopoverComponent } from '../../../components/shared/popover/popover';
import { SSEService } from '../../../services/sse/sse.service';
import { AuthStore } from '../../../stores/auth/auth.store';
import { footerStyles } from './footer.styles';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [PopoverComponent],
})
export class FooterComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly authStore = inject(AuthStore);
  private readonly sseService = inject(SSEService);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly currentYear = new Date().getFullYear();
  readonly styles = footerStyles; // Estilos utilizados pelo componente.

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly user = computed(() => this.authStore.user); // Usuário autenticado disponível na sessão atual.
  readonly isSseConnected = computed(() => this.sseService.isConnected); // Estado atual da conexão SSE.

  readonly connectionDotClasses = computed(() =>
    [
      footerStyles.connectionDot,
      this.isSseConnected() ? footerStyles.connectionOnline : footerStyles.connectionOffline,
    ].join(' '),
  );

  readonly connectionLabel = computed(() => (this.isSseConnected() ? 'SSE conectado' : 'SSE desconectado'));
}
