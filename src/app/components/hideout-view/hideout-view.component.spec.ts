import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HideoutViewComponent } from './hideout-view.component';

describe('HideoutViewComponent', () => {
  let component: HideoutViewComponent;
  let fixture: ComponentFixture<HideoutViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HideoutViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HideoutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
