export interface StatDashboard {
  totalVehicules: number;
  vehiculesActifs: number;
  consommationMensuelle: number;
  coutMaintenance: number;
  alertesEnCours: number;
  vehiculesEnPanne: number;
}

export interface VehiculeResume {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  chauffeur: string;
  kilometrage: number;
  statut: 'actif' | 'en_panne' | 'maintenance';
}

export interface Alerte {
  id: number;
  titre: string;
  vehicule: string;
  immatriculation: string;
  date: Date;
  type: 'assurance' | 'revision' | 'carte_grise' | 'vidange' | 'autre';
  priorite: 'basse' | 'moyenne' | 'haute';
  description?: string;
}

export interface EntretienResume {
  id: number;
  titre: string;
  statut: 'planifie' | 'en_cours' | 'termine';
  vehicule: string;
  immatriculation: string;
  description: string;
  date: Date;
  cout: number;
}

export interface ConsommationMensuelle {
  mois: string;
  consommation: number;
}