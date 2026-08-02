import { Routes } from '@angular/router';
import { loggedRoutes } from '../pages/logged/logged.routes';
import { notLoggedRoutes } from '../pages/not-logged/not-logged.routes';

export const routes: Routes = [notLoggedRoutes, loggedRoutes];
