import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Ausschluss } from '../../models/termin.model';

@Component({
  selector: 'app-data-quality-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-quality-banner.component.html',
  styleUrl: './data-quality-banner.component.css',
})
export class DataQualityBannerComponent {
  @Input() ausschluesse: Ausschluss[] = [];
  @Input() fehlenderStatus = 0;
  @Input() korrigierteDauerAnzahl = 0;
}
