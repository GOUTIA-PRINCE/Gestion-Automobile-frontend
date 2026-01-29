export interface Document {
  id: number;
  type: 'assurance' | 'carte_grise' | 'contrat' | 'facture' | 'maintenance' | 'permis' | 'autre';
  titre: string;
  description?: string;
  vehiculeId?: number;
  vehiculeImmatriculation?: string;
  vehiculeMarque?: string;
  vehiculeModele?: string;
  chauffeurId?: number;
  chauffeurNom?: string;
  dateCreation: Date;
  dateExpiration?: Date;
  dateMaj?: Date;
  taille: number; // en Ko
  extension: string;
  cheminFichier: string;
  statut: 'valide' | 'expire' | 'expirant' | 'invalide';
  categorie: 'vehicule' | 'chauffeur' | 'administratif' | 'financier';
  tags?: string[];
}