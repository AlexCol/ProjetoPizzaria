import { inject, provideAppInitializer } from '@angular/core';
import { AuthStore } from '../../../stores/auth/auth.store';

export const appInitializers = [
  provideAppInitializer(() => {
    return inject(AuthStore).initialize();
  }),
];
