import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardDaten } from '../../models/termin.model';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.css',
})
export class KpiCardsComponent {
  @Input({ required: true }) gesamt!: DashboardDaten['gesamt'];
}
