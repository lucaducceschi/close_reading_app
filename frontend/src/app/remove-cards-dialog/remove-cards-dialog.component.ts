import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Card } from '../models/filter-card';

@Component({
  selector: 'app-remove-cards-dialog',
  templateUrl: './remove-cards-dialog.component.html',
  styleUrls: ['./remove-cards-dialog.component.scss'],
})
export class RemoveCardsDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Card) {}
  ngOnInit(): void {}
}
