import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteVehiculesComponent } from './carte-vehicules.component';

describe('CarteVehiculesComponent', () => {
  let component: CarteVehiculesComponent;
  let fixture: ComponentFixture<CarteVehiculesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteVehiculesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarteVehiculesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
