import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Jury } from './jury';

describe('Jury', () => {
  let component: Jury;
  let fixture: ComponentFixture<Jury>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jury]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Jury);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
