import { Routes } from '@angular/router';
import { VehiculesComponent } from './components/vehicules/vehicules.component';
import { ChauffeursComponent } from './components/chauffeurs/chauffeurs.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CarburantComponent } from './components/carburant/carburant.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { AlertesComponent } from './components/alertes/alertes.component';
import { ParametresComponent } from './components/parametres/parametres.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { ProfilComponent } from './components/profil/profil.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], data: { permissions: ['dashboard:read'] } },
  { path: 'vehicules', component: VehiculesComponent, canActivate: [authGuard], data: { permissions: ['vehicules:read'] } },
  { path: 'chauffeurs', component: ChauffeursComponent, canActivate: [authGuard], data: { permissions: ['chauffeurs:read'] } },
  { path: 'carburant', component: CarburantComponent, canActivate: [authGuard], data: { permissions: ['carburant:read'] } },
  { path: 'maintenance', component: MaintenanceComponent, canActivate: [authGuard], data: { permissions: ['maintenance:read'] } },
  { path: 'documents', component: DocumentsComponent, canActivate: [authGuard], data: { permissions: ['documents:read'] } },
  { path: 'alertes', component: AlertesComponent, canActivate: [authGuard], data: { permissions: ['alertes:read'] } },
  { path: 'parametres', component: ParametresComponent, canActivate: [authGuard], data: { permissions: ['parametres:read'] } },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard], data: { permissions: ['admin:read'] } },
  { path: 'profil', component: ProfilComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
