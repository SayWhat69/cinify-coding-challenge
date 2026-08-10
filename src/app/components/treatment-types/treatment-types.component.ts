import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TreatmentTypeStatistic } from '../../models/appointment.model';

@Component({
  selector: 'app-treatment-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treatment-types.component.html',
  styleUrl: './treatment-types.component.css',
})
export class TreatmentTypesComponent {
  @Input({ required: true }) treatmentTypes: TreatmentTypeStatistic[] = [];

  get maxCount(): number {
    return Math.max(1, ...this.treatmentTypes.map((b) => b.count));
  }
}
