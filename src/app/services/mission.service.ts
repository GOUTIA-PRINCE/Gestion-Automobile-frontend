import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Mission, MissionOptions, PlanifierMission } from '../Modeles/mission';

@Injectable({ providedIn: 'root' })
export class MissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/missions';

  getAll() {
    return this.http.get<Mission[]>(this.apiUrl);
  }

  getMine() {
    return this.http.get<Mission[]>(`${this.apiUrl}/mes`);
  }

  getOptions() {
    return this.http.get<MissionOptions>(`${this.apiUrl}/options`);
  }

  create(mission: PlanifierMission) {
    return this.http.post<Mission>(this.apiUrl, mission);
  }

  update(id: number, mission: PlanifierMission) {
    return this.http.put<Mission>(`${this.apiUrl}/${id}`, mission);
  }

  start(id: number) {
    return this.http.put<Mission>(`${this.apiUrl}/${id}/declencher`, {});
  }

  finish(id: number) {
    return this.http.put<Mission>(`${this.apiUrl}/${id}/terminer`, {});
  }

  cancel(id: number) {
    return this.http.put<Mission>(`${this.apiUrl}/${id}/annuler`, {});
  }
}
