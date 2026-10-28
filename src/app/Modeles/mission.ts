export type StatutMission = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export interface Mission {
  id: number;
  vehiculeId: number;
  immatriculation: string;
  marque: string;
  modele: string;
  chauffeurId: number;
  chauffeurNom: string;
  chauffeurPrenom: string;
  pointDepart: string;
  pointArrivee: string;
  datePrevueDebut: string | null;
  datePrevueFin: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  statut: StatutMission;
}

export interface MissionOptions {
  chauffeurs: Array<{ id: number; nom: string; prenom: string; disponible: boolean }>;
  vehicules: Array<{ id: number; immatriculation: string; marque: string; modele: string; statut: string }>;
}

export interface PlanifierMission {
  vehiculeId: number;
  chauffeurId: number;
  pointDepart: string;
  pointArrivee: string;
  datePrevueDebut: string;
  datePrevueFin: string;
}
