import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BoardConfiguration} from "../../model/boardConfiguration";
import {Member} from "../../model/member";
import {FilterConfiguration} from "../../model/filterConfiguration";

@Component({
  selector: 'app-dialog-filter',
  templateUrl: './dialog-filter.component.html',
  styleUrls: ['./dialog-filter.component.css']
})
export class DialogFilterComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardConfiguration) {}

  clean(): void {
    this.data.filter = new FilterConfiguration();
  }

  ngOnInit() {
  }
}
