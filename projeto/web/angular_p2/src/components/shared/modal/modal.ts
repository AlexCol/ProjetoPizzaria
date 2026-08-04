import { Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class ModalComponent {
  readonly isOpen = model(false); //indica se o modal está aberto ou fechado
  readonly blockBackdropClose = input(false); //bloquear ou não o fechamento do modal ao clicar no backdrop
  readonly ariaLabel = input('Janela modal'); // rótulo de acessibilidade para o modal
  readonly closed = output<void>(); //evento emitido quando o modal é fechado, seja pelo botão de fechar ou pelo backdrop

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;

      if (!dialog) {
        return;
      }

      if (this.isOpen() && !dialog.open) {
        dialog.showModal();
      } else if (!this.isOpen() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected handleBackdropClick(event: MouseEvent): void {
    const clickedBackdrop = event.target === event.currentTarget;

    if (clickedBackdrop && !this.blockBackdropClose()) {
      this.isOpen.set(false);
    }
  }

  protected handleCancel(event: Event): void {
    // Impede o fechamento automático para manter isOpen sincronizado.
    event.preventDefault();
    this.isOpen.set(false);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.isOpen.set(false);
    }
  }

  protected handleClose(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }

    this.closed.emit();
  }
}
