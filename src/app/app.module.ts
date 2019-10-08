import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from 'ngx-clipboard';
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatOptionModule, MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { DialogFilterComponent } from './dialog-filter/dialog-filter.component';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DialogSettingComponent } from './dialog-setting/dialog-setting.component';
import { DialogGanttComponent } from './dialog-gantt/dialog-gantt.component';
import { ThiaComponent } from './thia/thia.component';
import { TypePipe } from './type.pipe';

@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ClipboardModule,
    FontAwesomeModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatListModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatChipsModule,
    MatDividerModule],
  declarations: [ AppComponent, HelloComponent, DialogFilterComponent, DialogSettingComponent, DialogGanttComponent, ThiaComponent, TypePipe ],
  entryComponents: [DialogFilterComponent,DialogSettingComponent,DialogGanttComponent],
  bootstrap:    [ AppComponent ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
  ],
})
export class AppModule { }
