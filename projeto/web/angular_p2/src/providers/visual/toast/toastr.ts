import { provideToastr } from 'ngx-toastr';

export const toastConfig = provideToastr({
  timeOut: 3000, //tempo padrão
  extendedTimeOut: 3000, //tempo após um hover e o mouse sair do toast
  positionClass: 'toast-top-right',
  // preventDuplicates: true,
  closeButton: true,
  progressBar: true,
});
