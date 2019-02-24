import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {SettingConfiguration} from "../../model/setting.configuration";
import {BoardConfigurationService} from "../../service/board.configuration.service";

@Component({
  selector: 'app-dialog-setting',
  templateUrl: './dialog-setting.component.html',
  styleUrls: ['./dialog-setting.component.css']
})
export class DialogSettingComponent implements OnInit {
  customDates: any;

  constructor(
    public dialogRef: MatDialogRef<DialogSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public conf: BoardConfigurationService) {

  }

  ngOnInit() {
    this.customDates = this.conf.board.customFields.filter((cf) => cf.type === "date");
  }

  clean(): void {
    this.conf.setting = new SettingConfiguration();
  }
}
