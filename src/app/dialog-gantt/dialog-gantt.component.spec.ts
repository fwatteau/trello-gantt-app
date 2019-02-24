import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGanttComponent } from './dialog-gantt.component';

describe('DialogGanttComponent', () => {
  let component: DialogGanttComponent;
  let fixture: ComponentFixture<DialogGanttComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogGanttComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGanttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
