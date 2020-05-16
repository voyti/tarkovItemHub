import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarterViewComponent } from './barter-view.component';

describe('BarterViewComponent', () => {
  let component: BarterViewComponent;
  let fixture: ComponentFixture<BarterViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarterViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarterViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
