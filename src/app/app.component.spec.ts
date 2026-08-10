import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { AppointmentDataResponse } from './models/appointment.model';

const ASSET_URL = 'assets/termindaten.json';

const MOCK_RESPONSE: AppointmentDataResponse = {
  practice: 'Hausarztpraxis am Stadtpark',
  period: { from: '2024-01-01', to: '2024-01-02' },
  opening_hours_note: 'Mo-Fr 08:00-18:00',
  appointments: [
    {
      appointment_id: 'A-1',
      date: '2024-01-01T09:00:00',
      duration_minutes: 30,
      treatment_type: 'EKG',
      doctor: 'Dr. A',
      status: 'attended',
      new_patient: false,
    },
  ],
};

describe('AppComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the practice name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    httpMock.expectOne(ASSET_URL).flush(MOCK_RESPONSE);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(fixture.componentInstance.data?.practice);
  });
});
