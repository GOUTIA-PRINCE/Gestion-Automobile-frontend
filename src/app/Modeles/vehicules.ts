// modeles/vehicules.ts
export interface Vehicules {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  typeVehicule: string;
  statut: 'actif' | 'en_maintenance' | 'en_panne' | 'retire';
  kilometrage: number;
  chauffeurId?: number;
  chauffeurNom?: string;
}
