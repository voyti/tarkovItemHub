import { Component, OnInit } from '@angular/core';
import { barterData } from './barterData';
import { pricesData } from './pricesData';
import { hideoutData } from './hideoutData';
import { questsData } from './questsData';

import { ammoWeaponsData } from './ammoWeaponsData';
import { ammoPenData } from './ammoPenData';
import { ammoIcons } from './ammoIcons';
import { craftingData } from './craftingData';
import { localImgsList } from './localImgsList';

import _ from 'lodash';
import { ListServiceService } from './services/list-service.service';
import { MatDialog } from '@angular/material/dialog';
import { AboutInfoDialogComponent } from './components/about-info-dialog/about-info-dialog.component';

// ng build --baseHref=/ --prod=true
// TODO: auto-scraping from eft-loot

const INPUT_DEBOUNCE_PERIOD = 500;
const MIN_SEARCH_TERM_LENGTH = 2;

const TABS = [{
    name: 'BARTER DEALS',
    id: 'barter-deals',
  }, {
    name: 'HIDEOUT',
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
  locationHashToTabMap: { barter: string; hideout: string; quests: string; ammo: string; };
  tabToLocationHashMap: any;
  unlistedMatchedItems: any;
  craftingData: any;
  priceToNumber: (price: any) => any;
  numberToPrice: (number: any) => string;
  nameToLocalImgUrl: (name: any, defaultVal?: string) => any;
  guaranteedNameToLocalImgUrl: (name: any) => void;

  constructor(private listServiceService: ListServiceService, public aboutDialog: MatDialog) {
    this.locationHashToTabMap = {
      'barter': 'barter-deals',
      'hideout': 'hideout-modules',
      'quests': 'quests',
      'ammo': 'ammo',
    };
    this.tabToLocationHashMap = _.invert(this.locationHashToTabMap);

    this.searchTerm = '';
    this.searchInputDebounceTimerHandle = null;
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';
    this.TABS = TABS;
    const urlTabId = location.hash ? this.locationHashToTabMap[location.hash.replace('#', '')] : location.hash;
    this.activeTab = urlTabId || 'barter-deals';

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
    this.unlistedMatchedItems = [];
    this.filteredHideoutLevels = [];
    this.priceToNumber = (price) => price.replace('₽', '').replace(/\s/g, '').replace(/\(Stackof.*$/, '');
    this.numberToPrice = (number) => number.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '₽';

    this.nameToLocalImgUrl = (name, defaultVal = 'nodata.png') =>
      name ? name.replace(/^(.*[\\\/])/, '').replace(/\.png.*$/, '.png').replace(/\.PNG.*$/, '.png') : defaultVal;

    this.guaranteedNameToLocalImgUrl = (name) => {
      const imgUrl = this.nameToLocalImgUrl(name);
      const appearsLocally = _.includes(localImgsList, imgUrl) ? imgUrl : null;
      return appearsLocally ? imgUrl : null;
    };

  }

  ngOnInit(): void {
    this.itemNameToImgUrlMap = new Map();

    this.data = this.processBarterData(barterData);
    this.craftingData = this.processCraftingData(craftingData);
    this.hideoutData = this.processHideoutData(hideoutData);

    this.questsData = this.processQuestsData(questsData);
    this.ammoData = this.processAmmoData(ammoPenData);

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

  processBarterData(_barterData) {
    return _.map(_barterData, (barterItem, i) => {
      const outputPrice = _.find(pricesData, (priceData) => priceData.name === barterItem.outputInfo.fullName);
      barterItem.id = i;
      barterItem.inputInfo = _.map(barterItem.inputInfo, (inputItem) => {
        inputItem.localImgUrl = this.nameToLocalImgUrl(inputItem.imgUrl);
        this.itemNameToImgUrlMap.set(inputItem.shortName, inputItem.localImgUrl);

        const inputItemPrice = _.find(pricesData, (priceData) => priceData.name === inputItem.fullName);
        const inputItemAmount = inputItem.amount ? inputItem.amount.replace(' x', '') : 1;
        let totalPrice;
        let unitPrice;
        let pricePerSlot;

        if (inputItemPrice) {
          totalPrice =  inputItemAmount * this.priceToNumber(inputItemPrice.avgPrice);
          unitPrice = this.priceToNumber(inputItemPrice.avgPrice);
          pricePerSlot = this.priceToNumber(inputItemPrice.pricePerSlot.replace(/\n.*$/g, ''));
        }

        inputItem.displayTotalPrice = totalPrice && this.numberToPrice(totalPrice) || 'No data';
        inputItem.displayPricePerSlot = inputItemPrice && inputItemPrice.pricePerSlot || 'No data';
        inputItem.totalPrice = totalPrice || null;
        inputItem.unitPrice = unitPrice || null;
        inputItem.pricePerSlot = pricePerSlot || null;

        return inputItem;
      });

      barterItem.sumTotalInput = _.sumBy(barterItem.inputInfo, 'totalPrice');
      barterItem.avgInputPerSlot = _.sumBy(barterItem.inputInfo, (el) => Number(el.pricePerSlot)) / barterItem.inputInfo.length;
      barterItem.displayAvgInputPerSlot = this.numberToPrice(barterItem.avgInputPerSlot);

      barterItem.traderInfo.levelNorm =_.last(barterItem.traderInfo.level);
      barterItem.traderInfo.localImgUrl = `${barterItem.traderInfo.level.replace(' ', '_')}_icon.png`;
      this.itemNameToImgUrlMap.set(barterItem.traderInfo.name, barterItem.traderInfo.localImgUrl);

      barterItem.outputInfo.localImgUrl = barterItem.outputInfo.imgUrl.replace(/^(.*[\\\/])/, '')
        .replace(/\.png.*$/, '.png').replace(/\.PNG.*$/, '.png').replace('300px-', '');
      this.itemNameToImgUrlMap.set(barterItem.outputInfo.shortName, barterItem.outputInfo.localImgUrl);


      barterItem.outputInfo.displayTotalPrice = outputPrice ? outputPrice.avgPrice : 'No data';
      barterItem.outputInfo.displayPricePerSlot = outputPrice ? outputPrice.pricePerSlot : 'No data';
      barterItem.outputInfo.totalPrice = outputPrice ? this.priceToNumber(outputPrice.avgPrice) : null;
      barterItem.outputInfo.pricePerSlot = outputPrice ? this.priceToNumber(outputPrice.pricePerSlot) : null;

      barterItem.isTotalCashNegative = barterItem.outputInfo.totalPrice < barterItem.sumTotalInput;
      barterItem.isPerSlotCashNegative = barterItem.outputInfo.pricePerSlot < barterItem.avgInputPerSlot;

      barterItem.totalProfitability = Number((barterItem.outputInfo.totalPrice - barterItem.sumTotalInput).toFixed(0));
      barterItem.perSlotProfitability = Number((barterItem.outputInfo.pricePerSlot - barterItem.avgInputPerSlot).toFixed(0));
      barterItem.inputInfoWithNoData = !_.some(barterItem.inputInfo, 'totalPrice') || !barterItem.outputInfo.totalPrice;

      return barterItem;
    });
  }

  processCraftingData(_craftingData) {
    return _.map(_craftingData, (craftingEntry) => {
      let foundOutputItemPrice = _.find(pricesData, (priceData) => craftingEntry.outputItemName === priceData.name);
      foundOutputItemPrice = foundOutputItemPrice || _.find(pricesData, (priceData) => _.includes(priceData.name, craftingEntry.outputItemName));

      craftingEntry.requirements = _.map(craftingEntry.requirements, (req) => {
        const foundReqPrice = _.find(pricesData, (priceData) => req.name === priceData.name);
        req.avgPriceData = foundReqPrice ? foundReqPrice.avgPrice : 'No data';
        req.pricePerSlot = foundReqPrice ? foundReqPrice.pricePerSlot : 'No data';
        req.numAvgPriceData = this.priceToNumber(req.avgPriceData) || null;
        req.numPricePerSlot = this.priceToNumber(req.pricePerSlot) || null;
        req.localImgUrl = this.guaranteedNameToLocalImgUrl(req.imgUrl);

        req.numTotalAvgPriceData = foundReqPrice ? req.numAvgPriceData * req.amountNum : null;
        req.totalAvgPriceData = foundReqPrice ? this.numberToPrice(req.numTotalAvgPriceData) : 'No data';

        return req;
      });

      craftingEntry.outputItemAvgPrice = foundOutputItemPrice ? foundOutputItemPrice.avgPrice : 'No data';
      craftingEntry.outputItemPricePerSlot = foundOutputItemPrice ? foundOutputItemPrice.pricePerSlot.split('\n')[0] : 'No data';
      craftingEntry.outputItemNumAvgPrice = this.priceToNumber(craftingEntry.outputItemAvgPrice) || null;
      craftingEntry.outputItemNumPricePerSlot = this.priceToNumber(craftingEntry.outputItemPricePerSlot) || null;
      craftingEntry.outputItemLocalImgUrl = this.guaranteedNameToLocalImgUrl(craftingEntry.outputItemImgUrl);

      craftingEntry.totalOutputItemNumAvgPrice = foundOutputItemPrice ? craftingEntry.outputItemNumAvgPrice * craftingEntry.outputAmountNum : null
      craftingEntry.totalOutputItemAvgPrice = foundOutputItemPrice ? this.numberToPrice(craftingEntry.totalOutputItemNumAvgPrice) : 'No data';

      craftingEntry.numTotalRequiredPrice = _.sumBy(craftingEntry.requirements, (req) => +req.numTotalAvgPriceData);
      craftingEntry.totalRequiredPrice = this.numberToPrice(craftingEntry.numTotalRequiredPrice);
      craftingEntry.level = _.last(craftingEntry.moduleName.split(' '));

      craftingEntry.avgRequiredPerSlot = _.sumBy(craftingEntry.requirements, (req) => +req.numPricePerSlot) / craftingEntry.requirements.length;
      craftingEntry.inputInfoWithNoData = _.some(craftingEntry.requirements, (req) => !req.numAvgPriceData) || _.isNaN(craftingEntry.avgRequiredPerSlot);
      craftingEntry.displayAvgRequiredPerSlot = !_.isNaN(craftingEntry.avgRequiredPerSlot) ? this.numberToPrice(craftingEntry.avgRequiredPerSlot) : 'No data';

      craftingEntry.isTotalCashNegative = craftingEntry.totalOutputItemNumAvgPrice < craftingEntry.numTotalRequiredPrice;
      craftingEntry.isPerSlotCashNegative = !_.isNaN(craftingEntry.avgRequiredPerSlot) ? craftingEntry.outputItemNumPricePerSlot < craftingEntry.avgRequiredPerSlot : false;

      craftingEntry.totalProfitability = Number((craftingEntry.totalOutputItemNumAvgPrice - craftingEntry.numTotalRequiredPrice).toFixed(0));
      craftingEntry.perSlotProfitability = !_.isNaN(craftingEntry.avgRequiredPerSlot) ? Number((craftingEntry.outputItemNumPricePerSlot - craftingEntry.avgRequiredPerSlot).toFixed(0)) : null;

      return craftingEntry;
    });
  }

  processHideoutData(_hideoutData) {
    let rowIter = 0;
    return _.map(_hideoutData, (hideoutModule, i) => {
      hideoutModule.id = i;
      _.forEach(hideoutModule.levels, (level, j) => {
        level.id = `${i}_${j}`;
        level.iter = rowIter;
        rowIter++;
        level.crafting = _.filter(this.craftingData, (craftingEntry) =>
          _.includes(craftingEntry.moduleName, hideoutModule.name) && craftingEntry.level === level.level);

        _.forEach(level.requirements, (requirement) => {
          requirement.localImgUrl = requirement.isItem ? this.itemNameToImgUrlMap.get(requirement.name) : null;
        });
      });
      return hideoutModule;
    });
  }

  processQuestsData(_questsData) {
    return _.map(_questsData, (trader) => {
      trader.normName = trader.name.replace(/\n/g, '').replace(/Note.*$/, '').trim();
      trader.localImgUrl = this.itemNameToImgUrlMap.get(trader.normName);
      return trader;
    });
  }

  processAmmoData(_ammoPenData) {
    return _.map(_ammoPenData, (ammoCategory) => {
      const categoryFromWeapons =  _.find(ammoWeaponsData, ['name', ammoCategory.wikiCategory]);
      ammoCategory.displayName = ammoCategory.wikiCategory
        .replace(/(\d)([A-Za-z])/g, '$1 $2').replace(/([A-Za-z])(\d)/g, '$1 $2').replace(/\s(x|X)\s/, '×');
      if (_.includes(_.toLower(ammoCategory.category), 'slugs')) ammoCategory.displayName = ammoCategory.displayName + " (Slugs)";
      if (_.includes(_.toLower(ammoCategory.category), 'shot')) ammoCategory.displayName = ammoCategory.displayName + " (Shot)";
      ammoCategory.weapons = categoryFromWeapons && categoryFromWeapons.weapons;
      ammoCategory.wikiHref = categoryFromWeapons && categoryFromWeapons.wikiHref;
      return ammoCategory;
    });
  }

  showAboutInfoDialog() {
    const dialogRef = this.aboutDialog.open(AboutInfoDialogComponent, {
      width: '600px',
    });
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
      location.hash = this.tabToLocationHashMap[tabId];
      // localStorage.setItem('activeTab', tabId);
      // localStorage.setItem('activeTab', tabId);
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
        this.resetItemsPriceData();
      }
    }, INPUT_DEBOUNCE_PERIOD);
  }

  resetHideoutFilter() {
    this.filteredHideoutData = _.cloneDeep(this.hideoutData);
    if (this.searchTerm.length) {
      this.filteredHideoutData = _.map(this.filteredHideoutData, (hideoutModule) => {
        hideoutModule.levels = _.filter(hideoutModule.levels, (level) => {
          const craftingMatcher = (craftingEntry) => {
            return _.some(craftingEntry.requirements, (req) => _.includes(_.toLower(req.name), _.toLower(this.searchTerm))) ||
              _.includes(_.toLower(craftingEntry.outputItemName), _.toLower(this.searchTerm));
          };
          const levelBuildingReqMet = _.some(level.requirements, (requirement) => {
            return _.includes(_.toLower(requirement.addInfo) || _.toLower(requirement.name), _.toLower(this.searchTerm));
          });

          const levelCraftingReqMet = _.some(level.crafting, (craftingEntry) => craftingMatcher(craftingEntry));

          if (levelCraftingReqMet) level.crafting = _.filter(level.crafting, (craftingEntry) => craftingMatcher(craftingEntry));

          return levelBuildingReqMet || levelCraftingReqMet;
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
    const cleanData = _.reject(this.data, 'inputInfoWithNoData');

    if (this.barterConfig.sortSetting === 'default-desc') {
      this.sortedData = this.data;
    } else if (this.barterConfig.sortSetting === 'default-asc') {
      this.sortedData = this.data.slice().reverse();
    } else if (this.barterConfig.sortSetting === 'totalProf-asc') {
      this.sortedData = [
        ..._.orderBy(cleanData, 'totalProfitability' , ['asc']),
        ..._.filter(this.data, 'inputInfoWithNoData')];
    } else if (this.barterConfig.sortSetting === 'totalProf-desc') {
      this.sortedData = [
        ..._.orderBy(cleanData, 'totalProfitability', ['desc']),
        ..._.filter(this.data, 'inputInfoWithNoData')];
    } else if (this.barterConfig.sortSetting === 'slotProf-asc') {
      this.sortedData = [
        ..._.orderBy(cleanData, 'perSlotProfitability', ['asc']),
       ..._.filter(this.data, 'inputInfoWithNoData')];
    } else if (this.barterConfig.sortSetting === 'slotProf-desc') {
      this.sortedData = [
        ..._.orderBy(cleanData, 'perSlotProfitability', ['desc']),
        ..._.filter(this.data, 'inputInfoWithNoData')];
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

  resetItemsPriceData() {
    const allInput = _.map(_.flatMap(_.map(this.data, 'inputInfo')),'fullName');
    const allOutput = _.map(this.data, 'outputInfo.fullName');
    const allBarterItems = [...allInput, ...allOutput];

    const unlistedItems = _.reject(pricesData, (priceItem) => _.includes(allBarterItems, priceItem.name));
    this.unlistedMatchedItems = _.filter(unlistedItems, (item) => _.includes(_.toLower(item.name), _.toLower(this.searchTerm)));
    this.unlistedMatchedItems = _.map(this.unlistedMatchedItems, (item) => {
      item.localImgUrl = this.itemNameToImgUrlMap.get(item.name);  return item;
    });
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
