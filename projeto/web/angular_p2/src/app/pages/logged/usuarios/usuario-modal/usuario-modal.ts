import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { User } from '../../../../../models/User';
import { usuarioModalStyles } from './usuario-modal.styles';

@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuario-modal.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [ButtonComponent],
})
export class UsuarioModalComponent {
  mode = input.required<'create' | 'edit'>();
  user = input.required<User | undefined>();

  closeModal = output<void>();

  protected get styles() {
    return usuarioModalStyles;
  }

  clickClose() {
    this.closeModal.emit();
  }
}
