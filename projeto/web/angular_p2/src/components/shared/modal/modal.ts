import { Component, ElementRef, effect, inject, input, model, output, viewChild } from '@angular/core';
import { ToastOverlay } from '../../../app/providers/visual/toast/toast-overlay';
import { modalStyles } from './modal.styles';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  host: {
    '[class]': 'styles.host',
  },
})
export class ModalComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog'); // Referência ao elemento <dialog> nativo do template.
  private readonly toastOverlay = inject(ToastOverlay); // Mantém os toasts acima do modal na top layer do navegador.

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = modalStyles; // Estilos utilizados pelo componente.

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly isOpen = model(false); // Controla a abertura do modal e permite que ele atualize o estado ao fechar por Escape ou backdrop.
  readonly blockBackdropClose = input(false); // Impede o fechamento pelo backdrop. Não interfere no fechamento por Escape.
  readonly ariaLabel = input('Janela modal'); // Nome acessível aplicado ao <dialog> através de aria-label.
  readonly closed = output<void>(); // Emitido quando o <dialog> conclui seu fechamento.

  /*****************************************/
  /* Metodos Construtor                    */
  /*****************************************/
  constructor() {
    // Reage às alterações de isOpen para abrir ou fechar o <dialog> nativo.
    effect(this.handleEffect);
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  // Disparado ao pressionar o ponteiro sobre o <dialog>.
  // Fecha quando a interação ocorre diretamente na área do dialog/backdrop.
  handleBackdropPointerDown(event: PointerEvent): void {
    const clickedBackdrop = event.target === event.currentTarget;

    if (clickedBackdrop && !this.blockBackdropClose()) {
      this.isOpen.set(false);
    }
  }

  // Disparado pelo <dialog> ao solicitar fechamento, normalmente ao pressionar Escape.
  // Cancela o fechamento nativo para que isOpen continue sendo a fonte de verdade.
  handleCancel(event: Event): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.isOpen.set(false);
  }

  // Disparado depois que o <dialog> é efetivamente fechado.
  // Informa externamente o fechamento, permitindo executar ações posteriores.
  handleClose(): void {
    this.closed.emit();
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  // Sincroniza isOpen com os métodos imperativos showModal() e close() do <dialog>.
  private readonly handleEffect = (): void => {
    const dialog = this.dialog()?.nativeElement;

    if (!dialog) {
      return;
    }

    if (this.isOpen() && !dialog.open) {
      dialog.showModal();

      // showModal() coloca o dialog na top layer; reposiciona os toasts acima dele.
      this.toastOverlay.bringToFront();
    } else if (!this.isOpen() && dialog.open) {
      dialog.close();
    }
  };
}
