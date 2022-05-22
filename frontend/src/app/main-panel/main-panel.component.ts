import {
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { TokenLens } from '../models/document-token-lens';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.scss'],
})
export class MainPanelComponent {
  @Input() selectedDocument: string = '';
  @Input() tokenLenses: TokenLens[] = [];

  constructor(private elementRef: ElementRef) {}

  ngAfterContentChecked() {
    if (this.isMainPanelVisible()) {
      this.resetLenses();
      this.applyTokenLenses();
    }
  }

  isMainPanelVisible(): boolean {
    return (
      this.elementRef.nativeElement.offsetParent != null &&
      this.selectedDocument != ''
    );
  }

  resetLenses() {
    document
      .querySelectorAll('.word')
      .forEach((span) => span.removeAttribute('style'));
    document
      .querySelectorAll('.mwt')
      .forEach((span) => span.removeAttribute('style'));
    document
      .querySelectorAll('.sentence')
      .forEach((span) => span.removeAttribute('style'));
  }

  applyTokenLenses() {
    this.tokenLenses.forEach((tokenLens) => {
      tokenLens.tokenResult.forEach((token) => {
        const element = document.getElementById(token);
        if (element) {
          element.style.fontFamily = tokenLens.lens.font;
          element.style.color = tokenLens.lens.color;
          element.style.backgroundColor = tokenLens.lens.highlight;
        }
      });
    });
  }
}
