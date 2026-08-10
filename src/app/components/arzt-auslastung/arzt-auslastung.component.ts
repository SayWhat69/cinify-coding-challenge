import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ArztStatistik } from '../../models/termin.model';

@Component({
  selector: 'app-arzt-auslastung',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './arzt-auslastung.component.html',
  styleUrl: './arzt-auslastung.component.css',
})
export class ArztAuslastungComponent {
  @Input({ required: true }) aerzte: ArztStatistik[] = [];
}
