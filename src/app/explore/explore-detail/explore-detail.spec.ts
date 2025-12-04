import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreDetail } from './explore-detail';

describe('ExploreDetail', () => {
  let component: ExploreDetail;
  let fixture: ComponentFixture<ExploreDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
