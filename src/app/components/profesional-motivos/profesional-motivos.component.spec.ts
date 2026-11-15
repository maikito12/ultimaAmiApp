import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalMotivosComponent } from './profesional-motivos.component';

describe('ProfesionalMotivosComponent', () => {
  let component: ProfesionalMotivosComponent;
  let fixture: ComponentFixture<ProfesionalMotivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalMotivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesionalMotivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
