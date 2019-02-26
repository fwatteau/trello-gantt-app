import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";

import { Observable } from 'rxjs';
import "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip"
import "dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker"
import {TaskService} from "../service/task.service";
import {TrelloService} from "../service/trello.service";
import {Board} from "../model/board";
import {Card} from "../model/card";
import {DialogFilterComponent} from "./dialog-filter/dialog-filter.component";
import {MatDialog, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {BoardConfigurationService} from "../service/board.configuration.service";
import {DialogSettingComponent} from "./dialog-setting/dialog-setting.component";
import {Task} from "../model/task";
import {environment} from "../environments/environment";
import {DialogGanttComponent} from "./dialog-gantt/dialog-gantt.component";
import {GanttConfiguration} from "../model/gantt.configuration";

@Component({
  selector: 'my-app',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html',
  providers: [TaskService, TrelloService]
})
export class AppComponent implements OnInit {
  @ViewChild("gantt_here") ganttContainer: ElementRef;
  @ViewChild("message") messageContainer: ElementRef;
  boards: Observable<Board[]>;
  boardSelected: Board;
  filteredNumber: number = 0;
  version:string = environment.VERSION;

  constructor(private taskService: TaskService, private trelloService: TrelloService, private dialog: MatDialog, private snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    this.trelloService.authorize();
    // Initialisation du Gantt
    this.initGantt();

    // Recherche des cartes
    this.boards = this.trelloService.getBoards();
    this.boards.subscribe((b) => {

      let id = localStorage.getItem("boardId");
      this.boardSelected = b.filter(b => b.id == id).pop();
      if (!this.boardSelected && b[0]) {
        this.boardSelected = b[0];
      }

      this.updateGantt();
    });
  }

  initGantt(): void {
    let ganttConf = AppComponent.getGanttConfiguration();

    if (ganttConf.xml_date) gantt.config.xml_date = ganttConf.xml_date;
    if (ganttConf.scale_unit) gantt.config.scale_unit = ganttConf.scale_unit;
    // gantt.config.date_scale = "S%W (%M %Y)";
    if (ganttConf.date_scale) gantt.config.date_scale = ganttConf.date_scale;
    if (ganttConf.readonly) gantt.config.readonly = ganttConf.readonly;
    if (ganttConf.date_grid) gantt.config.date_grid = ganttConf.date_grid;

    gantt.attachEvent("onTaskClick", function(id){
      const t = this.getTask(id);
      if (t.url)
        window.open(t.url,"cardWindow");
      return true;
    });

    gantt.templates.task_text=function(start,end,task: Task){
      const marker = task.marker ? "<i class=\"fas " + task.marker + "\"></i> " : "";
      let stickers = "";
      task.stickers.forEach(s => stickers += `<img height="25" src="${s}"/>`);

      return stickers + marker + task.text;
    };

    gantt.templates.rightside_text = function(start, end, task: Task){
      return task.listName;
    };

    gantt.templates.tooltip_text = function(start,end,task){
      const marker = task.marker ? "<i class=\"fas " + task.marker + "\"></i> " : "";
      let stickers = "";
      task.stickers.forEach(s => stickers += `<img height="25" src="${s}"/>`);

      return "<b>" + stickers + marker + task.text + "</b><br/>" + task.descr;
    };

    gantt.config.sort = true;

    gantt.config.columns = [
      {name:"text",       label:"Action",  width:"*", tree:true },
      {name:"start_date", label:"Date de début", align:"center" },
    ];

    gantt.init(this.ganttContainer.nativeElement);
  }


  openFilterDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfigurationService = AppComponent.getConfiguration(anyBoard);
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

  openGanttDialog(): void {
    let ganttConf = AppComponent.getGanttConfiguration();

    const dialogRef = this.dialog.open(DialogGanttComponent, {
      maxHeight: "50%",
      maxWidth: "75%",
      minWidth: "50%",
      data: ganttConf
    });

    dialogRef.afterClosed().subscribe(result => {
      localStorage.setItem("ganttConf", JSON.stringify(result));
      this.initGantt();
    });
  }

  openSettingDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfigurationService = AppComponent.getConfiguration(anyBoard);
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
        const conf:BoardConfigurationService = AppComponent.getConfiguration(anyBoard);
        const gantConf: GanttConfiguration = AppComponent.getGanttConfiguration();
        const cards:Observable<Card[]> = this.trelloService.getCards(anyBoard.id);
        const regex = new RegExp(conf.filter.name ? conf.filter.name : '.*', "i");
        const snackConf = new MatSnackBarConfig();
        snackConf.verticalPosition = "bottom";
        snackConf.horizontalPosition = "center";
        snackConf.panelClass = "snack-container";

        cards.subscribe((cards) => {
          // Filtre sur les membres, les listes ou le nom de la carte
          const filteredCards = cards.filter((anyCard: Card) => {
            return (!conf.filter.members.length || anyCard.idMembers.filter((value: string) => conf.filter.members.includes(value)).length)
              && (!conf.filter.lists.length || !conf.filter.lists.includes(anyCard.idList))
              && (regex.test(anyCard.name));
          });

          // Ajout dans le Gantt
          this.taskService.get(filteredCards, conf, gantConf)
            .then((data) => {
                const size = data.filter(c => c.type === "task").length;
                this.filteredNumber = cards.length - size;
                if (cards.length !== size) {
                   this.snackBar.open((cards.length - size) + " élément(s) masqué(s) !", "Fermer", snackConf);
                }
                gantt.parse({data});
          });
        });
      })
    }
  }

  private static getConfiguration(boardSelected: Board) {
    let conf = new BoardConfigurationService();

    if (boardSelected) {
      let json = localStorage.getItem(boardSelected.id);

      if (json) {
        const jsonObject = <BoardConfigurationService>JSON.parse(json)
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

  private static saveConfiguration(conf: BoardConfigurationService) {
    localStorage.setItem(conf.board.id, JSON.stringify(conf));
  }

  public isSettingActive() {
    const conf:BoardConfigurationService = AppComponent.getConfiguration(this.boardSelected);
    return !conf.isEmptySetting();
  }

  public isFilterActive() {
    const conf:BoardConfigurationService = AppComponent.getConfiguration(this.boardSelected);
    return !conf.isEmptyFilter();
  }

  private static getGanttConfiguration(): GanttConfiguration {
    let conf = new GanttConfiguration();
    let json = localStorage.getItem("ganttConf");
    if (json) {
      conf = JSON.parse(json);
    }
    return conf;
  }

  public clean() {
    if (window.confirm("Confirmes tu la suppresion de toutes les données enregistrements (préférences, connexion Trello) ?")) {
      localStorage.clear();
      location.reload();
    }
  }
}
