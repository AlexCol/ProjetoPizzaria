import { ApplicationConfig } from '@angular/core';
import { httpClientConfig } from '../providers/non-visual/httpClient';
import { appInitializers } from '../providers/non-visual/provideAppInitializer';
import { provideRouterConfig } from '../providers/non-visual/router';
import { toastConfig } from '../providers/visual/toast/toastr';

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
