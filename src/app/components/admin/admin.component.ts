import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../../Modeles/utilisateur';
import { UtilisateurService } from '../../services/utilisateur.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private utilisateurService = inject(UtilisateurService);

  utilisateurs = this.utilisateurService.utilisateurs;
  isFormOpen = signal(false);
  formData: Omit<Utilisateur, 'id'> = this.createEmptyForm();
  permissionsDisponibles = [
    { code: 'dashboard:read', label: 'Voir tableau de bord' },
    { code: 'vehicules:read', label: 'Voir vehicules' },
    { code: 'vehicules:write', label: 'Gerer vehicules' },
    { code: 'chauffeurs:read', label: 'Voir chauffeurs' },
    { code: 'chauffeurs:write', label: 'Gerer chauffeurs' },
    { code: 'carburant:read', label: 'Voir carburant' },
    { code: 'carburant:write', label: 'Enregistrer carburant' },
    { code: 'maintenance:read', label: 'Voir maintenance' },
    { code: 'maintenance:write', label: 'Planifier maintenance' },
    { code: 'documents:read', label: 'Voir documents' },
    { code: 'documents:write', label: 'Gerer documents' },
    { code: 'alertes:read', label: 'Voir alertes' },
    { code: 'alertes:write', label: 'Gerer alertes' },
    { code: 'parametres:read', label: 'Voir parametres' },
    { code: 'parametres:write', label: 'Gerer parametres' },
    { code: 'admin:read', label: 'Voir administration' },
    { code: 'admin:write', label: 'Gerer utilisateurs' }
  ];

  stats = computed(() => ({
    total: this.utilisateurs().length,
    actifs: this.utilisateurs().filter(u => u.statut === 'ACTIF').length,
    admins: this.utilisateurs().filter(u => u.typeUtilisateur === 'ADMINISTRATEUR').length
  }));

  handleAdd(): void {
    this.formData = this.createEmptyForm();
    this.applyPresetPermissions();
    this.isFormOpen.set(true);
  }

  handleSubmit(): void {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email) {
      alert('Veuillez renseigner nom, prenom et email');
      return;
    }
    this.utilisateurService.addUtilisateur(this.formData).subscribe({
      next: () => this.isFormOpen.set(false),
      error: err => alert(err?.error?.message || err?.message || 'Erreur creation utilisateur')
    });
  }

  handleDelete(id: number): void {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id).subscribe({
        error: err => alert(err?.error?.message || err?.message || 'Erreur suppression utilisateur')
      });
    }
  }

  applyPresetPermissions(): void {
    const presets: Record<string, string[]> = {
      ADMINISTRATEUR: this.permissionsDisponibles.map(p => p.code),
      GESTIONNAIRE: [
        'dashboard:read', 'vehicules:read', 'vehicules:write', 'chauffeurs:read',
        'carburant:read', 'carburant:write', 'maintenance:read', 'maintenance:write',
        'documents:read', 'documents:write', 'alertes:read', 'alertes:write'
      ],
      CHAUFFEUR: [
        'dashboard:read', 'vehicules:read', 'chauffeurs:read',
        'carburant:read', 'carburant:write', 'maintenance:read', 'maintenance:write',
        'documents:read', 'alertes:read'
      ],
      MAINTENANCIER: [
        'dashboard:read', 'vehicules:read', 'maintenance:read', 'maintenance:write',
        'documents:read', 'alertes:read'
      ]
    };
    this.formData.permissions = presets[this.formData.typeUtilisateur] || [];
  }

  togglePermission(permission: string, checked: boolean): void {
    const permissions = new Set(this.formData.permissions || []);
    checked ? permissions.add(permission) : permissions.delete(permission);
    this.formData.permissions = Array.from(permissions);
  }

  hasPermission(permission: string): boolean {
    return this.formData.permissions?.includes(permission) ?? false;
  }

  private createEmptyForm(): Omit<Utilisateur, 'id'> {
    return {
      typeUtilisateur: 'GESTIONNAIRE',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      statut: 'ACTIF',
      adresse: '',
      site: '',
      permissions: []
    };
  }
}
