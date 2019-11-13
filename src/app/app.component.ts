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
import { ClipboardService } from "ngx-clipboard";

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

  constructor(private taskService: TaskService, private trelloService: TrelloService, private dialog: MatDialog, private snackBar: MatSnackBar, private _clipboardService: ClipboardService) {

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
    if (ganttConf.start_date) gantt.config.start_date = moment(ganttConf.start_date).toDate();
    if (ganttConf.end_date) gantt.config.end_date = moment(ganttConf.end_date).toDate();
    if (ganttConf.scale_unit) gantt.config.scale_unit = ganttConf.scale_unit;
    if (ganttConf.date_scale) gantt.config.date_scale = ganttConf.date_scale;
    if (ganttConf.readonly) gantt.config.readonly = ganttConf.readonly;
    if (ganttConf.date_grid) gantt.config.date_grid = ganttConf.date_grid;

    gantt.config.layout = {
      css: "gantt_container",
      cols: [
        {
          width:400,
          min_width: 300,
          rows:[
            {view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer"}, 
     
             // horizontal scrollbar for the grid
            {view: "scrollbar", id: "gridScroll", group:"horizontal"} 
          ]
        },
        {resizer: true, width: 1},
        {
          rows:[
            {view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer"},
     
            // horizontal scrollbar for the timeline
            {view: "scrollbar", id: "scrollHor", group:"horizontal"}  
          ]
        },
        {view: "scrollbar", id: "scrollVer"}
      ]
    };
    const clickCard = (id => {
      const t = gantt.getTask(id);

      if (t.url && ganttConf.openurl) {
         window.open(t.url,"cardWindow");
      }

      if (this._clipboardService.isSupported) {
        const board = this.trelloService.getBoard(this.boardSelected.id);
        board.subscribe((anyBoard) => {
          const conf:BoardConfigurationService = AppComponent.getConfiguration(anyBoard);

          let col: string = '', colHeader: string = '';
          Object.keys(t).forEach(k => {
            col += t[k] ? `<td>${t[k]}</td>` : `<td>-</td>`;
            const header = conf.board.customFields.filter(cf => cf.id === k).map(cf => cf.name).pop();
            colHeader += `<th>${header ? header : k}</th>`;
          });
          
          this._clipboardService.copyFromContent(`<table><tr>${colHeader}</tr><tr>${col}</tr></table>`);
          this.snackBar.open('Tâche copiée dans le presse-papier', 'Fermer', {duration: 1000});
        });
      } else {
        console.info('La fonctionnalité copie n\'est pas supportée par votre navigateur');
      }

      return true;
    });
    gantt.bind(clickCard, this);
    gantt.attachEvent("onTaskClick", clickCard);

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
            var deadline = gantt.date.parseDate(obj.deadline, "%d/%m/%Y");
            if (obj.end_date.valueOf() > deadline.valueOf()) {
              const overdue = Math.ceil(Math.abs((obj.end_date.getTime() - deadline.getTime()) / (24 * 60 * 60 * 1000))) - 1;

              if (overdue > 0) {
                return '<div class="overdue-indicator">!</div>';
              }
            }
          }
          return '<div></div>';
        }
      },
      {name:"text", label:"Action",  min_width:200, width:400, tree:true }
    ];
  
    gantt.locale.labels.section_deadline = "Deadline";

    gantt.templates.task_class = function (start, end, task) {
      if (task.deadline) {
        const deadline = gantt.date.parseDate(task.deadline, "%d/%m/%Y");
        if (end.valueOf() > deadline.valueOf()) {
          const overdue = Math.ceil(Math.abs((end.getTime() - deadline.getTime()) / (24 * 60 * 60 * 1000))) - 1;
          if (overdue > 0) {
            return `${task.className} overdue`;
          }
        }
      }
      return task.className;
    };
  
    gantt.templates.rightside_text = function (start, end, task) {
      if (task.deadline) {
        var deadline = gantt.date.parseDate(task.deadline, "%d/%m/%Y");
        if (end.valueOf() > deadline.valueOf()) {
          var overdue = Math.ceil(Math.abs((end.getTime() - deadline.getTime()) / (24 * 60 * 60 * 1000))) - 1;
          if (overdue > 0) {
            return `<b>En retard de ${overdue} jour${overdue > 1 ? 's' : ''}</b>`;
          }
          return '';
        }
      }
    };

    gantt.init(this.ganttContainer.nativeElement);
  }

  copyAll(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
        board.subscribe((anyBoard) => {
          const conf:BoardConfigurationService = AppComponent.getConfiguration(anyBoard);
          const data = gantt.serialize().data.filter((t: Task) => t.type === 'task');
          let colsHeader = '';
          let body = '';

          
          data.forEach(t => {
            let col = '', colHeader = '';
            Object.keys(t).forEach(k => {
              col += t[k] ? `<td>${t[k]}</td>` : `<td>-</td>`;
              if (!colsHeader) {
                const header = conf.board.customFields.filter(cf => cf.id === k).map(cf => cf.name).pop();
                colHeader += `<th>${header ? header : k}</th>`;
              }
            });
            body += `<tr>${col}</tr>`;
            if (!colsHeader) {
              colsHeader = colHeader;
            }
          });
          
          this._clipboardService.copyFromContent(`<table><thead><tr>${colsHeader}</tr></thead><tbody>${body}</tbody></table>`);
          this.snackBar.open('Tâche(s) copiée(s) dans le presse-papier', 'Fermer', {duration: 1000});
        });
  }

  openFilterDialog(): void {
    const board = this.trelloService.getBoard(this.boardSelected.id);
    board.subscribe((anyBoard) => {
      const conf:BoardConfigurationService = AppComponent.getConfiguration(anyBoard);
      const dialogRef = this.dialog.open(DialogFilterComponent, {
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
      minWidth: "50%",
      data: ganttConf
    });

    dialogRef.afterClosed().subscribe(result => {
      const json = JSON.stringify(result);
      if (json) {
        localStorage.setItem("ganttConf", json);
      } else {
        console.error('Impossible de convertir la conf en json', result);
      }
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
        
        gantt.config.columns.splice(2, gantt.config.columns.length - 2);
        conf.setting.columns
          .forEach(c => gantt.config.columns.push({name: c.id, label: c.name, align: 'right', resize: true}));

        cards.subscribe((cards) => {
          const filteredCustomFields = Object.keys(conf.filter.customFields)
              .filter(cf => (Array.isArray(conf.filter.customFields[cf]) && conf.filter.customFields[cf].length)
                            || (typeof conf.filter.customFields[cf] === 'string' && conf.filter.customFields[cf])
                            || (typeof conf.filter.customFields[cf] === 'object' 
                            && Object.keys(conf.filter.customFields[cf])
                                  .map(key => conf.filter.customFields[cf][key])
                                  .filter(v => v)
                                  .length));
          // Filtre sur les membres, les listes ou le nom de la carte
          const filteredCards = cards.filter((anyCard: Card) => {
            const filteredCustomValidFields =  filteredCustomFields.filter(key => {
              const custom = anyBoard.customFields.filter(cf => cf.id === key).pop();
              const cardValue = anyCard.customFieldItems.filter(cf => cf.idCustomField === key).pop();
              const filterValue = conf.filter.customFields[key];

              // Si aucun filtre n'est posé, on conserve la carte
              if (!filterValue || filterValue.length === 0) return true;
              // Si la carte n'a pas de custom field correspondant, on rejette
              if (!cardValue || cardValue.length === 0) return false;
              switch (custom.type) {
                case 'list' :
                  return filterValue.includes(cardValue.idValue);
                case 'date' : 
                  return moment(cardValue.value.date).isSameOrAfter(filterValue.min ? filterValue.min : cardValue.value.date)
                      && moment(cardValue.value.date).isSameOrBefore(filterValue.max ? filterValue.max : cardValue.value.date);
                case 'number' :
                  return cardValue.value.number >= (filterValue.min ? filterValue.min : 0)
                    && cardValue.value.number <= (filterValue.max ? filterValue.max : cardValue.value.number);
                case 'text' :
                  const rex = new RegExp(filterValue, "i");
                  return rex.test(cardValue.value.text);
                default :
                console.log(custom.type);
                return true;
              }
            });

            return (!conf.filter.members.length || anyCard.idMembers.filter((value: string) => conf.filter.members.includes(value)).length)
              && (!conf.filter.lists.length || !conf.filter.lists.includes(anyCard.idList))
              && (!conf.filter.labels || !conf.filter.labels.length || anyCard.idLabels.filter(lab => conf.filter.labels.includes(lab)).length)
              && (regex.test(anyCard.name))
              // Tous les filtres ont matchés
              && (filteredCustomFields.length === filteredCustomValidFields.length);
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
