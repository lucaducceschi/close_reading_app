import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Document } from '../models/document';

@Component({
  selector: 'app-side-panel-document-list',
  templateUrl: './side-panel-document-list.component.html',
  styleUrls: ['./side-panel-document-list.component.scss'],
})
export class SidePanelDocumentListComponent {
  @Input() openedDocument: Document;
  @Output() documentListSelectionChangeEvent = new EventEmitter<any>();
  @Output() removeDocumentFromListEvent = new EventEmitter<any>();

  constructor() {}

  documentListSelectionChange($event: any) {
    this.documentListSelectionChangeEvent.emit($event.option.value);
  }

  removeDocumentFromList(documentToRemove: Document) {
    this.removeDocumentFromListEvent.emit(documentToRemove.docId);
  }
}
