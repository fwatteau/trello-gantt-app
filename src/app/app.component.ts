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

import {BoardConfigurationService} from "../service/board.configuration.service";
import {DialogSettingComponent} from "./dialog-setting/dialog-setting.component";
import {Task} from "../model/task";
import {environment} from "../environments/environment";
import {DialogGanttComponent} from "./dialog-gantt/dialog-gantt.component";
import {GanttConfiguration} from "../model/gantt.configuration";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import * as moment from 'moment';

declare let gantt: any;
@Component({
  selector: 'my-app',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html',
  providers: [TaskService, TrelloService]
})
export class AppComponent implements OnInit {
  @ViewChild("gantt_here", { static: true }) ganttContainer: ElementRef;
  @ViewChild("message", { static: true }) messageContainer: ElementRef;
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

    gantt.attachEvent("onAfterSort",function(field, direction, parent){
      // your code here
      let conf:BoardConfigurationService = AppComponent.getConfiguration(this.boardSelected);
      conf.setting.sort_field = field;
      conf.setting.sort_direction = direction;
      AppComponent.saveConfiguration(conf);
    }.bind(this));

    gantt.config.sort = true;

    gantt.config.columns = [
      {
        name: "overdue", label: "", width: 38, template: function (obj) {
          if (obj.deadline) {
            var deadline = gantt.date.parseDate(obj.deadline, "xml_date");
            if (deadline && obj.end_date > deadline) {
              return '<div class="overdue-indicator">!</div>';
            }
          }
          return '<div></div>';
        }
      },
      {name:"text",       label:"Action",  width:"*", tree:true },
      // {name:"start_date", label:"Date de début", align:"center" },
    ];
    gantt.locale.labels.section_deadline = "Deadline";


/*    gantt.addTaskLayer(function draw_deadline(task) {
      if (task.deadline) {
        var el = document.createElement('div');
        el.className = 'deadline';
        var sizes = gantt.getTaskPosition(task, task.deadline);
  
        el.style.left = sizes.left + 'px';
        el.style.top = sizes.top + 'px';
  
        el.setAttribute('title', gantt.templates.task_date(task.deadline));
        return el;
      }
      return false;
    });*/
  
    gantt.templates.task_class = function (start, end, task) {
      if (task.deadline && end.valueOf() > task.deadline.valueOf()) {
        return 'overdue';
      }
    };
  
    gantt.templates.rightside_text = function (start, end, task) {
      if (task.deadline) {
        if (end.valueOf() > task.deadline.valueOf()) {
          var overdue = Math.ceil(Math.abs((end.getTime() - task.deadline.getTime()) / (24 * 60 * 60 * 1000)));
          var text = "<b>Overdue: " + overdue + " days</b>";
          return text;
        }
      }
    };
  
    gantt.attachEvent("onTaskLoading", function (task) {
      if (task.deadline)
        task.deadline = gantt.date.parseDate(task.deadline, "xml_date");
      return true;
    });

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
      this.updateGantt();
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

    // On ajoute le marker "Aujourd'hui"
    gantt.addMarker({
      start_date: new Date(), //a Date object that sets the marker's date
      css: "today", //a CSS class applied to the marker
      text: "Aujourd'hui", //the marker title
      title:moment().toISOString() // the marker's tooltip
    });

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
          this.taskService.getTasks(filteredCards, conf, gantConf)
            .then((data) => {
              const size = data.filter(c => c.type === "task").length;
              this.filteredNumber = cards.length - size;
              if (cards.length !== size) {
                 this.snackBar.open((cards.length - size) + " élément(s) masqué(s) !", "Fermer", snackConf);
              }
              gantt.parse({data});

              // On remet le tri mémorisé
              if (conf.setting.sort_field) {
                gantt.sort(conf.setting.sort_field, conf.setting.sort_direction);
              }
          });

          this.taskService.getMarkers(cards, conf, gantConf)
            .then(m => m.forEach(mker => gantt.addMarker(mker)));
        });
      });
    }
  }

  private static getConfiguration(boardSelected: Board) {
    let conf = new BoardConfigurationService();

    if (boardSelected) {
      let json = localStorage.getItem(boardSelected.id);

      if (json) {
        const jsonObject = <BoardConfigurationService>JSON.parse(json);
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
    const newConf = JSON.stringify(conf);
    if (newConf) {
      localStorage.setItem(conf.board.id, newConf);
    } else {
      console.error('Impossible d\'enregistrer la conf : ', conf);
    }
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
    if (window.confirm("Confirmes tu la suppression de toutes les données enregistrements (préférences, connexion Trello) ?")) {
      localStorage.clear();
      window.location.reload();
    }
  }
}
