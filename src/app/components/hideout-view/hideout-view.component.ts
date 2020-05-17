import { Component, OnInit, Input, SystemJsNgModuleLoaderConfig } from '@angular/core';

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

}
