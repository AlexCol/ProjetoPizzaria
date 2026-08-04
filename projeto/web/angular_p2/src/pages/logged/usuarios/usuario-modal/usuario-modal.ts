import { Component, input, output } from '@angular/core';
import { User } from '../../../../models/User';

@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuario-modal.html',
  styleUrl: './usuario-modal.css',
})
export class UsuarioModalComponent {
  mode = input.required<'create' | 'edit'>();
  user = input.required<User | undefined>();

  closeModal = output<void>();

  clickClose() {
    this.closeModal.emit();
  }
}
