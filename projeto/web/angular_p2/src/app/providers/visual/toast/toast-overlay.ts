import { inject, Injectable } from '@angular/core';
import { Overlay, OverlayContainer, OverlayRef, ToastContainerDirective } from 'ngx-toastr';

/*****************************************/
/* ToastTopLayerContainer                */
/* Coloca o container de toasts na top   */
/* layer para exibi-los acima de dialogs.*/
/*****************************************/
@Injectable()
export class ToastTopLayerContainer extends OverlayContainer {
  // Reposiciona o container de toasts no topo da pilha da top layer.
  bringToFront(): void {
    const container = this.getContainerElement();

    // Transforma o container em um popover manual para que ele possa participar da top layer.
    if (!container.hasAttribute('popover')) {
      container.setAttribute('popover', 'manual');
    }

    // Se já estiver aberto, fecha antes de reabrir para movê-lo ao topo da pilha.
    if (container.matches(':popover-open')) {
      container.hidePopover();
    }

    container.showPopover();
  }
}

/*****************************************/
/* ToastOverlay                          */
/* Integra o overlay do ngx-toastr com   */
/* o container customizado da top layer. */
/*****************************************/
@Injectable()
export class ToastOverlay extends Overlay {
  private readonly container = inject(ToastTopLayerContainer);

  // Disparado pelo ngx-toastr ao criar um novo overlay.
  // Garante que o container fique acima de dialogs já abertos.
  override create(positionClass?: string, overlayContainer?: ToastContainerDirective): OverlayRef {
    const overlayRef = super.create(positionClass, overlayContainer);

    this.bringToFront();

    return overlayRef;
  }

  // Permite reposicionar os toasts quando um dialog é aberto depois deles.
  bringToFront(): void {
    this.container.bringToFront();
  }
}
