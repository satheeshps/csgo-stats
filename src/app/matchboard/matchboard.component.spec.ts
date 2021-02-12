import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchboardComponent } from './matchboard.component';

describe('MatchboardComponent', () => {
  let component: MatchboardComponent;
  let fixture: ComponentFixture<MatchboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
