import { Component, OnInit, Input, SystemJsNgModuleLoaderConfig } from '@angular/core';
import { pricesData } from './../../pricesData';
import _ from 'lodash';

@Component({
  selector: 'app-hideout-view',
  templateUrl: './hideout-view.component.html',
  styleUrls: ['./hideout-view.component.scss']
})
export class HideoutViewComponent implements OnInit {
  @Input() hideoutData;
  tarkovWikiBaseUrl: string;

  constructor() {
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';
  }

  ngOnInit(): void {
  }

  trackHideoutModule(index, item) {
    return item.id;
  }

  trackHideoutLevel(index, item) {
    return item.id;
  }

  getWikiItemUrl(itemName, localImgUrl) {
    if (localImgUrl) return 'assets/imgs/' + localImgUrl;
    const foundMatch = _.find(pricesData, (priceData) => _.includes(_.toLower(itemName), _.toLower(priceData.name)))
    return foundMatch && foundMatch.wikiImgUrl.startsWith('http') && foundMatch.wikiImgUrl || 'assets/imgs/blank.png';
  }

}
