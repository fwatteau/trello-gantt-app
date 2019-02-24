import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FilterConfiguration} from "../../model/filter.configuration";
import {BoardConfigurationService} from "../../service/board.configuration.service";

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
    this.data.filter = new FilterConfiguration();
  }

  ngOnInit() {
  }
}
