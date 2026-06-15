export interface Alerte {
  id: number;
  type: 'assurance' | 'revision' | 'carte_grise' | 'vidange' | 'entretien' | 'pneu' | 'controle_technique' | 'permis' | 'autre';
  titre: string;
  description: string;
  vehiculeId?: number;
  vehiculeMarque?: string;
  vehiculeModele?: string;
  vehiculeImmatriculation?: string;
  chauffeurId?: number;
  chauffeurNom?: string;
  dateCreation: Date;
  dateEcheance?: Date;
  statut: 'active' | 'resolue' | 'expiree';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  actionRequise: boolean;
  notes?: string;
}
