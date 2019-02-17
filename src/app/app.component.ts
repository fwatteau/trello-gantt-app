import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";

import { Observable } from 'rxjs';
import "dhtmlxgantt";
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
    // this.trelloService.authorize();

    gantt.config.xml_date = "%d-%m-%Y %H:%i";

    gantt.init(this.ganttContainer.nativeElement);
  }

  login() {
    if (window['Trello']) {
      // this.trelloService.authorize(this.success, this.failure);
        window['Trello'].authorize({
            type: 'popup',
            name: 'Gantt App',
            scope: {
                read: 'true',
                write: 'false'
            },
            expiration: 'never',
            success: () => {this.success()},
            error: () => {this.failure()},
        });
    } else {
      console.log('Trello does not exist.');
    }
  }

  success() {
    this.boards = this.trelloService.getBoards();
      this.boards.subscribe(() => {
         this.boardSelected = this.boards[0];
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
            .then(([data, links]) => {
              gantt.parse({data, links});
          });
      })
    }
  }
}
