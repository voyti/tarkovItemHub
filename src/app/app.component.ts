import { Component, OnInit } from '@angular/core';
import { barterData } from './barterData';
import { pricesData } from './pricesData';
import _ from 'lodash';


// ng build --baseHref=/tarkov/ --prod=true
// TODO: auto-scraping from etf-loot
// TODO: ammo chart

const INPUT_DEBOUNCE_PERIOD = 500;

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

const TABS = [{
    name: 'BARTER DEALS',
    id: 'barter-deals',
  }, {
    name: 'HIDEOUT MODULES',
    id: 'hideout-modules',
  }, {
      name: 'QUESTS',
    id: 'quests',
  }, {
    name: 'AMMO',
    id: 'ammo',
    flip: true,
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Tarkov Item Hub';
  data: any;
  sortedData: any;
  hideTotalNegative: boolean;
  hidePerSlotNegative: boolean;
  searchTerm: string;
  filteredData: any;
  searchInputDebounceTimerHandle: any;
  tarkovWikiBaseUrl: string;
  fullFilteredData: any;
  amountLock: boolean;
  AMOUNT_LOCK_CAP: number;
  sortSetting: string;
  TRADERS: { name: string; }[];
  LEVELS: { name: string; }[];
  traderControlCollapsed: boolean;
  allTradersLevels: any;
  traderLevelMap: any;
  activeTab: string;
  TABS: ({ name: string; id: string; flip?: undefined; } | { name: string; id: string; flip: boolean; })[];

  constructor() {
    this.searchTerm = '';
    this.searchInputDebounceTimerHandle = null;
    this.hideTotalNegative = false;
    this.hidePerSlotNegative = false;
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';
    this.amountLock = true;
    this.AMOUNT_LOCK_CAP = 20;
    this.sortSetting = 'default-desc';
    this.TRADERS = TRADERS;
    this.LEVELS = LEVELS;
    this.TABS = TABS;
    this.traderControlCollapsed = true;
    this.activeTab = 'barter-deals';

    this.allTradersLevels = ['1', '2', '3', '4'];
    this.traderLevelMap = {
      'Prapor': ['1', '2', '3', '4'],
      'Therapist': ['1', '2', '3', '4'],
      'Skier': ['1', '2', '3', '4'],
      'Peacekeeper': ['1', '2', '3', '4'],
      'Mechanic': ['1', '2', '3', '4'],
      'Ragman': ['1', '2', '3', '4'],
      'Jaeger': ['1', '2', '3', '4'],
    };
  }

  ngOnInit(): void {
    const priceToNumber = (price) => price.replace('₽', '').replace(/\s/g, '');
    const numberToPrice = (number) => number.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '₽';

    this.data = _.map(barterData, (barterItem) => {
      const outputPrice = _.find(pricesData, (priceData) => priceData.name === barterItem.outputInfo.fullName);

      barterItem.inputInfo = _.map(barterItem.inputInfo, (inputItem) => {
        inputItem.localImgUrl = inputItem.imgUrl ?
         inputItem.imgUrl.replace(/^(.*[\\\/])/, '').replace(/\.png.*$/, '.png').replace(/\.PNG.*$/, '.png')  : 'nodata.png';

        const inputItemPrice = _.find(pricesData, (priceData) => priceData.name === inputItem.fullName);
        const inputItemAmount = inputItem.amount ? inputItem.amount.replace(' x', '') : 1;
        let totalPrice;
        let unitPrice;
        let pricePerSlot;

        if (inputItemPrice) {
          totalPrice =  inputItemAmount * priceToNumber(inputItemPrice.avgPrice);
          unitPrice = priceToNumber(inputItemPrice.avgPrice);
          pricePerSlot = priceToNumber(inputItemPrice.pricePerSlot.replace(/\n.*$/g, ''));
        }

        inputItem.displayTotalPrice = totalPrice && numberToPrice(totalPrice) || 'No data';
        inputItem.displayPricePerSlot = inputItemPrice && inputItemPrice.pricePerSlot || 'No data';
        inputItem.totalPrice = totalPrice || null;
        inputItem.unitPrice = unitPrice || null;
        inputItem.pricePerSlot = pricePerSlot || null;

        return inputItem;
      });

      barterItem.sumTotalInput = _.sumBy(barterItem.inputInfo, 'totalPrice');
      barterItem.avgInputPerSlot = _.sumBy(barterItem.inputInfo, (el) => Number(el.pricePerSlot)) / barterItem.inputInfo.length;
      barterItem.displayAvgInputPerSlot = numberToPrice(barterItem.avgInputPerSlot);

      barterItem.traderInfo.levelNorm =_.last(barterItem.traderInfo.level);
      barterItem.traderInfo.localImgUrl = `${barterItem.traderInfo.level.replace(' ', '_')}_icon.png`;
      barterItem.outputInfo.localImgUrl = barterItem.outputInfo.imgUrl.replace(/^(.*[\\\/])/, '')
        .replace(/\.png.*$/, '.png').replace(/\.PNG.*$/, '.png').replace('300px-', '');

      barterItem.outputInfo.displayTotalPrice = outputPrice ? outputPrice.avgPrice : 'No data';
      barterItem.outputInfo.displayPricePerSlot = outputPrice ? outputPrice.pricePerSlot : 'No data';
      barterItem.outputInfo.totalPrice = outputPrice ? priceToNumber(outputPrice.avgPrice) : null;
      barterItem.outputInfo.pricePerSlot = outputPrice ? priceToNumber(outputPrice.pricePerSlot) : null;

      barterItem.isTotalCashNegative = barterItem.outputInfo.totalPrice < barterItem.sumTotalInput;
      barterItem.isPerSlotCashNegative = barterItem.outputInfo.pricePerSlot < barterItem.avgInputPerSlot;

      barterItem.totalProfitability = Number((barterItem.outputInfo.totalPrice - barterItem.sumTotalInput).toFixed(0));
      barterItem.perSlotProfitability = Number((barterItem.outputInfo.pricePerSlot - barterItem.avgInputPerSlot).toFixed(0));

      return barterItem;
    });

    this.resetSort();
    this.resetFilter();
  }

  clearSearchTerm() {
    this.searchTerm = '';
  }

  activateTab(tabId) {
    if (tabId !== this.activeTab) {
      this.amountLock = true;
      this.resetSort();
      this.resetFilter();
      this.activeTab = tabId;
    }
  }

  setAllTraders(level, upToThisLevel?) {
    _.forEach(TRADERS, (trader) => {
      this.setTrader(trader.name, level, upToThisLevel, true);
    });
    this.allTradersLevels = upToThisLevel ? _.times(level, i => '' + (i + 1)) : [level];
    this.resetFilter();
  }

  setTrader(traderName, level, upToThisLevel?, skipFilter?) {
    this.allTradersLevels = [];
    this.traderLevelMap[traderName] =  upToThisLevel ? _.times(level, i => '' + (i + 1)) : [level];
    if (!skipFilter) this.resetFilter();
  }

  searchTermChanged() {
    if (this.searchInputDebounceTimerHandle) {
      clearTimeout(this.searchInputDebounceTimerHandle)
    }

    this.searchInputDebounceTimerHandle = setTimeout(() => {
      if (this.searchTerm.length > 1 || this.searchTerm.length === 0) {
        this.resetFilter();
      }
    }, INPUT_DEBOUNCE_PERIOD);
  }

  sortItems(type, order) {
    this.sortSetting = `${type}-${order}`;
    this.resetSort();
  }

  resetSort() {
    if (this.sortSetting === 'default-desc') {
      this.sortedData = this.data;
    } else if (this.sortSetting === 'default-asc') {
      this.sortedData = this.data.slice().reverse();
    } else if (this.sortSetting === 'totalProf-asc') {
      this.sortedData = _.orderBy(this.data, 'totalProfitability', ['asc']);
    } else if (this.sortSetting === 'totalProf-desc') {
      this.sortedData = _.orderBy(this.data, 'totalProfitability', ['desc']);
    } else if (this.sortSetting === 'slotProf-asc') {
      this.sortedData = _.orderBy(this.data, 'perSlotProfitability', ['asc']);
    } else if (this.sortSetting === 'slotProf-desc') {
      this.sortedData = _.orderBy(this.data, 'perSlotProfitability', ['desc']);
    }
    this.resetFilter();
  }

  filterCriteriaChanged() {
    this.resetFilter();
  }

  resetFilter() {
    this.fullFilteredData = this.sortedData;
    if (this.searchTerm.length) this.filterBySearchTerm();
    if (this.hideTotalNegative) this.filterByTotalProfitability();
    if (this.hidePerSlotNegative) this.filterByPerSlotProfitability();
    this.filterByTraderLevel();

    this.filteredData = this.amountLock ? _.take(this.fullFilteredData, this.AMOUNT_LOCK_CAP) : this.fullFilteredData;
    this.amountLock = true;
  }

  filterBySearchTerm() {
    const lowerTerm = _.toLower(this.searchTerm);
    this.fullFilteredData = _.filter(this.fullFilteredData, (barterItem) => {
      const includedInInput = _.some(barterItem.inputInfo,
        (inputItem) => _.includes(_.toLower(inputItem.fullName), lowerTerm) || _.includes(_.toLower(inputItem.shortName), lowerTerm));
        const includedInOutput =
          _.includes(_.toLower(barterItem.outputInfo.fullName), lowerTerm) || _.includes(_.toLower(barterItem.outputInfo.shortName), lowerTerm);

       return includedInInput || includedInOutput;
    });
  }

  filterByTotalProfitability() {
    this.fullFilteredData = _.reject(this.fullFilteredData, (barterItem) => {
       return barterItem.totalProfitability < 0;
    });
  }

  filterByPerSlotProfitability() {
    this.fullFilteredData = _.reject(this.fullFilteredData, (barterItem) => {
       return barterItem.perSlotProfitability < 0;
    });
  }

  filterByTraderLevel() {
    this.fullFilteredData = _.filter(this.fullFilteredData, (barterItem) => {
      return _.includes(this.traderLevelMap[barterItem.traderInfo.name], barterItem.traderInfo.levelNorm)
   });
  }

  showFullFilteredData() {
    this.amountLock = false;
    this.resetFilter();
  }

}
