import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {SettingConfiguration} from "../../model/setting.configuration";
import {BoardConfigurationService} from "../../service/board.configuration.service";
import { Field } from 'src/model/field';

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
    if (!Array.isArray(this.conf.setting.columns)) {
      this.conf.setting.columns = [];
    }
  }

  clean(): void {
    this.conf.setting = new SettingConfiguration();
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
  }

  getVirtualField(id: string, name: string, type = 'virtual') {
    const virtualField = new Field();
    virtualField.id = id;
    virtualField.name = name;
    virtualField.type = type;

    return virtualField;
  }
}
