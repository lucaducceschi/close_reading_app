import { Component, EventEmitter, Input, Output } from '@angular/core';
import { aDocument, Document } from '../models/document';
import { MatDialog } from '@angular/material/dialog';
import { AddTextsDialogComponent } from '../add-texts-dialog/add-texts-dialog.component';
import { DocumentService } from '../services/document.service';
import { MatSelectionList } from '@angular/material/list';
import * as _ from 'lodash';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
})
export class SidePanelComponent {
  openedDocument: Document;

  @Output() documentListSelectionChangeEvent = new EventEmitter<any>();
  @Output() removeDocumentFromListEvent = new EventEmitter<any>();

  constructor(
    public dialog: MatDialog,
    private documentService: DocumentService
  ) {}

  documentListSelectionChange($event: any) {
    this.documentListSelectionChangeEvent.emit($event);
  }

  removeDocumentFromList($event: any) {
    this.openedDocument = undefined;
    this.removeDocumentFromListEvent.emit($event);
  }

  openAddTextsDialog() {
    this.documentService.listTexts().subscribe((data) => {
      const documentList = Object.values(data).map((value, index) =>
        aDocument({
          docId: Object.keys(data)[index],
          title: value.title,
          author: value.author,
        })
      );

      const dialogRef = this.dialog.open(AddTextsDialogComponent, {
        data: documentList.filter(
          (document) => this.openedDocument?.docId != document.docId
        ),
      });

      dialogRef.afterClosed().subscribe((data: any) => {
        if (data) {
          this.openedDocument = data.selectedOptions?.selected[0].value;
          this.documentListSelectionChange(this.openedDocument);
        }
      });
    });
  }
}
