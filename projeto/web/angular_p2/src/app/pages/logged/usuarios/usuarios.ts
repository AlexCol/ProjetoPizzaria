import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table';
import {
  DataTableCellTemplateContext,
  DataTableFilterOption,
} from '../../../../components/shared/data-table/data-table.interfaces';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { AuthDirective } from '../../../../directives/auth.directive';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { Role } from '../../../../models/Role';
import { User } from '../../../../models/User';
import { AuthService } from '../../../../services/auth/auth.service';
import { RolesService } from '../../../../services/domain/roles/roles.service';
import { CreateUserRequest, UpdateUserRequest } from '../../../../services/domain/users/user.interfaces';
import { UsersService } from '../../../../services/domain/users/users.service';
import { UsuarioModalComponent, UserFormSubmission } from './usuario-modal/usuario-modal';
import { createUsuariosTableColumns } from './usuarios-table.columns';
import { usuariosStyles } from './usuarios.styles';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  host: { '[class]': 'styles.host' },
  imports: [AuthDirective, ButtonComponent, DataTableComponent, ModalComponent, UsuarioModalComponent],
})
export class UsuariosComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
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
    this.roles().map((role) => ({ label: role.name, value: role.id })),
  );
  readonly roleFilterOptions = computed<DataTableFilterOption[]>(() =>
    this.roles().map((role) => ({ label: role.name, value: role.name })),
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
    this.loadRoles();
    this.loadUsers();
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

  saveUser(payload: UserFormSubmission): void {
    const selected = this.selectedUser();
    const request = selected
      ? this.usersService.updateUser(selected.id, payload as UpdateUserRequest)
      : this.usersService.createUser(payload as CreateUserRequest);

    this.saving.set(true);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success(selected ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.');
          this.closeModal();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível salvar o usuário.'), 'Erro');
        },
      });
  }

  requestDelete(user: User): void {
    this.userToDelete.set(user);
    this.deleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteModalOpen.set(false);
    this.userToDelete.set(undefined);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.deleting.set(true);
    this.usersService
      .deleteUser(user.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success('Usuário excluído com sucesso.');
          this.cancelDelete();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível excluir o usuário.'), 'Erro');
        },
      });
  }

  statusLabel(status: User['status']): string {
    return { Active: 'Ativo', Inactive: 'Inativo', Blocked: 'Bloqueado' }[status];
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private loadRoles(): void {
    this.rolesService
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (roles) => this.roles.set(roles),
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os perfis.'), 'Erro');
        },
      });
  }

  private loadUsers(): void {
    this.loading.set(true);

    this.usersService
      .getAllUsers()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.users.set(result);
        },
        error: (error: HttpErrorResponse) => {
          this.users.set([]);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os usuários.'), 'Erro');
        },
      });
  }
}
