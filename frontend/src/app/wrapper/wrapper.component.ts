import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { TokenLens } from '../models/document-token-lens';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
})
export class WrapperComponent {
  selectedDocId: string = '';
  selectedTabIndex: number;

  tokenLenses: TokenLens[] = [];

  resetCards = new Subject<any>();

  updateSelectedDocId($event: any) {
    this.selectedDocId = $event;
    this.tokenLenses = [];
    this.resetCards.next(true);
  }

  updateTokenLenses(tokenLenses: TokenLens[]) {
    this.tokenLenses = [...tokenLenses];
  }

  updateSelectedTabIndex($event: number) {
    this.selectedTabIndex = $event;
  }
}
