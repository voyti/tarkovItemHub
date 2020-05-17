import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-quests-view',
  templateUrl: './quests-view.component.html',
  styleUrls: ['./quests-view.component.scss']
})
export class QuestsViewComponent implements OnInit {
  @Input() questsData;
  tarkovWikiBaseUrl: string;
  constructor() {
    this.tarkovWikiBaseUrl = 'https://escapefromtarkov.gamepedia.com';
  }

  ngOnInit(): void {
  }

}
