import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmmoViewComponent } from './ammo-view.component';

describe('AmmoViewComponent', () => {
  let component: AmmoViewComponent;
  let fixture: ComponentFixture<AmmoViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmmoViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmmoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
