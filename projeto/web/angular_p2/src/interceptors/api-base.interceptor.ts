import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../environments/environment.development';

export const apiBaseInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const baseUrl = environment.apiBaseUrl;

  // console.log('apiBaseUrlInterceptor', baseUrl, req.url);
  const apiRequest = req.clone({
    url: `${baseUrl}${req.url}`,
    withCredentials: true,
    setHeaders: {
      'Content-Type': 'application/json',
      'app-origin': 'web',
    },
  });

  return next(apiRequest);
};
