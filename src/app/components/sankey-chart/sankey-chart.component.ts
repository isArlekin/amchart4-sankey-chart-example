import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { SankeyDiagram } from '@amcharts/amcharts4/charts';
import { create } from '@amcharts/amcharts4/core';
import { TagStatuses } from './sankey-chart.enums';
import { DataService } from '../../core/data.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sankey-chart',
  templateUrl: './sankey-chart.component.html',
  styleUrls: ['./sankey-chart.component.scss']
})
export class SankeyChartComponent implements OnDestroy, AfterViewInit {

  private STATE_NAMES = {
    total: 'Total',
    opened: 'Opened',
    sealed: 'Sealed',
    noAction: 'No Action',
    tampered: 'Tampered',
  };
  private TRANSITION_COLORS = [
    { from: TagStatuses.total, fromName: this.STATE_NAMES.total, color: '#0196D1' },
    { from: TagStatuses.opened, fromName: this.STATE_NAMES.opened, color: '#66BEE2' },
    { from: TagStatuses.sealed, fromName: this.STATE_NAMES.sealed, color: '#173856' },
    { from: TagStatuses.noAction, fromName: this.STATE_NAMES.noAction, color: '#b9c3cc' },
    { from: TagStatuses.tampered, fromName: this.STATE_NAMES.tampered, color: '#ef4634' },
  ];
  private TRANSITIONS = [
    {
      from: TagStatuses.total,
      to: TagStatuses.sealed,
      fromName: this.STATE_NAMES.total,
      toName: this.STATE_NAMES.sealed,
    },
    {
      from: TagStatuses.total,
      to: TagStatuses.opened,
      fromName: this.STATE_NAMES.total,
      toName: this.STATE_NAMES.opened,
    },
    {
      from: TagStatuses.total,
      to: TagStatuses.tampered,
      fromName: this.STATE_NAMES.total,
      toName: this.STATE_NAMES.tampered,
    },

    {
      from: TagStatuses.sealed,
      to: TagStatuses.opened,
      fromName: this.STATE_NAMES.sealed,
      toName: this.STATE_NAMES.opened,
    },
    {
      from: TagStatuses.sealed,
      to: TagStatuses.noAction,
      fromName: this.STATE_NAMES.sealed,
      toName: this.STATE_NAMES.noAction,
    },

    {
      from: TagStatuses.opened,
      to: TagStatuses.tampered,
      fromName: this.STATE_NAMES.opened,
      toName: this.STATE_NAMES.tampered,
    },
  ];

  private chart: SankeyDiagram;

  constructor(
    private zone: NgZone,
    private dataService: DataService,
  ) { }

  ngAfterViewInit() {
    this.initChart();
    this.updateDataSubscription();
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  private initChart() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        return;
      }
      try {
        const chart = create('chart', SankeyDiagram);

        chart.paddingRight = 100;
        chart.fontSize = 18;

        chart.tooltip.fontSize = 16;

        chart.data = [];

        const hoverState = chart.links.template.states.create('hover');
        hoverState.properties.fillOpacity = 0.6;

        chart.nodes.template.draggable = false;

        chart.dataFields.fromName = 'fromName';
        chart.dataFields.toName = 'toName';
        chart.dataFields.value = 'value';
        chart.dataFields.color = 'color';

        this.chart = chart;
      } catch (err) {
        this.chart = null;
      }
    });
  }

  private updateDataSubscription() {
    this.dataService.getTagsCount()
      .pipe(
        map(tagStatusesList => this.mapStatusListToStatusTransitions(tagStatusesList)),
      )
      .subscribe(response => {
        this.updateViewData(response);
      });
  }

  private updateViewData(dataResponse) {
    this.chart.data = dataResponse;
    this.chart.validateData();
  }

  private mapStatusListToStatusTransitions(statusList) {
    const chartTransitions = this.TRANSITIONS.map(transition => {
      let filteredStatusList;

      if (transition.from === TagStatuses.total) {
        filteredStatusList = statusList.filter(
          item => item.statuses[0] === transition.to,
        );
      } else if (transition.to === TagStatuses.noAction) {
        filteredStatusList = statusList.filter(
          item => item.statuses.length === 1 && item.statuses[0] === transition.from,
        );
      } else {
        filteredStatusList = statusList.filter(
          item =>
            item.statuses.indexOf(transition.from) !== -1 &&
            item.statuses.indexOf(transition.from) ===
            item.statuses.indexOf(transition.to) - 1,
        );
      }

      const transitionedCount = filteredStatusList.reduce(
        (acc, cur) => acc + cur.count,
        0,
      );

      if (transitionedCount === 0) {
        return null;
      } else {
        return Object.assign({}, transition, { value: transitionedCount });
      }
    }).filter(transition => !!transition);

    const chartTransitionColors = this.TRANSITION_COLORS.filter(transitionColor => {
      return chartTransitions.find(
        transition =>
          transition.from === transitionColor.from ||
          transition.to === transitionColor.from,
      );
    });

    return [...chartTransitionColors, ...chartTransitions];
  }
}
