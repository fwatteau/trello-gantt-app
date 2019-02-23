import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatSelectModule,
  MatFormFieldModule,
  MatOptionModule,
  MatDialogModule,
  MatExpansionModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatInputModule,
  MatListModule,
  MatGridListModule,
  MatChipsModule, MatToolbarModule
} from "@angular/material";
import { DialogFilterComponent } from './dialog-filter/dialog-filter.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import { DialogSettingComponent } from './dialog-setting/dialog-setting.component';

@NgModule({
  imports:      [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatGridListModule,
    MatToolbarModule,
    MatChipsModule,
    MatDividerModule],
  declarations: [ AppComponent, HelloComponent, DialogFilterComponent, DialogSettingComponent ],
  entryComponents: [DialogFilterComponent,DialogSettingComponent],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
