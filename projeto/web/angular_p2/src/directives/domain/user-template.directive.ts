import { Directive, inject, TemplateRef } from '@angular/core';
import { User } from '../../models/User';

interface UserTemplateContext {
  $implicit: User;
}

@Directive({
  selector: 'ng-template[appUserTemplate]',
  standalone: true,
})
export class UserTemplateDirective {
  readonly templateRef = inject(TemplateRef<UserTemplateContext>);

  static ngTemplateContextGuard(directive: UserTemplateDirective, context: unknown): context is UserTemplateContext {
    return true;
  }
}
