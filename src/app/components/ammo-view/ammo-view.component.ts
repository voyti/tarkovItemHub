import { Component, OnInit, Input } from '@angular/core';
import _ from 'lodash';

@Component({
  selector: 'app-ammo-view',
  templateUrl: './ammo-view.component.html',
  styleUrls: ['./ammo-view.component.scss']
})
export class AmmoViewComponent implements OnInit {
  @Input() ammoData;
  tarkovWikiBaseUrl: string;
  filterControls: string[];
  allFilters: string[];
  enabledFilters: string[];
  filtersHidden: boolean;
  filteredAmmoData: any;

  constructor() {
    this.filtersHidden = true;
  }

  ngOnInit(): void {
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';

    console.log(this.ammoData);

    this.filterControls = ['12 Gauge Shot', '12 Gauge Slugs', '20 Gauge', '9x18mm', '7.62x25mm', '9x19mm', '0.45', '9x21mm', '5.7x28 mm', '4.6x30 mm',
    '9x39mm', '0.366', '5.45x39 mm', '5.56x45 mm', '7.62x39 mm', '7.62x51 mm', '7.62x54R', '12.7x55 mm', 'Mounted Weapons'];

    this.allFilters = ['12 Gauge Shot', '12 Gauge Slugs', '20 Gauge', '9x18mm', '7.62x25mm', '9x19mm', '0.45', '9x21mm', '5.7x28 mm', '4.6x30 mm',
    '9x39mm', '0.366', '5.45x39 mm', '5.56x45 mm', '7.62x39 mm', '7.62x51 mm', '7.62x54R', '12.7x55 mm', 'Mounted Weapons'];

    this.enabledFilters = _.clone(this.allFilters);
    this.filteredAmmoData = this.ammoData;
  }

  addFilter(filter) {
    if (!_.includes(this.enabledFilters, filter)) this.enabledFilters = [...this.enabledFilters, filter];
    this.applyFilters();
  }

  isolateFilter(filter) {
    this.enabledFilters = [filter];
    this.applyFilters();
  }

  enableAllFilters() {
    this.enabledFilters = _.clone(this.allFilters);
    this.applyFilters();
  }

  disableAllFilters() {
    this.enabledFilters = [];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredAmmoData = _.filter(this.ammoData, (data) => _.includes(this.enabledFilters, data.category));
  }

}
