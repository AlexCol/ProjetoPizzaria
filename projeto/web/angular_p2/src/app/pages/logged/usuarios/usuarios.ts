import { Component, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { User } from '../../../../models/User';
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
  private toast = inject(ToastrService);
  modalOpen = signal(false); //usado como two way bingind, pro modal poder ele mesmo controlar o fechamento
  selectedUser = signal<User | undefined>(undefined);

  get styles() {
    return usuariosStyles;
  }

  openModal(user?: User) {
    this.selectedUser.set(user);
    this.modalOpen.set(true);
  }

  saveUser(user: User) {
    if (user.id) {
      console.log('Updating user:', user);
    } else {
      console.log('Creating new user:', user);
    }
    this.modalOpen.set(false);
    this.toast.success('Operation successful');
  }
}
