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
import {Task} from "../model/task";

@Component({
  selector: 'my-app',
  styleUrls: ['./app.component.css'],
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

      let id = localStorage.getItem("boardId");
      this.boardSelected = b.filter(b => b.id == id).pop();
      if (!this.boardSelected && b[0]) {
        this.boardSelected = b[0];
      }

      this.updateGantt();
    });

    gantt.config.xml_date = "%Y-%m-%d";
    gantt.config.scale_unit = "week";
    // gantt.config.date_scale = "S%W (%M %Y)";
    gantt.config.date_scale = "%d %M";
    gantt.config.readonly = true;
    gantt.config.date_grid = "%d %M %Y";

    gantt.attachEvent("onTaskClick", function(id){
      const t = this.getTask(id);
      window.open(t.url,"cardWindow");
      return true;
    });

    gantt.templates.task_text=function(start,end,task: Task){
      const marker = task.marker ? "<i class=\"fas " + task.marker + "\"></i> " : "";
      let stickers = "<mat-chip-list>";
      task.stickers.forEach(s => stickers += `<img height="25" src="${s}"/>`);
      stickers += "</mat-chip-list>";

      console.log(stickers);

      return marker+task.text+stickers;
    };

    gantt.templates.tooltip_text = function(start,end,task){
      const marker = task.marker ? "<i class=\"fas " + task.marker + "\"></i> " : "";
      let stickers = "";
      task.stickers.forEach(s => stickers += `<img height="25" src="${s}"/>`);
      return "<b>" + marker + task.text + stickers + "</b><br/>" + task.descr;
    };

    gantt.init(this.ganttContainer.nativeElement);
  }

  openFilterDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfiguration = AppComponent.getConfiguration(anyBoard);
      const dialogRef = this.dialog.open(DialogFilterComponent, {
        maxHeight: "50%",
        maxWidth: "75%",
        minWidth: "50%",
        data: conf
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) AppComponent.saveConfiguration(result);

        this.updateGantt();
      });
    });
  }

  openSettingDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfiguration = AppComponent.getConfiguration(anyBoard);
      const dialogRef = this.dialog.open(DialogSettingComponent, {
        minWidth: "50%",
        maxWidth: "75%",
        maxHeight: "75%",
        data: conf
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) AppComponent.saveConfiguration(result);

        this.updateGantt();
      });
    });
  }

  updateGantt() {
    gantt.clearAll();

    if (this.boardSelected) {
      localStorage.setItem("boardId", this.boardSelected.id);
      const board = this.trelloService.getBoard(this.boardSelected.id);
      board.subscribe((anyBoard) => {
        const conf:BoardConfiguration = AppComponent.getConfiguration(anyBoard);
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

  private static getConfiguration(boardSelected: Board) {
    let conf = new BoardConfiguration();

    if (boardSelected) {
      let json = localStorage.getItem(boardSelected.id);

      if (json) {
        const jsonObject = <BoardConfiguration>JSON.parse(json)
        conf.filter = jsonObject.filter;
        conf.setting = jsonObject.setting;
      }
    }

    conf.board = boardSelected;
    return conf;
  }

  public compareBoard(o1: Board, o2: Board): boolean {
    return o1 && o2 && o1.id === o2.id;
  }

  private static saveConfiguration(conf: BoardConfiguration) {
    localStorage.setItem(conf.board.id, JSON.stringify(conf));
  }

  public isSettingActive() {
    const conf:BoardConfiguration = AppComponent.getConfiguration(this.boardSelected);
    return !conf.isEmptySetting();
  }

  public isFilterActive() {
    const conf:BoardConfiguration = AppComponent.getConfiguration(this.boardSelected);
    return !conf.isEmptyFilter();
  }
}
