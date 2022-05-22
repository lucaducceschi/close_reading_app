import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnChanges {
  @Input() selectedDocument: string = '';

  safeSelectedDocument: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.safeSelectedDocument = this.sanitizer.bypassSecurityTrustHtml(
      this.selectedDocument
    );
  }
}
