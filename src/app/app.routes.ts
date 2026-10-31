import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './auth/guards/not-authenticated.guard';

export const routes: Routes = [
    {
        path: 'auth',
        canMatch: [noAuthGuard],
        loadChildren: () => import('./auth/auth.routes'),

    },
    {
        path: 'prestamo',
        canMatch: [authGuard],
        loadChildren: () => import('./prestamos/prestamo.routes'),

    },
    {
        path:'customers',
        canMatch: [authGuard],
        loadChildren: () => import('./customers/customers.route'),
    },
    {
    path: '',
    redirectTo: 'prestamo',
    pathMatch: 'full',
   },
   {
    path: '**',
    redirectTo: 'prestamo',
   }
];
