import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Directive({
  selector: '[appAuth]',
})
export class AuthDirective {
  /*****************************/
  /* Inputs                    */
  /*****************************/
  readonly appAuth = input.required<readonly string[]>();

  /*****************************/
  /* Properties                */
  /*****************************/
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  // Indica se o template já foi renderizado, evitando elementos duplicados
  // quando o effect executar novamente e o usuário continuar autorizado.
  private hasView = false;

  constructor() {
    effect(() => {
      const permitedRoles = this.appAuth();
      const authorized = this.authService.hasAnyRole(permitedRoles);

      if (authorized && !this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!authorized && this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    });
  }
}
