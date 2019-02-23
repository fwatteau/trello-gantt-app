import {Component, Inject, OnInit} from '@angular/core';
import {BoardConfiguration} from "../../model/boardConfiguration";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {SettingConfiguration} from "../../model/settingConfiguration";
import { library } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-dialog-setting',
  templateUrl: './dialog-setting.component.html',
  styleUrls: ['./dialog-setting.component.css']
})
export class DialogSettingComponent implements OnInit {
  customDates: any;

  constructor(
    public dialogRef: MatDialogRef<DialogSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public conf: BoardConfiguration) {

  }

  ngOnInit() {
    this.customDates = this.conf.board.customFields.filter((cf) => cf.type === "date");
  }

  clean(): void {
    this.conf.setting = new SettingConfiguration();
  }
}
