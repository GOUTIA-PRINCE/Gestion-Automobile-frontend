import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlerteService } from '../../services/alerte.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  auth = inject(AuthService);
  private alerteService = inject(AlerteService);

  alertesActives = computed(() =>
    this.alerteService.alertes().filter(alerte => alerte.statut === 'active').length
  );

  ngOnInit(): void {
    if (this.can('alertes:read')) {
      this.alerteService.loadAlertes();
    }
  }

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  logout(): void {
    this.auth.logout();
  }
}
