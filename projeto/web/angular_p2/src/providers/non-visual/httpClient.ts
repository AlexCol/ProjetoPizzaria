import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiBaseInterceptor } from '../../interceptors/api-base.interceptor';

export const httpClientConfig = provideHttpClient(withInterceptors([apiBaseInterceptor]));
