import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ButtonVariant, buttonStyles, disabledButtonStyles } from './button.styles';

export type ButtonType = 'button' | 'reset' | 'submit';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
})
export class ButtonComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly isThrottled = signal(false);
  private throttleTimer?: ReturnType<typeof setTimeout>;

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly label = input(''); // Texto exibido no botão. Usado no template e como fallback do aria-label.
  readonly variant = input<ButtonVariant>('default'); // Define a variação visual. Usado em classes() para selecionar buttonStyles.
  readonly type = input<ButtonType>('button'); // Define o type nativo do botão: button, reset ou submit. Usado no template.
  readonly disabled = input(false, { transform: booleanAttribute }); // Desabilita o botão externamente. Usado em isDisabled().
  readonly fullWidth = input(true, { transform: booleanAttribute }); // Define se o botão ocupa toda a largura disponível. Usado em classes().
  readonly ariaLabel = input(''); // Define o aria-label explicitamente. Usado no template para acessibilidade.
  readonly title = input(''); // Define o atributo title nativo do botão. Usado no template.
  readonly className = input(''); // Permite adicionar classes extras ao botão. Usado em classes().
  readonly iconClassName = input('inline-flex size-5 items-center justify-center [&>svg]:size-full'); // Estiliza o wrapper do ícone quando não há label. Usado no template.
  readonly allowSpam = input(false, { transform: booleanAttribute }); // Permite cliques consecutivos sem bloqueio temporário. Usado no controle de throttle.
  readonly spamDelay = input(2000, { transform: numberAttribute }); // Define por quantos ms novos cliques ficam bloqueados. Usado no setTimeout do throttle.

  readonly clicked = output<MouseEvent>();

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    // Remove o timer caso o componente seja destruído durante o bloqueio de cliques.
    inject(DestroyRef).onDestroy(this.clearThrottle);
  }

  /*****************************************/
  /* Propriedades 'Computed'               */
  /*****************************************/
  readonly isDisabled = computed(() => {
    return this.disabled() || (!this.allowSpam() && this.isThrottled());
  });

  protected readonly classes = computed(() =>
    [
      this.isDisabled() ? disabledButtonStyles : buttonStyles[this.variant()],
      this.fullWidth() ? 'w-full' : 'w-auto',
      this.className().trim(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  // Disparado pelo clique do botão. Bloqueia novos cliques temporariamente quando allowSpam estiver desabilitado.
  handleClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      return;
    }

    if (!this.allowSpam()) {
      this.isThrottled.set(true);

      this.throttleTimer = setTimeout(
        () => {
          this.isThrottled.set(false);
          this.throttleTimer = undefined;
        },
        Math.max(0, this.spamDelay()),
      );
    }

    this.clicked.emit(event);
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private readonly clearThrottle = (): void => {
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = undefined;
    }
  };
}
