import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotemsAdminComponent } from './totems-admin.component';

describe('TotemsAdminComponent', () => {
  let component: TotemsAdminComponent;
  let fixture: ComponentFixture<TotemsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotemsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotemsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
