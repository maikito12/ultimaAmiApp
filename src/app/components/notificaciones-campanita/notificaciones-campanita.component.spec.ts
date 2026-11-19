import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionesCampanitaComponent } from './notificaciones-campanita.component';

describe('NotificacionesCampanitaComponent', () => {
  let component: NotificacionesCampanitaComponent;
  let fixture: ComponentFixture<NotificacionesCampanitaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionesCampanitaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificacionesCampanitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
