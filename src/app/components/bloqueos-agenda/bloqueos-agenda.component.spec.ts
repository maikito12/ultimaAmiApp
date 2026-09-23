import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloqueosAgendaComponent } from './bloqueos-agenda.component';

describe('BloqueosAgendaComponent', () => {
  let component: BloqueosAgendaComponent;
  let fixture: ComponentFixture<BloqueosAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloqueosAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloqueosAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
