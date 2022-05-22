import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { Document } from '../models/document';

@Component({
  selector: 'app-add-texts-dialog',
  templateUrl: './add-texts-dialog.component.html',
  styleUrls: ['./add-texts-dialog.component.scss'],
})
export class AddTextsDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Document[]) {}
  ngOnInit(): void {}
}
