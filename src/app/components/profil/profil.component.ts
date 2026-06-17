import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Utilisateur } from '../../Modeles/utilisateur';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent {
  auth = inject(AuthService);
  activeTab = signal<'personnel' | 'contact' | 'securite' | 'droits'>('personnel');
  isEditing = signal(false);
  showPassword = signal(false);
  message = signal<string | null>(null);
  formData: Partial<Utilisateur> = {};

  constructor() {
    this.resetForm();
  }

  resetForm(): void {
    const user = this.auth.currentUser();
    this.formData = user ? { ...user, password: '' } : {};
  }

  startEdit(): void {
    this.resetForm();
    this.isEditing.set(true);
    this.message.set(null);
  }

  cancelEdit(): void {
    this.resetForm();
    this.isEditing.set(false);
  }

  save(): void {
    this.auth.updateProfil(this.formData).subscribe({
      next: updated => {
        this.auth.refreshCurrentUser(updated);
        this.formData = { ...updated, password: '' };
        this.isEditing.set(false);
        this.message.set('Profil mis a jour');
      },
      error: err => this.message.set(err?.error?.message || err?.message || 'Mise a jour impossible')
    });
  }

  initials(user: Utilisateur): string {
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  }
}
