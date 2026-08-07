import { makeEnvironmentProviders } from '@angular/core';
import { Overlay, OverlayContainer, provideToastr } from 'ngx-toastr';
import { ToastOverlay, ToastTopLayerContainer } from './toast-overlay';

export const toastConfig = makeEnvironmentProviders([
  provideToastr({
    timeOut: 3000, //tempo padrão
    extendedTimeOut: 3000, //tempo após um hover e o mouse sair do toast
    positionClass: 'toast-top-right',
    // preventDuplicates: true,
    closeButton: true,
    progressBar: true,
  }),
  ToastTopLayerContainer,
  { provide: OverlayContainer, useExisting: ToastTopLayerContainer },
  ToastOverlay,
  { provide: Overlay, useExisting: ToastOverlay },
]);
