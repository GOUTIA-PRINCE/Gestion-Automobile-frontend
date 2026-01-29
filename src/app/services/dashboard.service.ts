import { Injectable, signal, computed } from '@angular/core';
import { StatDashboard, VehiculeResume, Alerte, EntretienResume, ConsommationMensuelle } from '../Modeles/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Statistiques
  stats = signal<StatDashboard>({
    totalVehicules: 6,
    vehiculesActifs: 4,
    consommationMensuelle: 370,
    coutMaintenance: 1580000,
    alertesEnCours: 4,
    vehiculesEnPanne: 1
  });

  // Véhicules résumés
  vehiculesResumes = signal<VehiculeResume[]>([
    {
      id: 1,
      marque: 'Toyota',
      modele: 'Hilux',
      annee: 2022,
      immatriculation: 'LT 1234 A',
      chauffeur: 'Jean-Pierre Nguema',
      kilometrage: 45000,
      statut: 'actif'
    },
    {
      id: 2,
      marque: 'Mitsubishi',
      modele: 'L200',
      annee: 2021,
      immatriculation: 'CE 5678 B',
      chauffeur: 'Marie Fotso',
      kilometrage: 62000,
      statut: 'actif'
    },
    {
      id: 3,
      marque: 'Toyota',
      modele: 'Land Cruiser',
      annee: 2023,
      immatriculation: 'LT 9012 C',
      chauffeur: 'Non assigné',
      kilometrage: 15000,
      statut: 'actif'
    },
    {
      id: 4,
      marque: 'Ford',
      modele: 'Ranger',
      annee: 2020,
      immatriculation: 'CE 3456 D',
      chauffeur: 'Samuel Mbappe',
      kilometrage: 38000,
      statut: 'en_panne'
    },
    {
      id: 5,
      marque: 'Renault',
      modele: 'Kangoo',
      annee: 2019,
      immatriculation: 'LT 7890 E',
      chauffeur: 'Amina Kouam',
      kilometrage: 75000,
      statut: 'actif'
    },
    {
      id: 6,
      marque: 'Peugeot',
      modele: 'Partner',
      annee: 2021,
      immatriculation: 'CE 1234 F',
      chauffeur: 'Non assigné',
      kilometrage: 30000,
      statut: 'maintenance'
    }
  ]);

  // Alertes
  alertes = signal<Alerte[]>([
    {
      id: 1,
      titre: 'Assurance expire dans 10 jours',
      vehicule: 'Ford Ranger',
      immatriculation: 'CE 3456 D',
      date: new Date('2024-01-15'),
      type: 'assurance',
      priorite: 'haute',
      description: 'Le contrat d\'assurance arrive à expiration'
    },
    {
      id: 2,
      titre: 'Révision 60000 km à effectuer',
      vehicule: 'Mitsubishi L200',
      immatriculation: 'CE 5678 B',
      date: new Date('2024-01-14'),
      type: 'revision',
      priorite: 'moyenne',
      description: 'Révision technique obligatoire'
    },
    {
      id: 3,
      titre: 'Carte grise à renouveler',
      vehicule: 'Mitsubishi L200',
      immatriculation: 'CE 5678 B',
      date: new Date('2024-01-12'),
      type: 'carte_grise',
      priorite: 'moyenne',
      description: 'Certificat d\'immatriculation à mettre à jour'
    },
    {
      id: 4,
      titre: 'Vidange prévue dans 5 jours',
      vehicule: 'Toyota Hilux',
      immatriculation: 'LT 1234 A',
      date: new Date('2024-01-20'),
      type: 'vidange',
      priorite: 'basse',
      description: 'Vidange d\'huile programmée'
    }
  ]);

  // Entretiens à venir
  entretiensResumes = signal<EntretienResume[]>([
    {
      id: 1,
      titre: 'Vidange',
      statut: 'planifie',
      vehicule: 'Toyota Hilux',
      immatriculation: 'LT 1234 A',
      description: 'Vidange huile moteur + filtre',
      date: new Date('2024-01-20'),
      cout: 45000
    },
    {
      id: 2,
      titre: 'Révision',
      statut: 'en_cours',
      vehicule: 'Mitsubishi L200',
      immatriculation: 'CE 5678 B',
      description: 'Révision complète 60 000 km',
      date: new Date('2024-01-18'),
      cout: 250000
    }
  ]);

  // Données de consommation mensuelle
  consommationData = signal<ConsommationMensuelle[]>([
    { mois: 'Juil', consommation: 320 },
    { mois: 'Août', consommation: 350 },
    { mois: 'Sep', consommation: 380 },
    { mois: 'Oct', consommation: 360 },
    { mois: 'Nov', consommation: 390 },
    { mois: 'Déc', consommation: 420 },
    { mois: 'Jan', consommation: 370 }
  ]);

  // Calculer les statistiques d'état - CORRECTION ICI
  // statsEtat était défini comme une fonction, mais nous voulons une computed
  statsEtat = computed(() => {
    const vehicules = this.vehiculesResumes();
    return {
      actifs: vehicules.filter(v => v.statut === 'actif').length,
      enPanne: vehicules.filter(v => v.statut === 'en_panne').length,
      maintenance: vehicules.filter(v => v.statut === 'maintenance').length
    };
  });

  constructor() {}
}