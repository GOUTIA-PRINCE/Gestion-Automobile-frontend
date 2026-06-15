import { Injectable, computed, inject } from '@angular/core';
import { StatDashboard, VehiculeResume, Alerte, EntretienResume, ConsommationMensuelle } from '../Modeles/dashboard';
import { VehiculesService } from './vehicules.service';
import { AlerteService } from './alerte.service';
import { MaintenanceService } from './maintenance.service';
import { CarburantService } from './carburant.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private vehiculesService = inject(VehiculesService);
  private alerteService = inject(AlerteService);
  private maintenanceService = inject(MaintenanceService);
  private carburantService = inject(CarburantService);

  constructor() {
    this.vehiculesService.loadVehicules();
  }

  stats = computed<StatDashboard>(() => {
    const vehicules = this.vehiculesService.vehicules();
    const pleins = this.carburantService.pleins();
    const entretiens = this.maintenanceService.entretiens();
    const alertes = this.alerteService.alertes();
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    return {
      totalVehicules: vehicules.length,
      vehiculesActifs: vehicules.filter(v => v.statut === 'actif').length,
      consommationMensuelle: pleins
        .filter(p => new Date(p.date) >= debutMois)
        .reduce((sum, p) => sum + (p.quantite || 0), 0),
      coutMaintenance: entretiens
        .filter(e => e.statut === 'termine' && e.dateFin && new Date(e.dateFin) >= debutMois)
        .reduce((sum, e) => sum + (e.coutReel || e.coutEstime || 0), 0),
      alertesEnCours: alertes.filter(a => a.statut === 'active').length,
      vehiculesEnPanne: vehicules.filter(v => v.statut === 'en_panne').length
    };
  });

  vehiculesResumes = computed<VehiculeResume[]>(() =>
    this.vehiculesService.vehicules().map(v => ({
      id: v.id,
      marque: v.marque,
      modele: v.modele,
      annee: v.annee,
      immatriculation: v.immatriculation,
      chauffeur: v.chauffeurNom || 'Non assigné',
      kilometrage: v.kilometrage || 0,
      statut: v.statut === 'en_maintenance' ? 'maintenance' : (v.statut as VehiculeResume['statut'])
    }))
  );

  alertes = computed<Alerte[]>(() =>
    this.alerteService.alertes().map(a => ({
      id: a.id,
      titre: a.titre,
      vehicule: a.vehiculeMarque ? `${a.vehiculeMarque} ${a.vehiculeModele}` : (a.chauffeurNom || 'Aucun véhicule'),
      immatriculation: a.vehiculeImmatriculation || '',
      date: a.dateEcheance || a.dateCreation,
      type: this.normalizeAlerteType(a.type),
      priorite: a.priorite === 'critique' ? 'haute' : a.priorite,
      description: a.description
    }))
  );

  entretiensResumes = computed<EntretienResume[]>(() =>
    this.maintenanceService.entretiens().slice(0, 4).map(e => ({
      id: e.id,
      titre: e.titre || e.type,
      statut: e.statut === 'annule' ? 'termine' : e.statut,
      vehicule: `${e.vehiculeMarque || ''} ${e.vehiculeModele || ''}`.trim(),
      immatriculation: e.vehiculeImmatriculation,
      description: e.description || '',
      date: e.datePlanifiee,
      cout: e.coutReel || e.coutEstime || 0
    }))
  );

  consommationData = computed<ConsommationMensuelle[]>(() =>
    this.carburantService.getEvolutionData().map(item => ({
      mois: item.mois,
      consommation: item.consommation
    }))
  );

  private normalizeAlerteType(type: string): Alerte['type'] {
    return ['assurance', 'revision', 'carte_grise', 'vidange'].includes(type)
      ? type as Alerte['type']
      : 'autre';
  }
}
