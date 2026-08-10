import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BehandlungsartStatistik } from '../../models/termin.model';

@Component({
  selector: 'app-behandlungsarten',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './behandlungsarten.component.html',
  styleUrl: './behandlungsarten.component.css',
})
export class BehandlungsartenComponent {
  @Input({ required: true }) behandlungsarten: BehandlungsartStatistik[] = [];

  get maxAnzahl(): number {
    return Math.max(1, ...this.behandlungsarten.map((b) => b.anzahl));
  }
}
