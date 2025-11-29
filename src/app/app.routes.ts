import { Routes } from '@angular/router';
import { RegisterPage } from './register-page/register-page';
import { DashboardPage } from './dashboard-page/dashboard-page';
import { HomePage } from './home-page/home-page';
import { Explore } from './explore/explore';

export const routes: Routes = [
  { path: '', component: HomePage },
  {
    path: 'inscription',
    component: RegisterPage,
  },
  { path: 'dashboard', component: DashboardPage },
  {
    path: 'explorer',
    component: Explore,
  },
];
