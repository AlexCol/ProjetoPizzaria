import { inject, Injectable } from '@angular/core';
import { Overlay, OverlayContainer, OverlayRef, ToastContainerDirective } from 'ngx-toastr';

/**
 * Promove os containers de toast para a top layer do navegador sem retirá-los
 * da viewport. Assim eles permanecem acima de dialogs modais e não mudam de
 * posição quando um modal é fechado.
 */
@Injectable()
export class ToastOverlay extends Overlay {
  private readonly topLayerContainer = inject(ToastTopLayerContainer);

  override create(positionClass?: string, overlayContainer?: ToastContainerDirective): OverlayRef {
    const overlayRef = super.create(positionClass, overlayContainer);
    this.topLayerContainer.bringToFront();

    return overlayRef;
  }

  bringToFront(): void {
    this.topLayerContainer.bringToFront();
  }
}

@Injectable()
export class ToastTopLayerContainer extends OverlayContainer {
  bringToFront(): void {
    const container = this.getContainerElement();

    container.setAttribute('popover', 'manual');

    if (container.matches(':popover-open')) {
      container.hidePopover();
    }

    container.showPopover();
  }
}
