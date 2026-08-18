import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { InputComponent } from '../../../../components/shared/input/input';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../../components/shared/select/select';
import { AuthDirective } from '../../../../directives/auth.directive';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { User } from '../../../../models/User';
import { RolesService } from '../../../../services/domain/roles/roles.service';
import {
  CreateUserRequest,
  SortOrder,
  UpdateUserRequest,
  UserSortField,
} from '../../../../services/domain/users/user.interfaces';
import { UsersService } from '../../../../services/domain/users/users.service';
import { UsuarioModalComponent, UserFormSubmission } from './usuario-modal/usuario-modal';
import { usuariosStyles } from './usuarios.styles';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  host: { '[class]': 'styles.host' },
  imports: [
    AuthDirective,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    ReactiveFormsModule,
    SelectComponent,
    UsuarioModalComponent,
  ],
})
export class UsuariosComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly users = signal<User[]>([]);
  readonly roleOptions = signal<SelectOption[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly modalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly selectedUser = signal<User | undefined>(undefined);
  readonly userToDelete = signal<User | undefined>(undefined);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly sortField = signal<UserSortField>('Name');
  readonly sortOrder = signal<SortOrder>('asc');

  /*****************************************/
  /* Filtros e Opcoes                     */
  /*****************************************/
  readonly nameFilter = new FormControl('', { nonNullable: true });
  readonly roleFilter = new FormControl<number | null>(null);
  readonly pageSizeOptions: readonly SelectOption[] = [
    { label: '10 por página', value: 10 },
    { label: '25 por página', value: 25 },
    { label: '50 por página', value: 50 },
  ];

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));
  readonly visiblePages = computed(() => {
    const start = Math.max(1, Math.min(this.page() - 2, this.totalPages() - 4));
    const end = Math.min(this.totalPages(), start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });
  readonly rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.limit() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.limit(), this.total()));

  readonly styles = usuariosStyles;

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    this.loadRoles();
    this.loadUsers();

    this.nameFilter.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());

    this.roleFilter.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
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
          if (this.users().length === 1 && this.page() > 1) this.page.update((page) => page - 1);
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível excluir o usuário.'), 'Erro');
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) return;
    this.page.set(page);
    this.loadUsers();
  }

  changePageSize(value: SelectValue): void {
    if (typeof value !== 'number') return;
    this.limit.set(value);
    this.page.set(1);
    this.loadUsers();
  }

  statusLabel(status: User['status']): string {
    return { Active: 'Ativo', Inactive: 'Inativo', Blocked: 'Bloqueado' }[status];
  }

  toggleSort(field: UserSortField): void {
    if (this.sortField() === field) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }

    this.page.set(1);
    this.loadUsers();
  }

  sortIndicator(field: UserSortField): string {
    if (this.sortField() !== field) return '';
    return this.sortOrder() === 'asc' ? '↑' : '↓';
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private applyFilters(): void {
    this.page.set(1);
    this.loadUsers();
  }

  private loadRoles(): void {
    this.rolesService
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (roles) => this.roleOptions.set(roles.map((role) => ({ label: role.name, value: role.id }))),
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os perfis.'), 'Erro');
        },
      });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.usersService
      .getUsers(
        this.page(),
        this.limit(),
        this.nameFilter.value,
        this.roleFilter.value ?? undefined,
        this.sortField(),
        this.sortOrder(),
      )
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.users.set(result.data);
          this.total.set(result.total);
          this.page.set(result.page);
          this.limit.set(result.limit);
        },
        error: (error: HttpErrorResponse) => {
          this.users.set([]);
          this.total.set(0);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os usuários.'), 'Erro');
        },
      });
  }
}
