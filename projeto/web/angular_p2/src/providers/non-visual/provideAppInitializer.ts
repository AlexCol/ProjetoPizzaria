import { inject, provideAppInitializer } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

export const appInitializers = [
  provideAppInitializer(() => {
    return inject(AuthService).getMe();
  }),
];
