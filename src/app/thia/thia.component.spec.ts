import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThiaComponent } from './thia.component';

describe('ThiaComponent', () => {
  let component: ThiaComponent;
  let fixture: ComponentFixture<ThiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
