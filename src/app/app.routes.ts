import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { VehiculesComponent } from './components/vehicules/vehicules.component';
import { ChauffeursComponent } from './components/chauffeurs/chauffeurs.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CarburantComponent } from './components/carburant/carburant.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { AlertesComponent } from './components/alertes/alertes.component';

export const routes: Routes = [
    {path:'dashboard',component:DashboardComponent},
    {path:'vehicules',component:VehiculesComponent},
    {path:'chauffeurs',component:ChauffeursComponent}, 
    {path:'carburant',component:CarburantComponent},
    {path:'maintenance',component:MaintenanceComponent},
    {path:'documents',component:DocumentsComponent},
    {path:'alertes',component:AlertesComponent},
    // rediriger toutes les autres routes vers le tableau de bord
    { path: '**', redirectTo: 'dashboard' }
      
];
