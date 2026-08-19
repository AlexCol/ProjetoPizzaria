import { Component, effect, EffectCleanupRegisterFn, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoaderComponent } from '../components/shared/loader/loader';
import { SSEService } from '../services/sse/sse.service';
import { ThemeService } from '../services/theme/theme.service';
import { AuthStore } from '../stores/auth/auth.store';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterOutlet, LoaderComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly _authStore = inject(AuthStore);
  private readonly _sseService = inject(SSEService);
  private readonly _toastService = inject(ToastrService);

  get isLoading() {
    return this._authStore.isLoading;
  }

  constructor() {
    //! Apenas injetando themeService, só injetar ele se vira
    inject(ThemeService);

    //! Registra uma única vez os comandos SSE globais.
    //! Não é necessário registrá-los novamente a cada reconexão.
    this.registerSSEGlobalCommands();

    //! Responsável pela conexão SSE
    effect((onCleanup) => this.configureSSE(onCleanup));
  }

  /****************************************/
  /* Metodos Privados (usados nos Effect  */
  /* para deixar o componente mais limpo) */
  /****************************************/
  private registerSSEGlobalCommands() {
    this._sseService.registerCommand('session-updated', {
      onMessage: () =>
        this._authStore.getMe().subscribe((user) => {
          if (!user) {
            this._toastService.info('Your session has expired. Please log in again.', 'Session Expired');
          }
        }),
    });
  }

  private configureSSE(onCleanup: EffectCleanupRegisterFn) {
    const isAuthenticated = this._authStore.isAuthenticated;
    this._sseService.setEnableSSE = isAuthenticated;

    // só registra o onCleanup se o usuário estiver autenticado,
    // caso contrário, não há necessidade de desconectar o SSE.
    // ver fluxo cleanUp abaixo
    if (isAuthenticated) {
      onCleanup(() => {
        this._sseService.setEnableSSE = false;
      });
    }
  }
}

/* fluxo cleanUp sem o if
Login
  effect executa
  habilita SSE
  registra cleanup A

Logout
  executa cleanup A
  desabilita SSE
  effect executa novamente
  mantém SSE desabilitado
  registra cleanup B

Novo login
  executa cleanup B
  desabilita SSE
  effect executa novamente
  habilita SSE
  registra cleanup C
*/
