import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SSEService {
  listen<T>(): Observable<T> {
    return new Observable<T>((subscriber) => {
      const eventSource = new EventSource(`${environment.apiBaseUrl}/events`, {
        withCredentials: true,
      });

      eventSource.onmessage = (event) => {
        subscriber.next(JSON.parse(event.data) as T);
      };

      eventSource.onerror = (error) => {
        subscriber.error(error);
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
