import {
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { popoverStyles } from './popover.styles';

export type PopoverPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.html',
  host: {
    '[class]': 'styles.host',
  },
})
export class PopoverComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly destroyRef = inject(DestroyRef);
  private readonly triggerElement = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly popoverElement = viewChild<ElementRef<HTMLElement>>('popover');
  private isWatchingViewport = false;

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = popoverStyles; // Estilos utilizados pelo componente.

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly isOpen = model(false); // Controla o estado do popover e permite two-way binding.
  readonly position = input<PopoverPosition>('bottom-start'); // Define a posição do conteúdo em relação ao trigger.
  readonly closeOnContentClick = input(true, { transform: booleanAttribute }); // Define se um clique no conteúdo fecha o popover.
  readonly disabled = input(false, { transform: booleanAttribute }); // Impede a abertura do popover.
  readonly className = input(''); // Permite adicionar classes extras ao conteúdo do popover.

  readonly opened = output<void>(); // Emitido quando o popover é aberto.
  readonly closed = output<void>(); // Emitido quando o popover é fechado.

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly popoverClasses = computed(() => [popoverStyles.popover, this.className().trim()].filter(Boolean).join(' '));

  /*****************************************/
  /* Metodos Construtor                    */
  /*****************************************/
  constructor() {
    // Sincroniza o model isOpen com a API imperativa do popover nativo.
    effect(this.handleOpenState);

    // Remove listeners globais caso o componente seja destruído enquanto estiver aberto.
    this.destroyRef.onDestroy(() => this.stopWatchingViewport());
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/

  // Disparado ao clicar no trigger. Alterna o estado solicitado do popover.
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.isOpen.update((open) => !open);
  }

  // Disparado ao clicar dentro do conteúdo. Fecha o popover quando esse comportamento estiver habilitado.
  handleContentClick(): void {
    if (this.closeOnContentClick()) {
      this.isOpen.set(false);
    }
  }

  // Disparado pelo navegador quando o popover é efetivamente aberto ou fechado.
  // Mantém o model sincronizado também para fechamentos nativos, como Escape ou clique externo.
  handleToggle(event: Event): void {
    const toggleEvent = event as ToggleEvent;
    const opened = toggleEvent.newState === 'open';

    if (this.isOpen() !== opened) {
      this.isOpen.set(opened);
    }

    if (opened) {
      this.positionPopover();
      this.startWatchingViewport();
      this.opened.emit();
    } else {
      this.stopWatchingViewport();
      this.closed.emit();
    }
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/

  // Abre ou fecha o popover nativo sempre que isOpen for alterado externamente ou pelo trigger.
  private readonly handleOpenState = (): void => {
    const popover = this.popoverElement()?.nativeElement;

    if (!popover) {
      return;
    }

    const nativeOpen = popover.matches(':popover-open');

    if (this.isOpen() && !nativeOpen) {
      popover.showPopover();
    } else if (!this.isOpen() && nativeOpen) {
      popover.hidePopover();
    }
  };

  // Recalcula a posição em relação ao trigger usando coordenadas do viewport.
  private readonly positionPopover = (): void => {
    const trigger = this.triggerElement()?.nativeElement;
    const popover = this.popoverElement()?.nativeElement;

    if (!trigger || !popover || !popover.matches(':popover-open')) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const gap = 8;

    let top: number;
    let left: number;

    switch (this.position()) {
      case 'bottom-end':
        top = triggerRect.bottom + gap;
        left = triggerRect.right - popoverRect.width;
        break;

      case 'top-start':
        top = triggerRect.top - popoverRect.height - gap;
        left = triggerRect.left;
        break;

      case 'top-end':
        top = triggerRect.top - popoverRect.height - gap;
        left = triggerRect.right - popoverRect.width;
        break;

      case 'bottom-start':
      default:
        top = triggerRect.bottom + gap;
        left = triggerRect.left;
        break;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  };

  // Mantém o popover alinhado ao trigger quando o viewport ou containers roláveis mudam.
  private startWatchingViewport(): void {
    if (this.isWatchingViewport) {
      return;
    }

    window.addEventListener('resize', this.positionPopover);
    window.addEventListener('scroll', this.positionPopover, true);

    this.isWatchingViewport = true;
  }

  // Remove os listeners registrados somente enquanto o popover está aberto.
  private stopWatchingViewport(): void {
    if (!this.isWatchingViewport) {
      return;
    }

    window.removeEventListener('resize', this.positionPopover);
    window.removeEventListener('scroll', this.positionPopover, true);

    this.isWatchingViewport = false;
  }
}
