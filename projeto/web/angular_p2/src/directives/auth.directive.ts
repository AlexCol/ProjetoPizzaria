import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStore } from '../stores/auth/auth.store';

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
  private authStore = inject(AuthStore);
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  // Indica se o template já foi renderizado, evitando elementos duplicados
  // quando o effect executar novamente e o usuário continuar autorizado.
  private hasView = false;

  constructor() {
    effect(() => {
      const permitedRoles = this.appAuth();
      const authorized = this.authStore.hasAnyRole(permitedRoles);

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
