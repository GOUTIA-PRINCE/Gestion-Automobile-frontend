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

  stats = computed(() => ({
    total: this.utilisateurs().length,
    actifs: this.utilisateurs().filter(u => u.statut === 'ACTIF').length,
    admins: this.utilisateurs().filter(u => u.typeUtilisateur === 'ADMINISTRATEUR').length
  }));

  handleAdd(): void {
    this.formData = this.createEmptyForm();
    this.isFormOpen.set(true);
  }

  handleSubmit(): void {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email) {
      alert('Veuillez renseigner nom, prenom et email');
      return;
    }
    this.utilisateurService.addUtilisateur(this.formData);
    this.isFormOpen.set(false);
  }

  handleDelete(id: number): void {
    if (confirm('Supprimer cet utilisateur ?')) {
      this.utilisateurService.deleteUtilisateur(id);
    }
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
      site: ''
    };
  }
}
