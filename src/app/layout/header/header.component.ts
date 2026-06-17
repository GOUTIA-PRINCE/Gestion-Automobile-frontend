import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
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

  isDark = false;
  alertesActives = computed(() =>
    this.alerteService.alertes().filter(alerte => alerte.statut === 'active').length
  );

  ngOnInit(): void {
    if (this.auth.hasPermission('alertes:read')) {
      this.alerteService.loadAlertes();
    }
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
