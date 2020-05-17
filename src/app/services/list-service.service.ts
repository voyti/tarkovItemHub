import { Injectable } from '@angular/core';

const AMOUNT_LOCK_CAP = 20;
@Injectable({
  providedIn: 'root'
})
export class ListServiceService {

  constructor() { }

  getAmountCap() {
    return AMOUNT_LOCK_CAP;
  }
}
