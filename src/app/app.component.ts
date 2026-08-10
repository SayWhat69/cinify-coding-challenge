import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardData } from './models/appointment.model';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { TrendChartComponent } from './components/trend-chart/trend-chart.component';
import { DoctorUtilizationComponent } from './components/doctor-utilization/doctor-utilization.component';
import { TreatmentTypesComponent } from './components/treatment-types/treatment-types.component';
import { DataQualityBannerComponent } from './components/data-quality-banner/data-quality-banner.component';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    TrendChartComponent,
    DoctorUtilizationComponent,
    TreatmentTypesComponent,
    DataQualityBannerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  // TODO: replace with real, processed data (e.g. via @Input or a dedicated service)
  constructor(private dataService: DataService) {}
  public data?: DashboardData;

  ngOnInit(): void {
    this.dataService.loadData().subscribe((data) => this.data = data);
  }
}
