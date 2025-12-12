import { Routes } from '@angular/router';
import { RegisterPage } from './features/register-page/register-page';
import { DashboardPage } from './features/dashboard-page/dashboard-page';
import { HomePage } from './features/home-page/home-page';
import { SubjectPage } from './features/subject-page/subject-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  {
    path: 'inscription',
    component: RegisterPage,
  },
  {
    path: 'reglement',
    loadComponent: () => import('./features/rules/rules').then((m) => m.Rules),
  },
  { path: 'dashboard', component: DashboardPage },
  { path: 'boite-a-idees', component: SubjectPage },
  { path: '**', redirectTo: '' },
];
