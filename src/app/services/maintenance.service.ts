import { Injectable, signal } from '@angular/core';
import { Entretien, StatsMaintenance } from '../Modeles/maintenance';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
private entretiensData: Entretien[] = [
    {
      id: 1,
      vehiculeId: 1,
      vehiculeImmatriculation: 'LT 1234 A',
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      type: 'vidange',
      titre: 'Vidange',
      description: 'Vidange huile moteur + filtre',
      datePlanifiee: new Date('2024-01-20'),
      statut: 'planifie',
      coutEstime: 45000,
      kilometrageVehicule: 45000,
      prochainEntretienKm: 50000,
      fournisseur: 'Garage Toyota',
      notes: 'Huile synthétique 5W-30',
      urgence: 'moyenne'
    },
    {
      id: 2,
      vehiculeId: 2,
      vehiculeImmatriculation: 'CE 5678 B',
      vehiculeMarque: 'Mitsubishi',
      vehiculeModele: 'L200',
      type: 'revision',
      titre: 'Révision',
      description: 'Révision complète 60 000 km',
      datePlanifiee: new Date('2024-01-18'),
      statut: 'en_cours',
      coutEstime: 250000,
      kilometrageVehicule: 60000,
      fournisseur: 'Mitsubishi Service',
      notes: 'Changement des bougies, filtre à air, huile',
      urgence: 'elevee'
    },
    {
      id: 3,
      vehiculeId: 1,
      vehiculeImmatriculation: 'LT 1234 A',
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      type: 'reparation',
      titre: 'Réparation freins',
      description: 'Remplacement des disques et plaquettes de frein',
      datePlanifiee: new Date('2024-01-25'),
      dateDebut: new Date('2024-01-25'),
      statut: 'en_cours',
      coutEstime: 120000,
      kilometrageVehicule: 45500,
      fournisseur: 'Freins & Co',
      urgence: 'elevee'
    },
    {
      id: 4,
      vehiculeId: 3,
      vehiculeImmatriculation: 'LT 9012 C',
      vehiculeMarque: 'Ford',
      vehiculeModele: 'Ranger',
      type: 'pneus',
      titre: 'Pneus',
      description: 'Remplacement des 4 pneus',
      datePlanifiee: new Date('2024-01-15'),
      dateDebut: new Date('2024-01-15'),
      dateFin: new Date('2024-01-15'),
      statut: 'termine',
      coutEstime: 300000,
      coutReel: 320000,
      kilometrageVehicule: 32000,
      fournisseur: 'Pneu Express',
      urgence: 'moyenne'
    },
    {
      id: 5,
      vehiculeId: 2,
      vehiculeImmatriculation: 'CE 5678 B',
      vehiculeMarque: 'Mitsubishi',
      vehiculeModele: 'L200',
      type: 'autre',
      titre: 'Climatisation',
      description: 'Recharge climatisation',
      datePlanifiee: new Date('2024-02-10'),
      statut: 'planifie',
      coutEstime: 80000,
      kilometrageVehicule: 61000,
      fournisseur: 'Auto Clim',
      urgence: 'faible'
    }
  ];

  entretiens = signal<Entretien[]>(this.entretiensData);
  filtreStatut = signal<string>('tous');
  searchQuery = signal('');

  constructor() {}

  getStats(): StatsMaintenance {
    const entretiens = this.entretiens();
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    
    const planifies = entretiens.filter(e => e.statut === 'planifie').length;
    const enCours = entretiens.filter(e => e.statut === 'en_cours').length;
    const termines = entretiens.filter(e => e.statut === 'termine').length;
    
    const coutTotal = entretiens
      .filter(e => e.statut === 'termine' && e.dateFin && e.dateFin >= debutMois)
      .reduce((sum, e) => sum + (e.coutReel || e.coutEstime), 0);

    return { planifies, enCours, termines, coutTotal };
  }

  getFilteredEntretiens() {
    const filtre = this.filtreStatut();
    const query = this.searchQuery().toLowerCase();
    
    let filtered = this.entretiens();
    
    if (filtre !== 'tous') {
      filtered = filtered.filter(e => e.statut === filtre);
    }
    
    if (query) {
      filtered = filtered.filter(e =>
        e.titre.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.vehiculeImmatriculation.toLowerCase().includes(query) ||
        e.vehiculeMarque.toLowerCase().includes(query) ||
        e.vehiculeModele.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.datePlanifiee).getTime() - new Date(a.datePlanifiee).getTime()
    );
  }

  getStatutsCount() {
    const entretiens = this.entretiens();
    return {
      tous: entretiens.length,
      planifie: entretiens.filter(e => e.statut === 'planifie').length,
      en_cours: entretiens.filter(e => e.statut === 'en_cours').length,
      termine: entretiens.filter(e => e.statut === 'termine').length
    };
  }

  addEntretien(entretien: Omit<Entretien, 'id'>) {
    const newId = Math.max(...this.entretiens().map(e => e.id)) + 1;
    const newEntretien: Entretien = { ...entretien, id: newId };
    this.entretiens.update(list => [...list, newEntretien]);
  }

  updateEntretien(id: number, updatedEntretien: Partial<Entretien>) {
    this.entretiens.update(list =>
      list.map(entretien =>
        entretien.id === id ? { ...entretien, ...updatedEntretien } : entretien
      )
    );
  }

  deleteEntretien(id: number) {
    this.entretiens.update(list => list.filter(entretien => entretien.id !== id));
  }
}
