import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlerteService } from '../../services/alerte.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private alerteService = inject(AlerteService);

  isDark = false;
  alertesActives = computed(() =>
    this.alerteService.alertes().filter(alerte => alerte.statut === 'active').length
  );

  ngOnInit(): void {
    if (this.auth.hasPermission('alertes:read')) {
      this.alerteService.loadAlertes();
    }
  }

  get pageTitle(): string {
    const route = this.router.url.split('/')[1]?.split('?')[0] || 'dashboard';
    if (route === 'missions' && this.auth.currentUser()?.typeUtilisateur === 'CHAUFFEUR') {
      return 'Mes missions';
    }
    const titles: Record<string, string> = {
      dashboard: 'Tableau de bord',
      vehicules: 'Véhicules',
      missions: 'Missions',
      chauffeurs: 'Chauffeurs',
      carburant: 'Carburant',
      maintenance: 'Maintenance',
      documents: 'Documents',
      alertes: 'Alertes',
      parametres: 'Paramètres',
      admin: 'Administration',
      profil: 'Mon profil'
    };
    return titles[route] || 'FleetPro';
  }

  get pageDescription(): string {
    if (this.router.url.startsWith('/missions')) {
      return this.auth.currentUser()?.typeUtilisateur === 'CHAUFFEUR'
        ? 'Vos affectations et votre historique'
        : 'Planification et suivi des déplacements';
    }
    return this.pageTitle === 'Tableau de bord'
      ? 'Vue d’ensemble de votre parc automobile'
      : 'Gestion du parc automobile';
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-mode', this.isDark);
  }

  initials(): string {
    const user = this.auth.currentUser();
    if (!user) return '';
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  }
}
