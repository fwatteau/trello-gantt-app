import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";

import { Observable } from 'rxjs';
import "dhtmlx-gantt";
import {TaskService} from "../service/task.service";
import {TrelloService} from "../service/trello.service";
import {Board} from "../model/board";
import {Card} from "../model/card";


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  providers: [TaskService, TrelloService]
})
export class AppComponent implements OnInit {
  @ViewChild("gantt_here") ganttContainer: ElementRef;
  boards: Observable<Board[]>;
  boardSelected: Board = new Board();
  memberFiltered: any;

  constructor(private taskService: TaskService, private trelloService: TrelloService) {

  }

  ngOnInit(): void {
    this.trelloService.authorize();

    this.boards = this.trelloService.getBoards();
    this.boards.subscribe((b) => {
        if (b[0]) {
          this.boardSelected = b[0];
        }
        this.updateGantt();
    });

    gantt.config.xml_date = "%d-%m-%Y";
    gantt.config.scale_unit = "week";
    gantt.config.date_scale = "S%W (%M %Y)";
    gantt.config.readonly = true;
    gantt.config.date_grid = "%d %M %Y";

    gantt.templates.task_text=function(start,end,task){
      const marker = task.marker ? "<i class=\"fas fa-skull-crossbones\"></i> " : "";
      return task.users ?
        marker+task.text+",<b> By:</b> "+task.users :
        marker+task.text;
    };
    gantt.init(this.ganttContainer.nativeElement);
  }

  updateGantt(member?) {
    gantt.clearAll();
    if (this.boardSelected) {
      const cards = this.trelloService.getCards(this.boardSelected.id);
      cards.subscribe((c) => {
        const filteredCards = c.filter((anyCard: Card) => {
          return !this.memberFiltered || anyCard.idMembers.includes(this.memberFiltered);
        });
        this.taskService.get(filteredCards)
          .then((data) => {
              gantt.parse({data});
        });
      })
    }
  }
}
