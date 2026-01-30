import { Injectable, signal } from '@angular/core';
import { Alerte } from '../Modeles/alerte';

@Injectable({
  providedIn: 'root'
})
export class AlerteService {
  private alertesData: Alerte[] = [
    {
      id: 1,
      type: 'assurance',
      titre: 'Assurance expire dans 10 jours',
      description: 'Le contrat d\'assurance arrive à expiration',
      vehiculeId: 4,
      vehiculeMarque: 'Ford',
      vehiculeModele: 'Ranger',
      vehiculeImmatriculation: 'CE 3456 D',
      dateCreation: new Date('2024-01-12'),
      dateEcheance: new Date('2024-01-25'),
      statut: 'active',
      priorite: 'haute',
      actionRequise: true,
      notes: 'Contrat avec AssurPlus'
    },
    {
      id: 2,
      type: 'revision',
      titre: 'Révision 60 000 km à effectuer',
      description: 'Révision technique obligatoire selon le plan d\'entretien',
      vehiculeId: 2,
      vehiculeMarque: 'Mitsubishi',
      vehiculeModele: 'L200',
      vehiculeImmatriculation: 'CE 5678 B',
      dateCreation: new Date('2024-01-10'),
      dateEcheance: new Date('2024-02-14'),
      statut: 'active',
      priorite: 'moyenne',
      actionRequise: true,
      notes: 'À effectuer chez Mitsubishi Service'
    },
    {
      id: 3,
      type: 'carte_grise',
      titre: 'Carte grise à renouveler',
      description: 'Certificat d\'immatriculation à mettre à jour',
      vehiculeId: 2,
      vehiculeMarque: 'Mitsubishi',
      vehiculeModele: 'L200',
      vehiculeImmatriculation: 'CE 5678 B',
      dateCreation: new Date('2024-01-08'),
      dateEcheance: new Date('2024-02-01'),
      statut: 'active',
      priorite: 'moyenne',
      actionRequise: true
    },
    {
      id: 4,
      type: 'vidange',
      titre: 'Vidange prévue dans 5 jours',
      description: 'Vidange d\'huile programmée selon le kilométrage',
      vehiculeId: 1,
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Hilux',
      vehiculeImmatriculation: 'LT 1234 A',
      dateCreation: new Date('2024-01-15'),
      dateEcheance: new Date('2024-01-20'),
      statut: 'active',
      priorite: 'basse',
      actionRequise: true,
      notes: 'Huile synthétique 5W-30'
    },
    {
      id: 5,
      type: 'controle_technique',
      titre: 'Contrôle technique expiré',
      description: 'Le contrôle technique a expiré le mois dernier',
      vehiculeId: 5,
      vehiculeMarque: 'Renault',
      vehiculeModele: 'Kangoo',
      vehiculeImmatriculation: 'LT 7890 E',
      dateCreation: new Date('2023-12-20'),
      dateEcheance: new Date('2023-12-15'),
      statut: 'expiree',
      priorite: 'haute',
      actionRequise: true
    },
    {
      id: 6,
      type: 'pneu',
      titre: 'Usure des pneus importante',
      description: 'Profondeur des sculptures inférieure à 3mm',
      vehiculeId: 6,
      vehiculeMarque: 'Peugeot',
      vehiculeModele: 'Partner',
      vehiculeImmatriculation: 'CE 1234 F',
      dateCreation: new Date('2024-01-05'),
      statut: 'active',
      priorite: 'moyenne',
      actionRequise: true
    },
    {
      id: 7,
      type: 'entretien',
      titre: 'Entretien climatisation',
      description: 'Entretien annuel du système de climatisation',
      vehiculeId: 3,
      vehiculeMarque: 'Toyota',
      vehiculeModele: 'Land Cruiser',
      vehiculeImmatriculation: 'LT 9012 C',
      dateCreation: new Date('2024-01-18'),
      dateEcheance: new Date('2024-03-01'),
      statut: 'active',
      priorite: 'basse',
      actionRequise: false
    },
    {
      id: 8,
      type: 'autre',
      titre: 'Document administratif manquant',
      description: 'Certificat de non-gage non fourni',
      vehiculeId: 4,
      vehiculeMarque: 'Ford',
      vehiculeModele: 'Ranger',
      vehiculeImmatriculation: 'CE 3456 D',
      dateCreation: new Date('2024-01-03'),
      statut: 'active',
      priorite: 'moyenne',
      actionRequise: true
    }
  ];

  alertes = signal<Alerte[]>(this.alertesData);
  filtreType = signal<string>('tous');
  filtreStatut = signal<string>('tous');
  searchQuery = signal('');

  constructor() {}

  getFilteredAlertes() {
    const type = this.filtreType();
    const statut = this.filtreStatut();
    const query = this.searchQuery().toLowerCase();
    
    let filtered = this.alertes();
    
    if (type !== 'tous') {
      filtered = filtered.filter(a => a.type === type);
    }
    
    if (statut !== 'tous') {
      filtered = filtered.filter(a => a.statut === statut);
    }
    
    if (query) {
      filtered = filtered.filter(a =>
        a.titre.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.vehiculeMarque.toLowerCase().includes(query) ||
        a.vehiculeModele.toLowerCase().includes(query) ||
        a.vehiculeImmatriculation.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
    );
  }

  getStats() {
    const alertes = this.alertes();
    const maintenant = new Date();
    const dansUneSemaine = new Date();
    dansUneSemaine.setDate(maintenant.getDate() + 7);
    
    const actives = alertes.filter(a => a.statut === 'active').length;
    const critiques = alertes.filter(a => 
      a.statut === 'active' && a.priorite === 'critique'
    ).length;
    const expirant = alertes.filter(a => 
      a.statut === 'active' && 
      a.dateEcheance && 
      a.dateEcheance <= dansUneSemaine &&
      a.dateEcheance >= maintenant
    ).length;
    const expirees = alertes.filter(a => a.statut === 'expiree').length;

    return { total: alertes.length, actives, critiques, expirant, expirees };
  }

  addAlerte(alerte: Omit<Alerte, 'id'>) {
    const newId = Math.max(...this.alertes().map(a => a.id)) + 1;
    const newAlerte: Alerte = { ...alerte, id: newId };
    this.alertes.update(list => [...list, newAlerte]);
  }

  updateAlerte(id: number, updatedAlerte: Partial<Alerte>) {
    this.alertes.update(list =>
      list.map(alerte =>
        alerte.id === id ? { ...alerte, ...updatedAlerte } : alerte
      )
    );
  }

  deleteAlerte(id: number) {
    this.alertes.update(list => list.filter(alerte => alerte.id !== id));
  }

  marquerCommeResolue(id: number) {
    this.updateAlerte(id, { statut: 'resolue', actionRequise: false });
  }

  getTypes() {
    const types = this.alertes().map(a => a.type);
    return ['tous', ...new Set(types)];
  }

  getStatuts() {
    const statuts = this.alertes().map(a => a.statut);
    return ['tous', ...new Set(statuts)];
  }
  
}