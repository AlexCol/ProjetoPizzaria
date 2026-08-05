import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { UsuarioModalComponent } from './usuario-modal/usuario-modal';
import { usuariosStyles } from './usuarios.styles';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [ModalComponent, UsuarioModalComponent, ButtonComponent],
})
export class UsuariosComponent {
  protected readonly modalOpen = signal(false);

  protected get styles() {
    return usuariosStyles;
  }

  onModalClose() {
    //se desejar fazer algo quando o output do modal for emitido, faça aqui
  }
}
