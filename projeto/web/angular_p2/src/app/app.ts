import { Component, effect, EffectCleanupRegisterFn, inject } from '@angular/core';
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
    //! Apenas injetando themeService, só injetar ele se vira
    inject(ThemeService);

    //! Registra uma única vez os comandos SSE globais.
    //! Não é necessário registrá-los novamente a cada reconexão.
    this.registerSSEGlobalCommands();

    //! Responsável pela navegação
    effect(() => this.setAuthentication());

    //! Responsável pela conexão SSE
    effect((onCleanup) => this.configureSSE(onCleanup));
  }

  /****************************************/
  /* Metodos Privados (usados nos Effect  */
  /* para deixar o componente mais limpo) */
  /****************************************/
  private setAuthentication() {
    const isLoading = this._authService.isLoading;
    if (isLoading) {
      return;
    }
    const isAuthenticated = this._authService.isAuthenticated;
    const destination = isAuthenticated ? '/home' : '/auth/login';

    void this._router.navigateByUrl(destination);
  }

  private registerSSEGlobalCommands() {
    this._sseService.registerCommand('session-updated', {
      onMessage: () => this._authService.getMe().subscribe(),
      // onError: () => this._authService.expireSession(),
    });
  }

  private configureSSE(onCleanup: EffectCleanupRegisterFn) {
    const isAuthenticated = this._authService.isAuthenticated;
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
