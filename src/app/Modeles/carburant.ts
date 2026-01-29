export interface Plein {
  id: number;
  date: Date;
  vehiculeId: number;
  vehiculeImmatriculation: string;
  vehiculeMarque: string;
  vehiculeModele: string;
  quantite: number; // en litres
  cout: number; // en FCFA
  prixParLitre: number;
  station: string;
  kilometrage: number;
  typeCarburant: 'Diesel' | 'Essence' | 'GPL';
  commentaire?: string;
}

export interface StatCarburant {
  consommationTotale: number;
  coutTotal: number;
  prixMoyen: number;
  vehicules: string[];
}

export interface EvolutionMensuelle {
  mois: string;
  consommation: number;
  cout: number;
}