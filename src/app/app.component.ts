import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";

import { Observable } from 'rxjs';
import "dhtmlx-gantt";
// import {} from "@types/dhtmlxgantt";
import {TaskService} from "../service/task.service";
import {TrelloService} from "../service/trello.service";

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  providers: [TaskService, TrelloService]
})
export class AppComponent implements OnInit {
  token: string = null;
  @ViewChild("gantt_here") ganttContainer: ElementRef;

  boards: Observable<any[]>;
  boardSelected: string = "";

  constructor(private taskService: TaskService, private trelloService: TrelloService) {

  }

  ngOnInit(): void {
    this.trelloService.authorize();

    this.boards = this.trelloService.getBoards();
    this.boards.subscribe((b) => {
        if (b[0]) this.boardSelected = b[0].id;
        this.updateGantt();
    });

    gantt.config.xml_date = "%d-%m-%Y";

    gantt.init(this.ganttContainer.nativeElement);
  }

  success() {
    this.boards = this.trelloService.getBoards();
    this.boards.subscribe((b) => {
      this.boardSelected = b[0].id;
    });
  }

  failure() {
    console.log("Couldn't authenticate successfully.");
  }

  updateGantt() {
  if (this.boardSelected) {
      var cards = this.trelloService.getCards(this.boardSelected);
      cards.subscribe((c) => {
          this.taskService.get(c)
            .then((data) => {
              gantt.parse({data});
          });
      })
    }
  }
}
