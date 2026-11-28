import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunicacionProfesionalComponent } from './comunicacion-profesional.component';

describe('ComunicacionProfesionalComponent', () => {
  let component: ComunicacionProfesionalComponent;
  let fixture: ComponentFixture<ComunicacionProfesionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComunicacionProfesionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComunicacionProfesionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
