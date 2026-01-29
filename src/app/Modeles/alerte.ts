export interface Alerte {
  id: number;
  type: 'assurance' | 'revision' | 'carte_grise' | 'vidange' | 'entretien' | 'pneu' | 'controle_technique' | 'autre';
  titre: string;
  description: string;
  vehiculeId: number;
  vehiculeMarque: string;
  vehiculeModele: string;
  vehiculeImmatriculation: string;
  dateCreation: Date;
  dateEcheance?: Date;
  statut: 'active' | 'resolue' | 'expiree';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  actionRequise: boolean;
  notes?: string;
}