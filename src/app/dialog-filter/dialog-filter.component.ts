import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {FilterConfiguration} from "../../model/filter.configuration";
import {BoardConfigurationService} from "../../service/board.configuration.service";
import { threadId } from 'worker_threads';

@Component({
  selector: 'app-dialog-filter',
  templateUrl: './dialog-filter.component.html',
  styleUrls: ['./dialog-filter.component.css']
})
export class DialogFilterComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardConfigurationService) {}

  clean(): void {
    const newFilter = new FilterConfiguration();
    this.data.board.customFields.forEach(cf => {
      if (!newFilter.customFields[cf.id]) {
        if (cf.type === 'list') newFilter.customFields[cf.id] = [];
        if (cf.type === 'date' || cf.type === 'number') newFilter.customFields[cf.id] = {};
      }
    });
    this.data.filter = newFilter;
  }

  ngOnInit() {
    this.data.board.customFields.forEach(cf => {
      if (!this.data.filter.customFields[cf.id]) {
        if (cf.type === 'list') this.data.filter.customFields[cf.id] = [];
        if (cf.type === 'date' || cf.type === 'number') this.data.filter.customFields[cf.id] = {};
      }
    });
  }
}
