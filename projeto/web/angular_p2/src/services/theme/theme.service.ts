import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'theme';
  private transitionId = 0;

  readonly theme = signal<Theme>(this.getInitialTheme());
  readonly isDark = () => this.theme() === 'dark';

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    const nextTheme: Theme = this.isDark() ? 'light' : 'dark';
    const updateTheme = () => {
      this.theme.set(nextTheme);
      this.applyTheme(nextTheme);
      localStorage.setItem(this.storageKey, nextTheme);
    };

    if (!this.document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateTheme();
      return;
    }

    const currentTransitionId = ++this.transitionId;
    const root = this.document.documentElement;
    root.classList.add('theme-switching');

    const transition = this.document.startViewTransition(updateTheme);
    const cleanup = () => {
      if (this.transitionId === currentTransitionId) {
        root.classList.remove('theme-switching');
      }
    };

    void transition.finished.then(cleanup, cleanup);
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.storageKey);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    const root = this.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }
}

/*
 * Fluxo da troca de tema:
 *
 * 1. `toggle()` calcula o próximo tema e concentra em `updateTheme()` as
 *    alterações que precisam ocorrer juntas: atualizar o signal, trocar a
 *    classe do elemento `<html>` e persistir a preferência no localStorage.
 *
 * 2. Quando a View Transitions API está disponível, o navegador captura o
 *    estado visual atual, executa `updateTheme()` e faz um único crossfade
 *    entre os estados antigo e novo. Isso mantém todos os componentes
 *    sincronizados, em vez de cada um animar suas cores separadamente.
 *
 * 3. A classe `theme-switching` desativa temporariamente as transições locais
 *    durante a captura. Ela é removida quando a View Transition termina.
 *
 * 4. `transitionId` impede que o término de uma transição antiga remova essa
 *    classe enquanto uma troca de tema mais recente ainda está em andamento.
 *
 * 5. Se a API não estiver disponível ou o usuário preferir movimento reduzido,
 *    `updateTheme()` é executado diretamente, produzindo uma troca imediata.
 */
