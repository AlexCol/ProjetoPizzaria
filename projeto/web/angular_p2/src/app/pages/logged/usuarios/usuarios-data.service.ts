import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { Role } from '../../../../models/Role';
import { User } from '../../../../models/User';
import { RolesService } from '../../../../services/domain/roles/roles.service';
import { CreateUserRequest, UpdateUserRequest } from '../../../../services/domain/users/user.interfaces';
import { UsersService } from '../../../../services/domain/users/users.service';
import { UserFormSubmission } from './usuario-modal/usuario-modal';

@Injectable()
export class UsuariosDataService {
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  load(): void {
    this.loadRoles();
    this.loadUsers();
  }

  saveUser(user: User | undefined, payload: UserFormSubmission, onSuccess: () => void): void {
    const request = user
      ? this.usersService.updateUser(user.id, payload as UpdateUserRequest)
      : this.usersService.createUser(payload as CreateUserRequest);

    this.saving.set(true);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success(user ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.');
          onSuccess();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível salvar o usuário.'), 'Erro');
        },
      });
  }

  deleteUser(user: User, onSuccess: () => void): void {
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
          onSuccess();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível excluir o usuário.'), 'Erro');
        },
      });
  }

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
        next: (users) => this.users.set(users),
        error: (error: HttpErrorResponse) => {
          this.users.set([]);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os usuários.'), 'Erro');
        },
      });
  }
}
