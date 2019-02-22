import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";

import { Observable } from 'rxjs';
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip"
import {TaskService} from "../service/task.service";
import {TrelloService} from "../service/trello.service";
import {Board} from "../model/board";
import {Card} from "../model/card";
import {DialogFilterComponent} from "./dialog-filter/dialog-filter.component";
import {MatDialog} from "@angular/material";
import {BoardConfiguration} from "../model/boardConfiguration";
import {faCog, faFilter} from '@fortawesome/free-solid-svg-icons';
import {DialogSettingComponent} from "./dialog-setting/dialog-setting.component";
import {Member} from "../model/member";
import {List} from "../model/list";

@Component({
  selector: 'my-app',
  styles: ['form { display: flex;flex-direction: row; } .active {color: blue}'],
  templateUrl: './app.component.html',
  providers: [TaskService, TrelloService]
})
export class AppComponent implements OnInit {
  @ViewChild("gantt_here") ganttContainer: ElementRef;
  boards: Observable<Board[]>;
  boardSelected: Board;
  filterIcon = faFilter;
  settingIcon = faCog;

  constructor(private taskService: TaskService, private trelloService: TrelloService, private dialog: MatDialog) {

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
    // gantt.config.date_scale = "S%W (%M %Y)";
    gantt.config.date_scale = "%d %M";
    gantt.config.readonly = true;
    gantt.config.date_grid = "%d %M %Y";

    gantt.attachEvent("onTaskClick", function(id,e){
      const t = this.getTask(id);
      window.open(t.url,"cardWindow");
      return true;
    });

    gantt.templates.task_text=function(start,end,task){
      const marker = task.marker ? "<i class=\"fas " + task.marker + "\"></i> " : "";
      return task.users ?
        marker+task.text+",<b> By:</b> "+task.users :
        marker+task.text;
    };

    gantt.templates.tooltip_text = function(start,end,task){
      const marker = task.marker ? "<i class=\"fas " + task.marker + "\"></i> " : "";
      return "<b>" + marker + task.text + "</b><br/>" + task.descr;
    };

    gantt.init(this.ganttContainer.nativeElement);
  }

  openFilterDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfiguration = this.getConfiguration(anyBoard);
      const dialogRef = this.dialog.open(DialogFilterComponent, {
        maxHeight: "50%",
        maxWidth: "75%",
        minWidth: "50%",
        data: conf
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) this.saveConfiguration(result);

        this.updateGantt();
      });
    });
  }

  openSettingDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfiguration = this.getConfiguration(anyBoard);
      const dialogRef = this.dialog.open(DialogSettingComponent, {
        minWidth: "50%",
        maxWidth: "75%",
        maxHeight: "75%",
        data: conf
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) this.saveConfiguration(result);

        this.updateGantt();
      });
    });
  }

  updateGantt() {
    gantt.clearAll();

    if (this.boardSelected) {
      const board = this.trelloService.getBoard(this.boardSelected.id);
      board.subscribe((anyBoard) => {
        const conf:BoardConfiguration = this.getConfiguration(anyBoard);
        const cards:Observable<Card[]> = this.trelloService.getCards(anyBoard.id);

        cards.subscribe((cards) => {
          // Filtre sur les membres, les listes ou le nom de la carte
          const filteredCards = cards.filter((anyCard: Card) => {
            return (!conf.filter.members.length || anyCard.idMembers.filter((value: string) => conf.filter.members.includes(value)).length)
              && (!conf.filter.lists.length || conf.filter.lists.includes(anyCard.idList))
              && (!conf.filter.name || !anyCard.name.search(new RegExp(conf.filter.name, "i")));
          });

          // Ajout dans le Gantt
          this.taskService.get(filteredCards, conf)
            .then((data) => {
                gantt.parse({data});
          });
        });
      })
    }
  }

  private getConfiguration(boardSelected: Board) {
    let conf = new BoardConfiguration();

    if (boardSelected) {
      let json = localStorage.getItem(boardSelected.id);

      if (json) {
        conf = JSON.parse(json);
      }
    }

    conf.board = boardSelected;
    return conf;
  }

  public compareBoard(o1: Board, o2: Board): boolean {
    return o1 && o2 && o1.id === o2.id;
  }

  private saveConfiguration(conf: BoardConfiguration) {
    localStorage.setItem(conf.board.id, JSON.stringify(conf));
  }

  public isSettingActive() {
    const conf:BoardConfiguration = this.getConfiguration(this.boardSelected);
    return conf.field_start_date || conf.field_end_date;
  }

  public isFilterActive() {
    const conf:BoardConfiguration = this.getConfiguration(this.boardSelected);
    return conf.filter.members.length || conf.filter.lists.length || conf.filter.name;
  }
}
