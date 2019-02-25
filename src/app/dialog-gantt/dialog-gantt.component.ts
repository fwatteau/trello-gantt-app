import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {GanttConfiguration} from "../../model/gantt.configuration";

@Component({
  selector: 'app-dialog-gantt',
  templateUrl: './dialog-gantt.component.html',
  styleUrls: ['./dialog-gantt.component.css']
})
export class DialogGanttComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogGanttComponent>,
    @Inject(MAT_DIALOG_DATA) public conf: GanttConfiguration) { }

  ngOnInit() {

  }

  clean() {
    this.conf = new GanttConfiguration();
  }
}
