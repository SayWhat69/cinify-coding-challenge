import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Exclusion } from '../../models/appointment.model';

@Component({
  selector: 'app-data-quality-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-quality-banner.component.html',
  styleUrl: './data-quality-banner.component.css',
})
export class DataQualityBannerComponent {
  @Input() exclusions: Exclusion[] = [];
  @Input() missingStatusCount = 0;
  @Input() correctedDurationCount = 0;
}
