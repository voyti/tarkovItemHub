import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestsViewComponent } from './quests-view.component';

describe('QuestsViewComponent', () => {
  let component: QuestsViewComponent;
  let fixture: ComponentFixture<QuestsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
