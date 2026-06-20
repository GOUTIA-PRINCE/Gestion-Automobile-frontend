import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToutesMissionsComponent } from './toutes-missions.component';

describe('ToutesMissionsComponent', () => {
  let component: ToutesMissionsComponent;
  let fixture: ComponentFixture<ToutesMissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToutesMissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToutesMissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
