import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TrendPoint } from '../../models/appointment.model';

Chart.register(...registerables);

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      :host {
        display: block;
        height: 260px;
      }
      canvas {
        max-height: 260px;
      }
    `,
  ],
})
export class TrendChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() points: TrendPoint[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['points'] && this.canvasRef) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.canvasRef || this.points.length === 0) return;
    this.chart?.destroy();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.points.map((p) => p.label),
        datasets: [
          {
            label: 'Gebucht',
            data: this.points.map((p) => p.bookedPercent),
            borderColor: '#6B7A8D',
            backgroundColor: 'rgba(107,122,141,0.08)',
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.25,
            fill: false,
          },
          {
            label: 'Realisiert',
            data: this.points.map((p) => p.completedPercent),
            borderColor: '#0F6E6E',
            backgroundColor: 'rgba(15,110,110,0.12)',
            borderWidth: 2.5,
            pointRadius: 3,
            tension: 0.25,
            fill: '-1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: (v) => v + ' %',
              font: { family: 'IBM Plex Mono', size: 11 },
            },
            grid: { color: '#EEF1F3' },
          },
          x: {
            ticks: { font: { family: 'IBM Plex Sans', size: 11.5 } },
            grid: { display: false },
          },
        },
      },
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
