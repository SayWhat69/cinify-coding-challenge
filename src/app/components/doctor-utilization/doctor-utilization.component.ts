import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DoctorStatistic } from '../../models/appointment.model';

@Component({
  selector: 'app-doctor-utilization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-utilization.component.html',
  styleUrl: './doctor-utilization.component.css',
})
export class DoctorUtilizationComponent {
  @Input({ required: true }) doctors: DoctorStatistic[] = [];
}
