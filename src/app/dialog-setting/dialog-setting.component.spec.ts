import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSettingComponent } from './dialog-setting.component';

describe('DialogSettingComponent', () => {
  let component: DialogSettingComponent;
  let fixture: ComponentFixture<DialogSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
