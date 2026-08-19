import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs';
import { CreateUserDto, ResponseUserDto, RoleDto, UpdateUserDto } from '../../../../api/generated/models';
import { RolesService } from '../../../../api/generated/roles/roles.service';
import { UsersService } from '../../../../api/generated/users/users.service';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { Role } from '../../../../models/Role';
import { User } from '../../../../models/User';
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
      ? this.usersService.patchApiUsersId(user.id, payload as UpdateUserDto, 'application/json')
      : this.usersService.postApiUsers(payload as CreateUserDto, 'application/json');

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
      .deleteApiUsersId(user.id)
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
      .getApiRoles('application/json')
      .pipe(map((roles) => roles.map(this.toRole)), takeUntilDestroyed(this.destroyRef))
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
      .getApiUsers('application/json')
      .pipe(
        map((users) => users.map(this.toUser)),
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

  private readonly toRole = (role: RoleDto): Role => {
    const responseRole = role as RoleDto & { id?: number | string };
    return { id: String(responseRole.id ?? ''), name: role.name };
  };

  private readonly toUser = (user: ResponseUserDto): User => ({
    id: String(user.id ?? ''),
    email: user.email ?? '',
    name: user.name ?? '',
    status: user.status ?? 'Inactive',
    roleId: user.roleId === null || user.roleId === undefined ? undefined : String(user.roleId),
    role: {
      id: String(user.role?.id ?? user.roleId ?? ''),
      name: user.role?.name ?? '',
    },
  });
}
