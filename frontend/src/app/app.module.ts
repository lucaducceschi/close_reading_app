import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WrapperComponent } from './wrapper/wrapper.component';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { MainPanelComponent } from './main-panel/main-panel.component';
import { PanelWrapperComponent } from './panel-wrapper/panel-wrapper.component';
import { DocumentComponent } from './document/document.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidePanelDocumentListComponent } from './side-panel-document-list/side-panel-document-list.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { AddTextsDialogComponent } from './add-texts-dialog/add-texts-dialog.component';
import { RemoveCardsDialogComponent } from './remove-cards-dialog/remove-cards-dialog.component';
import { FilterWrapperComponent } from './filter-wrapper/filter-wrapper.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FilterMainPanelComponent } from './filter-main-panel/filter-main-panel.component';
import { FilterSidePanelComponent } from './filter-side-panel/filter-side-panel.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    AppComponent,
    WrapperComponent,
    HeaderComponent,
    SidePanelComponent,
    MainPanelComponent,
    PanelWrapperComponent,
    DocumentComponent,
    SidePanelDocumentListComponent,
    AddTextsDialogComponent,
    RemoveCardsDialogComponent,
    FilterWrapperComponent,
    FilterMainPanelComponent,
    FilterSidePanelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    ScrollingModule,
    DragDropModule,
    MatExpansionModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
