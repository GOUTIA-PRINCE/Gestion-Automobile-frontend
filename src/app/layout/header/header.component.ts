import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  private alerteService = inject(AlerteService);
  private platformId = inject(PLATFORM_ID);

  isDark = false;
  alertesActives = computed(() =>
    this.alerteService.alertes().filter(alerte => alerte.statut === 'active').length
  );

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-bs-theme', this.isDark ? 'dark' : 'light');
    }

    if (this.auth.hasPermission('alertes:read')) {
      this.alerteService.loadAlertes();
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-bs-theme', this.isDark ? 'dark' : 'light');
    }
  }

  initials(): string {
    const user = this.auth.currentUser();
    if (!user) return '';
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  }
}