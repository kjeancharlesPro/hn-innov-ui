import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Periode } from './periode';

describe('Periode', () => {
  let component: Periode;
  let fixture: ComponentFixture<Periode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Periode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Periode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
