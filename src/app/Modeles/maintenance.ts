export interface Entretien {
  id: number;
  vehiculeId: number;
  vehiculeImmatriculation: string;
  vehiculeMarque: string;
  vehiculeModele: string;
  type: 'vidange' | 'revision' | 'reparation' | 'pneus' | 'autre';
  titre: string;
  description: string;
  datePlanifiee: Date;
  dateDebut?: Date;
  dateFin?: Date;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  coutEstime: number;
  coutReel?: number;
  kilometrageVehicule: number;
  prochainEntretienKm?: number;
  fournisseur?: string;
  notes?: string;
  urgence: 'faible' | 'moyenne' | 'elevee';
}

export interface StatsMaintenance {
  planifies: number;
  enCours: number;
  termines: number;
  coutTotal: number;
}