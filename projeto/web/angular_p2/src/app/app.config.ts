import { ApplicationConfig } from '@angular/core';
import { toastConfig } from './providers/visual/toast/toastr';
import { provideRouterConfig } from './providers/non-visual/router';
import { httpClientConfig } from './providers/non-visual/httpClient';
import { appInitializers } from './providers/non-visual/provideAppInitializer';

export const appConfig: ApplicationConfig = {
  providers: [
    //...injectionTokens,
    //provideBrowserGlobalErrorListeners(),
    toastConfig,
    provideRouterConfig,
    httpClientConfig,
    ...appInitializers,
  ],
};
