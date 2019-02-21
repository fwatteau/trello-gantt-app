import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BoardConfiguration} from "../../model/boardConfiguration";
import {Board} from "../../model/board";
import {Member} from "../../model/member";

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
    this.data.memberFiltered = null;
  }

  ngOnInit() {
  }

  compareObjects(o1: Member, o2: Member): boolean {
    return o1 && o2 && o1.id === o2.id;
  }
}
