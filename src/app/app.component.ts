import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardDaten } from './models/termin.model';
import { MOCK_DASHBOARD_DATEN } from './mock/mock-daten';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { TrendChartComponent } from './components/trend-chart/trend-chart.component';
import { ArztAuslastungComponent } from './components/arzt-auslastung/arzt-auslastung.component';
import { BehandlungsartenComponent } from './components/behandlungsarten/behandlungsarten.component';
import { DataQualityBannerComponent } from './components/data-quality-banner/data-quality-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    TrendChartComponent,
    ArztAuslastungComponent,
    BehandlungsartenComponent,
    DataQualityBannerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // TODO: durch echte, aufbereitete Daten ersetzen (z.B. via @Input oder eigenem Service)
  daten: DashboardDaten = MOCK_DASHBOARD_DATEN;
}
