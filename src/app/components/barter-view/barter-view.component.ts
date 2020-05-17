import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import _ from 'lodash';
import { ListServiceService } from 'src/app/services/list-service.service';

const TRADERS = [{
  name: 'Prapor',
  }, {
    name: 'Therapist',
  }, {
    name: 'Skier',
  }, {
    name: 'Peacekeeper',
  }, {
    name: 'Mechanic',
  }, {
    name: 'Ragman',
  }, {
    name: 'Jaeger',
  },
];
const LEVELS = [{
  name: 'X',
  value: '0',
  }, {
  name: '1',
  value: '1',
  }, {
    name: '2',
    value: '2',
  }, {
    name: '3',
    value: '3',
  }, {
    name: '4',
    value: '4',
  },
];

@Component({
  selector: 'app-barter-view',
  templateUrl: './barter-view.component.html',
  styleUrls: ['./barter-view.component.scss']
})
export class BarterViewComponent implements OnInit {
  @Input() fullFilteredData;
  @Input() filteredData;
  @Input() amountLock;
  @Input() config: { allTradersLevels: string[]; traderLevelMap: { Prapor: string[]; Therapist: string[]; Skier: string[]; Peacekeeper: string[]; Mechanic: string[]; Ragman: string[]; Jaeger: string[]; }; sortSetting: string; hideTotalNegative: boolean; hidePerSlotNegative: boolean; };
  @Output() configChanged = new EventEmitter<any>();tarkovWikiBaseUrl: string;
  fullscreenMode: boolean;
;
  @Output() amountLockChanged = new EventEmitter<boolean>();

  AMOUNT_LOCK_CAP: number;
  TRADERS: { name: string; }[];
  LEVELS: { name: string; }[];
  traderControlCollapsed: boolean;

  constructor(private listServiceService: ListServiceService) {
    this.TRADERS = TRADERS;
    this.LEVELS = LEVELS;
    this.AMOUNT_LOCK_CAP = this.listServiceService.getAmountCap();
    this.traderControlCollapsed = true;
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';
    this.fullscreenMode = false;
  }

  ngOnInit(): void {

  }

  setAllTraders(level, upToThisLevel?) {
    _.forEach(TRADERS, (trader) => {
      this.setTrader(trader.name, level, upToThisLevel, true);
    });
    this.config.allTradersLevels = upToThisLevel ? _.times(level, i => '' + (i + 1)) : [level];
    this.propagateConfigChange();
  }

  setTrader(traderName, level, upToThisLevel?, skipFilter?) {
    this.config.allTradersLevels = [];
    this.config.traderLevelMap[traderName] =  upToThisLevel ? _.times(level, i => '' + (i + 1)) : [level];
    if (!skipFilter) this.propagateConfigChange();
  }

  sortItems(type, order) {
    this.config.sortSetting = `${type}-${order}`;
    this.propagateConfigChange();
  }

  filterCriteriaChanged() {
    this.propagateConfigChange();
  }

  showFullFilteredData() {
    this.amountLockChanged.emit(false)
  }

  propagateConfigChange() {
    this.configChanged.emit(this.config);
  }

}
