import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Pen, Trash2 } from 'lucide-angular';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table';
import {
  DataTableCellTemplateContext,
  DataTableFilterOption,
} from '../../../../components/shared/data-table/data-table.interfaces';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { AuthDirective } from '../../../../directives/auth.directive';
import { User } from '../../../../models/User';
import { AuthService } from '../../../../services/auth/auth.service';
import { UsuarioModalComponent, UserFormSubmission } from './usuario-modal/usuario-modal';
import { UsuariosDataService } from './usuarios-data.service';
import { createUsuariosTableColumns } from './usuarios-table.columns';
import { usuariosStyles } from './usuarios.styles';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  host: { '[class]': 'styles.host' },
  imports: [
    AuthDirective,
    ButtonComponent,
    DataTableComponent,
    ModalComponent,
    UsuarioModalComponent,
    LucideAngularModule,
  ],
  providers: [UsuariosDataService],
})
export class UsuariosComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly data = inject(UsuariosDataService);
  private readonly authService = inject(AuthService);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly Edit = Pen;
  readonly Trash2 = Trash2;
  readonly users = this.data.users;
  readonly loading = this.data.loading;
  readonly saving = this.data.saving;
  readonly deleting = this.data.deleting;
  readonly modalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly selectedUser = signal<User | undefined>(undefined);
  readonly userToDelete = signal<User | undefined>(undefined);
  readonly styles = usuariosStyles;

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly statusTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<User>>>('statusTemplate');
  readonly actionsTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<User>>>('actionsTemplate');
  readonly isAdmin = computed(() => this.authService.hasAnyRole(['Admin']));
  readonly roleOptions = computed<DataTableFilterOption[]>(() =>
    this.data.roles().map((role) => ({ label: role.name, value: role.id })),
  );
  readonly roleFilterOptions = computed<DataTableFilterOption[]>(() =>
    this.data.roles().map((role) => ({ label: role.name, value: role.name })),
  );
  readonly tableColumns = computed(() =>
    createUsuariosTableColumns({
      roleOptions: this.roleFilterOptions(),
      statusTemplate: this.statusTemplate(),
      actionsTemplate: this.actionsTemplate(),
      showControls: this.isAdmin(),
    }),
  );

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    this.data.load();
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  openModal(user?: User): void {
    this.selectedUser.set(user);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.selectedUser.set(undefined);
  }

  requestDelete(user: User): void {
    this.userToDelete.set(user);
    this.deleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.userToDelete.set(undefined);
  }

  statusLabel(status: User['status']): string {
    return { Active: 'Ativo', Inactive: 'Inativo', Blocked: 'Bloqueado' }[status];
  }

  saveUser(payload: UserFormSubmission): void {
    this.data.saveUser(this.selectedUser(), payload, () => this.closeModal());
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.data.deleteUser(user, () => this.cancelDelete());
  }
}
