import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mission, MissionOptions, PlanifierMission, StatutMission } from '../../Modeles/mission';
import { AuthService } from '../../services/auth.service';
import { MissionService } from '../../services/mission.service';

@Component({
  selector: 'app-missions',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './missions.component.html',
  styleUrl: './missions.component.css'
})
export class MissionsComponent implements OnInit {
  private readonly missionService = inject(MissionService);
  readonly auth = inject(AuthService);
  readonly missions = signal<Mission[]>([]);
  readonly options = signal<MissionOptions>({ chauffeurs: [], vehicules: [] });
  readonly isLoading = signal(true);
  readonly isFormOpen = signal(false);
  readonly isFilterPanelOpen = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal<'TOUTES' | StatutMission>('TOUTES');
  readonly search = signal('');
  readonly chauffeurFilter = signal<number | null>(null);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly groupBy = signal<'none' | 'chauffeur' | 'statut' | 'date'>('none');
  readonly editingMissionId = signal<number | null>(null);
  readonly form = signal<PlanifierMission>(this.emptyForm());

  readonly isDriver = computed(() => this.auth.currentUser()?.typeUtilisateur === 'CHAUFFEUR');
  readonly canWrite = computed(() => this.auth.hasPermission('missions:write') && !this.isDriver());
  readonly chauffeurFilters = computed(() => {
    const drivers = new Map<number, string>();
    this.missions().forEach(mission => {
      drivers.set(mission.chauffeurId, `${mission.chauffeurPrenom} ${mission.chauffeurNom}`.trim());
    });
    return Array.from(drivers, ([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  });
  readonly activeFilterCount = computed(() =>
    Number(this.filter() !== 'TOUTES')
    + Number(this.chauffeurFilter() !== null)
    + Number(Boolean(this.dateFrom()))
    + Number(Boolean(this.dateTo()))
  );
  readonly visibleMissions = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.filter();
    const chauffeurId = this.chauffeurFilter();
    const from = this.dateFrom() ? new Date(`${this.dateFrom()}T00:00:00`).getTime() : null;
    const to = this.dateTo() ? new Date(`${this.dateTo()}T23:59:59.999`).getTime() : null;
    return this.missions().filter(mission => {
      const matchesStatus = filter === 'TOUTES' || mission.statut === filter;
      const matchesDriver = chauffeurId === null || mission.chauffeurId === chauffeurId;
      const missionStart = new Date(mission.datePrevueDebut || mission.dateDebut || '').getTime();
      const matchesFrom = from === null || missionStart >= from;
      const matchesTo = to === null || missionStart <= to;
      const matchesSearch = !query || [mission.immatriculation, mission.marque, mission.modele,
        mission.chauffeurNom, mission.chauffeurPrenom, mission.pointDepart, mission.pointArrivee]
        .some(value => value?.toLowerCase().includes(query));
      return matchesStatus && matchesDriver && matchesFrom && matchesTo && matchesSearch;
    });
  });
  readonly missionGroups = computed(() => {
    const groupBy = this.groupBy();
    const groups = new Map<string, Mission[]>();
    for (const mission of this.visibleMissions()) {
      const key = this.groupKey(mission, groupBy);
      groups.set(key, [...(groups.get(key) || []), mission]);
    }
    return Array.from(groups, ([key, missions]) => ({ key, missions }));
  });
  readonly stats = computed(() => ({
    total: this.missions().length,
    planifiees: this.missions().filter(mission => mission.statut === 'PLANIFIE').length,
    enCours: this.missions().filter(mission => mission.statut === 'EN_COURS').length,
    terminees: this.missions().filter(mission => mission.statut === 'TERMINE').length
  }));

  ngOnInit(): void {
    this.loadMissions();
    if (this.canWrite()) {
      this.missionService.getOptions().subscribe({
        next: options => this.options.set(options),
        error: error => this.showError(error)
      });
    }
  }

  loadMissions(): void {
    this.isLoading.set(true);
    const request = this.isDriver() ? this.missionService.getMine() : this.missionService.getAll();
    request.subscribe({
      next: missions => {
        this.missions.set(missions);
        this.isLoading.set(false);
        this.error.set(null);
      },
      error: error => {
        this.showError(error);
        this.isLoading.set(false);
      }
    });
  }

  openForm(): void {
    this.editingMissionId.set(null);
    this.form.set(this.emptyForm());
    this.error.set(null);
    this.isFormOpen.set(true);
  }

  openEdit(mission: Mission): void {
    if (!this.canEditMission(mission)) return;
    this.editingMissionId.set(mission.id);
    this.error.set(null);
    this.form.set({
      vehiculeId: mission.vehiculeId,
      chauffeurId: mission.chauffeurId,
      pointDepart: mission.pointDepart,
      pointArrivee: mission.pointArrivee,
      datePrevueDebut: this.toDateTimeLocal(mission.datePrevueDebut),
      datePrevueFin: this.toDateTimeLocal(mission.datePrevueFin)
    });
    this.isFormOpen.set(true);
  }

  canEditMission(mission: Mission): boolean {
    return this.canWrite() && mission.statut === 'PLANIFIE';
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingMissionId.set(null);
    this.error.set(null);
  }

  clearFilters(): void {
    this.filter.set('TOUTES');
    this.chauffeurFilter.set(null);
    this.dateFrom.set('');
    this.dateTo.set('');
    this.groupBy.set('none');
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen.update(isOpen => !isOpen);
  }

  submit(): void {
    const mission = this.form();
    if (!mission.vehiculeId || !mission.chauffeurId || !mission.pointDepart.trim()
      || !mission.pointArrivee.trim() || !mission.datePrevueDebut || !mission.datePrevueFin) {
      this.error.set('Renseignez le véhicule, le chauffeur, le trajet et les dates prévues.');
      return;
    }
    if (new Date(mission.datePrevueDebut) >= new Date(mission.datePrevueFin)) {
      this.error.set('La date de fin doit être après la date de début.');
      return;
    }
    const missionId = this.editingMissionId();
    const request = missionId === null
      ? this.missionService.create(mission)
      : this.missionService.update(missionId, mission);
    request.subscribe({
      next: saved => {
        this.missions.update(missions => missionId === null
          ? [...missions, saved]
          : missions.map(item => item.id === missionId ? saved : item));
        this.closeForm();
        this.error.set(null);
      },
      error: error => this.showError(error)
    });
  }

  start(mission: Mission): void {
    this.missionService.start(mission.id).subscribe({ next: () => this.loadMissions(), error: error => this.showError(error) });
  }

  finish(mission: Mission): void {
    this.missionService.finish(mission.id).subscribe({ next: () => this.loadMissions(), error: error => this.showError(error) });
  }

  cancel(mission: Mission): void {
    if (!confirm(`Annuler la mission ${mission.id} ?`)) return;
    this.missionService.cancel(mission.id).subscribe({ next: () => this.loadMissions(), error: error => this.showError(error) });
  }

  setFormValue(field: keyof PlanifierMission, value: string): void {
    const numericFields: Array<keyof PlanifierMission> = ['vehiculeId', 'chauffeurId'];
    this.form.update(form => ({ ...form, [field]: numericFields.includes(field) ? Number(value) : value }));
  }

  statusLabel(status: StatutMission): string {
    return ({ PLANIFIE: 'Planifiée', EN_COURS: 'En cours', TERMINE: 'Terminée', ANNULE: 'Annulée' })[status];
  }

  groupLabel(key: string): string {
    return key;
  }

  private groupKey(mission: Mission, groupBy: 'none' | 'chauffeur' | 'statut' | 'date'): string {
    if (groupBy === 'chauffeur') return `${mission.chauffeurPrenom} ${mission.chauffeurNom}`.trim();
    if (groupBy === 'statut') return this.statusLabel(mission.statut);
    if (groupBy === 'date') {
      const date = mission.datePrevueDebut || mission.dateDebut;
      return date ? new Date(date).toLocaleDateString('fr-FR') : 'Date non définie';
    }
    return 'Missions';
  }

  private toDateTimeLocal(value: string | null): string {
    return value ? value.slice(0, 16) : '';
  }

  private showError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      this.error.set(error.error?.message || `Erreur HTTP ${error.status}.`);
      return;
    }
    this.error.set(error instanceof Error ? error.message : 'Une erreur est survenue.');
  }

  private emptyForm(): PlanifierMission {
    return { vehiculeId: 0, chauffeurId: 0, pointDepart: '', pointArrivee: '', datePrevueDebut: '', datePrevueFin: '' };
  }
}
