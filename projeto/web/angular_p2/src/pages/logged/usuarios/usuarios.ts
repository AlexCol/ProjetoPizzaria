import { Component, signal } from '@angular/core';
import { ModalComponent } from '../../../components/shared/modal/modal';
import { UsuarioModalComponent } from './usuario-modal/usuario-modal';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  imports: [ModalComponent, UsuarioModalComponent],
})
export class UsuariosComponent {
  protected readonly modalOpen = signal(false);

  onModalClose() {
    //se desejar fazer algo quando o output do modal for emitido, faça aqui
  }
}
