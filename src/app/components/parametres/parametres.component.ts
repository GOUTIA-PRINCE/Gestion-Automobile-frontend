import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Parametre } from '../../Modeles/parametre';
import { ParametreService } from '../../services/parametre.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-parametres',
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.css'
})
export class ParametresComponent {
  private parametreService = inject(ParametreService);
  private authService = inject(AuthService);

  searchQuery = this.parametreService.searchQuery;
  parametres = this.parametreService.filteredParametres;
  editionId = signal<number | null>(null);
  form = signal<Omit<Parametre, 'id'>>({
    cleParametre: '',
    valeur: '',
    description: '',
    categorie: 'general'
  });

  stats = computed(() => ({
    total: this.parametreService.parametres().length,
    categories: new Set(this.parametreService.parametres().map(p => p.categorie || 'general')).size
  }));

  readonly parametresGeneraux = [
    { cleParametre: 'nom_application', valeur: 'FleetPro', description: 'Nom affiche de l application', categorie: 'general' },
    { cleParametre: 'devise', valeur: 'FCFA', description: 'Devise utilisee pour les couts', categorie: 'finance' },
    { cleParametre: 'prix_litre_defaut', valeur: '700', description: 'Prix par litre propose par defaut', categorie: 'carburant' },
    { cleParametre: 'alerte_expiration_documents_jours', valeur: '30', description: 'Delai avant alerte document expirant', categorie: 'alertes' },
    { cleParametre: 'maintenance_rappel_km', valeur: '5000', description: 'Intervalle kilometrique de rappel maintenance', categorie: 'maintenance' }
  ];
  readonly groupesParametres = [
    {
      id: 'general',
      icon: 'bi-laptop',
      titre: 'General',
      description: 'Demarrer, fermer et preferences de base'
    },
    {
      id: 'profil',
      icon: 'bi-person-circle',
      titre: 'Profil',
      description: 'Nom, photo de profil et informations personnelles'
    },
    {
      id: 'compte',
      icon: 'bi-key',
      titre: 'Compte',
      description: 'Notifications de securite, informations de compte'
    },
    {
      id: 'confidentialite',
      icon: 'bi-lock',
      titre: 'Confidentialite',
      description: 'Acces, droits utilisateurs et sessions'
    }
  ];
  activeGroupe = signal(this.groupesParametres[0]);

  get canWrite(): boolean {
    return this.authService.hasPermission('parametres:write');
  }

  appliquerParametresGeneraux(): void {
    const clesExistantes = new Set(this.parametreService.parametres().map(p => p.cleParametre));
    this.parametresGeneraux
      .filter(p => !clesExistantes.has(p.cleParametre))
      .forEach(p => this.parametreService.addParametre(p));
  }

  handleEdit(parametre: Parametre): void {
    this.editionId.set(parametre.id);
    this.form.set({
      cleParametre: parametre.cleParametre,
      valeur: parametre.valeur,
      description: parametre.description || '',
      categorie: parametre.categorie || 'general'
    });
  }

  handleSubmit(): void {
    const data = this.form();
    if (!data.cleParametre || !data.valeur) return;

    const id = this.editionId();
    if (id) {
      this.parametreService.updateParametre(id, data);
    } else {
      this.parametreService.addParametre(data);
    }
    this.resetForm();
  }

  handleDelete(id: number): void {
    if (confirm('Supprimer ce parametre ?')) {
      this.parametreService.deleteParametre(id);
    }
  }

  resetForm(): void {
    this.editionId.set(null);
    this.form.set({
      cleParametre: '',
      valeur: '',
      description: '',
      categorie: 'general'
    });
  }

  updateField(field: keyof Omit<Parametre, 'id'>, value: string): void {
    this.form.update(current => ({ ...current, [field]: value }));
  }
}
