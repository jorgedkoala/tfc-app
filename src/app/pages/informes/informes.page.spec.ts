import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformesPage } from './informes.page';

describe('InformesPage', () => {
  let component: InformesPage;
  let fixture: ComponentFixture<InformesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
