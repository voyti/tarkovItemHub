import { Component, OnInit } from '@angular/core';
import { barterData } from './barterData';
import { pricesData } from './pricesData';
import { hideoutData } from './hideoutData';
import { questsData } from './questsData';

import { ammoWeaponsData } from './ammoWeaponsData';
import { ammoPenData } from './ammoPenData';
import { ammoIcons } from './ammoIcons';

import _ from 'lodash';
import { ListServiceService } from './services/list-service.service';

// ng build --baseHref=/tarkov/ --prod=true
// TODO: auto-scraping from etf-loot
// TODO: ammo chart

const INPUT_DEBOUNCE_PERIOD = 500;
const MIN_SEARCH_TERM_LENGTH = 2;

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
  searchTerm: string;
  filteredData: any;
  searchInputDebounceTimerHandle: any;
  tarkovWikiBaseUrl: string;
  fullFilteredData: any;
  activeTab: string;
  amountLock: boolean;
  TABS: ({ name: string; id: string; flip?: undefined; } | { name: string; id: string; flip: boolean; })[];
  AMOUNT_LOCK_CAP: number;
  barterConfig: { allTradersLevels: string[]; traderLevelMap: { Prapor: string[]; Therapist: string[]; Skier: string[]; Peacekeeper: string[]; Mechanic: string[]; Ragman: string[]; Jaeger: string[]; }; sortSetting: string; hideTotalNegative: boolean; hidePerSlotNegative: boolean; };
  hideoutData: any;
  questsData: any;
  filteredHideoutData: any;
  itemNameToImgUrlMap: Map<any, any>;
  MIN_SEARCH_TERM_LENGTH: number;
  filteredHideoutLevels: any;
  filteredQuestsData: any;
  filteredQuestItems: any;
  ammoData: any;
  filteredAmmoData: any;
  ammoIcons: any;

  constructor(private listServiceService: ListServiceService) {
    this.searchTerm = '';
    this.searchInputDebounceTimerHandle = null;
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';
    this.TABS = TABS;
    this.activeTab = localStorage.getItem('activeTab') || 'barter-deals';
    this.AMOUNT_LOCK_CAP = this.listServiceService.getAmountCap();
    this.MIN_SEARCH_TERM_LENGTH = MIN_SEARCH_TERM_LENGTH;
    this.ammoIcons = ammoIcons;

    this.barterConfig = {
      allTradersLevels: ['1', '2', '3', '4'],
      traderLevelMap: {
        'Prapor': ['1', '2', '3', '4'],
        'Therapist': ['1', '2', '3', '4'],
        'Skier': ['1', '2', '3', '4'],
        'Peacekeeper': ['1', '2', '3', '4'],
        'Mechanic': ['1', '2', '3', '4'],
        'Ragman': ['1', '2', '3', '4'],
        'Jaeger': ['1', '2', '3', '4'],
      },
      sortSetting: 'default-desc',
      hideTotalNegative: false,
      hidePerSlotNegative: false,
    };
  }

  ngOnInit(): void {
    const priceToNumber = (price) => price.replace('₽', '').replace(/\s/g, '');
    const numberToPrice = (number) => number.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '₽';
    this.itemNameToImgUrlMap = new Map();

    this.data = _.map(barterData, (barterItem, i) => {
      const outputPrice = _.find(pricesData, (priceData) => priceData.name === barterItem.outputInfo.fullName);
      barterItem.id = i;
      barterItem.inputInfo = _.map(barterItem.inputInfo, (inputItem) => {
        inputItem.localImgUrl = inputItem.imgUrl ?
         inputItem.imgUrl.replace(/^(.*[\\\/])/, '').replace(/\.png.*$/, '.png').replace(/\.PNG.*$/, '.png')  : 'nodata.png';
         this.itemNameToImgUrlMap.set(inputItem.shortName, inputItem.localImgUrl);

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
      this.itemNameToImgUrlMap.set(barterItem.traderInfo.name, barterItem.traderInfo.localImgUrl);

      barterItem.outputInfo.localImgUrl = barterItem.outputInfo.imgUrl.replace(/^(.*[\\\/])/, '')
        .replace(/\.png.*$/, '.png').replace(/\.PNG.*$/, '.png').replace('300px-', '');
      this.itemNameToImgUrlMap.set(barterItem.outputInfo.shortName, barterItem.outputInfo.localImgUrl);


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

    this.hideoutData = _.map(hideoutData, (hideoutModule, i) => {
      hideoutModule.id = i;
      _.forEach(hideoutModule.levels, (level, j) => {
        level.id = `${i}_${j}`;
        _.forEach(level.requirements, (requirement) => {
          requirement.localImgUrl = requirement.isItem ? this.itemNameToImgUrlMap.get(requirement.name) : null;
        });
      });
      return hideoutModule;
    });

    this.questsData = _.map(questsData, (trader) => {
      trader.normName = trader.name.replace(/\n/g, '').replace(/Note.*$/, '').trim();
      trader.localImgUrl = this.itemNameToImgUrlMap.get(trader.normName);
      return trader;
    });

    this.ammoData = _.map(ammoPenData, (ammoCategory) => {
      const categoryFromWeapons =  _.find(ammoWeaponsData, ['name', ammoCategory.wikiCategory]);
      ammoCategory.displayName = ammoCategory.wikiCategory
        .replace(/(\d)([A-Za-z])/g, '$1 $2').replace(/([A-Za-z])(\d)/g, '$1 $2').replace(/\s(x|X)\s/, '×');
      if (_.includes(_.toLower(ammoCategory.category), 'slugs')) ammoCategory.displayName = ammoCategory.displayName + " (Slugs)";
      if (_.includes(_.toLower(ammoCategory.category), 'shot')) ammoCategory.displayName = ammoCategory.displayName + " (Shot)";
      ammoCategory.weapons = categoryFromWeapons && categoryFromWeapons.weapons;
      ammoCategory.wikiHref = categoryFromWeapons && categoryFromWeapons.wikiHref;
      return ammoCategory;
    });

    const staticAmmoNameMap = {
      'RIP Slug': 'RIP',
      'Superformance HP Slug': 'SuperFormance',
      'HP Copper Sabot Premier': 'Copper Sabot Premier',
      'Led Slug': 'Led',
      // 'FTX Custom Lite Slug': 'FTX Custom LIte Slug',
      'Shell With .50 BMG (Tracer)': '.50 BMG bullet',
      'AP 20 Slug': 'AP-20 Slug',
      'T Gzh (Tracer)': 'PT Gzh',
      'r37f': 'r37.f',
      'r37x': 'r37.x',
      'l191 (Tracer)': 'l191',
      'sp5': 'sp-5',
      'sp6': 'sp-6',
    };

    const allAmmoTypes = _.flatMap(this.ammoData, 'ammoTypes');
    _.forEach(allAmmoTypes, (type) => {
      if (!type.name) return null;

      let typeName = type.name;
      typeName = typeName.replace(' (Tracer)', '').replace(/_/g, ' ');

      let matchableName = '';
      if (type.category === '5.45x39 mm') {
        matchableName = type.category + ' ' + typeName;
      } else {
        matchableName = _.includes(typeName, '"') ? typeName.replace(/^.*?"/, '') : typeName;
        matchableName = staticAmmoNameMap[matchableName] || matchableName;
      }

      const typeFromIcons = _.find(this.ammoIcons, (iconData) => _.includes(_.toLower(iconData.name), _.toLower(matchableName)));
      type.wikiHref = typeFromIcons && typeFromIcons.wikiHref;
      type.localImgUrl = typeFromIcons && typeFromIcons.fileName.replace(/\s/g, '_').replace(/^\./, '');
      type.wikiName = typeFromIcons && typeFromIcons.name || type.name;
    });

    this.filteredHideoutData = this.hideoutData;
    this.filteredQuestsData = this.questsData;
    this.filteredAmmoData = this.ammoData;

    this.resetBarterSort();
    this.resetBarterFilter();
  }

  getTabContentAmount(tabId) {
    if (tabId === 'barter-deals') {
      return this.fullFilteredData ? this.fullFilteredData.length : 0;
    } else if (tabId === 'hideout-modules') {
      return this.filteredHideoutLevels ? this.filteredHideoutLevels.length : 0;
    } else if (tabId === 'quests') {
      return this.filteredQuestItems ? this.filteredQuestItems.length : 0;
    } else {
      return '?';
    }
  }

  activateTab(tabId) {
    if (tabId !== this.activeTab) {
      if (!this.amountLock) {
        this.amountLock = true;
        this.resetBarterSort();
        this.resetBarterFilter();
      }
      this.activeTab = tabId;
      localStorage.setItem('activeTab', tabId);
    }
  }

  onAmountLockChanged(lockState) {
    this.amountLock = lockState;
    this.resetBarterFilter();
  }

  onConfigChanged(config) {
    this.barterConfig.sortSetting = config.sortSetting;
    this.barterConfig.hideTotalNegative = config.hideTotalNegative;
    this.barterConfig.hidePerSlotNegative = config.hidePerSlotNegative;
    this.barterConfig.traderLevelMap = config.traderLevelMap;

    this.resetBarterSort();
    this.resetBarterFilter();
  }

  clearSearchTerm() {
    this.searchTerm = '';
    this.resetBarterFilter();
    this.resetHideoutFilter();
    this.resetQuestsFilter();
  }

  searchTermChanged() {
    if (this.searchInputDebounceTimerHandle) {
      clearTimeout(this.searchInputDebounceTimerHandle)
    }

    this.searchInputDebounceTimerHandle = setTimeout(() => {
      if (this.searchTerm.length >= MIN_SEARCH_TERM_LENGTH || this.searchTerm.length === 0) {
        this.resetBarterFilter();
        this.resetHideoutFilter();
        this.resetQuestsFilter();
      }
    }, INPUT_DEBOUNCE_PERIOD);
  }

  resetHideoutFilter() {
    this.filteredHideoutData = _.cloneDeep(this.hideoutData);
    if (this.searchTerm.length) {
      this.filteredHideoutData = _.map(this.filteredHideoutData, (hideoutModule) => {
        hideoutModule.levels = _.filter(hideoutModule.levels, (level) => {
          return _.some(level.requirements, (requirement) => {
            return _.includes(_.toLower(requirement.addInfo) || _.toLower(requirement.name), _.toLower(this.searchTerm));
          });
        });
        return hideoutModule;
      });
      this.filteredHideoutData = _.filter(this.filteredHideoutData, (hideoutModule) => hideoutModule.levels.length);
      this.filteredHideoutLevels = _.flatMap(this.filteredHideoutData, 'levels');
    }
  }

  resetQuestsFilter() {
    this.filteredQuestsData = _.cloneDeep(this.questsData);
    if (this.searchTerm.length) {
      this.filteredQuestsData = _.map(this.filteredQuestsData, (trader) => {
        trader.requirements = _.filter(trader.requirements, (requirement) => {
          const mergedObjectives = _.join(requirement.objectives, ' ');
          return _.includes(_.toLower(mergedObjectives), _.toLower(this.searchTerm));
        });
        return trader;
      });
      this.filteredQuestsData = _.filter(this.filteredQuestsData, (trader) => trader.requirements.length);
      this.filteredQuestItems = _.flatMap(this.filteredQuestsData, 'requirements');
    }
  }

  resetBarterSort() {
    if (this.barterConfig.sortSetting === 'default-desc') {
      this.sortedData = this.data;
    } else if (this.barterConfig.sortSetting === 'default-asc') {
      this.sortedData = this.data.slice().reverse();
    } else if (this.barterConfig.sortSetting === 'totalProf-asc') {
      this.sortedData = _.orderBy(this.data, 'totalProfitability', ['asc']);
    } else if (this.barterConfig.sortSetting === 'totalProf-desc') {
      this.sortedData = _.orderBy(this.data, 'totalProfitability', ['desc']);
    } else if (this.barterConfig.sortSetting === 'slotProf-asc') {
      this.sortedData = _.orderBy(this.data, 'perSlotProfitability', ['asc']);
    } else if (this.barterConfig.sortSetting === 'slotProf-desc') {
      this.sortedData = _.orderBy(this.data, 'perSlotProfitability', ['desc']);
    }
    this.resetBarterFilter();
  }

  resetBarterFilter() {
    this.fullFilteredData = this.sortedData;
    if (this.searchTerm.length) this.filterBySearchTerm();
    if (this.barterConfig.hideTotalNegative) this.filterByTotalProfitability();
    if (this.barterConfig.hidePerSlotNegative) this.filterByPerSlotProfitability();
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
      return _.includes(this.barterConfig.traderLevelMap[barterItem.traderInfo.name], barterItem.traderInfo.levelNorm)
   });
  }

}
