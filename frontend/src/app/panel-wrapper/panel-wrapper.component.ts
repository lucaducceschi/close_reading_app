import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { aDocument, Document } from '../models/document';
import { TokenLens } from '../models/document-token-lens';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-panel-wrapper',
  templateUrl: './panel-wrapper.component.html',
  styleUrls: ['./panel-wrapper.component.scss'],
})
export class PanelWrapperComponent {
  selectedDocument: string = '';
  selectedDocId: string = '';

  @Output() changedSelectedDocId = new EventEmitter();

  @Input() tokenLenses: TokenLens[] = [];

  constructor(private documentService: DocumentService) {}

  changeSelectedDocument($event: Document) {
    this.documentService.getDocument($event.docId).subscribe((data) => {
      this.selectedDocument = data;
      this.selectedDocId = $event.docId;
      this.changedSelectedDocId.emit(this.selectedDocId);
    });
  }

  removeDocumentFromList($event: string) {
    if (this.selectedDocId == $event) {
      this.selectedDocument = '';
      this.changedSelectedDocId.emit(this.selectedDocId);
    }
  }
}
