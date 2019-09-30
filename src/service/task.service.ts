import {Injectable} from "@angular/core";
import {Task} from "../model/task";
import {Card} from "../model/card";
import * as moment from 'moment';
import {Moment} from "moment";
import {BoardConfigurationService} from "./board.configuration.service";
import {List} from "../model/list";
import {GanttConfiguration} from "../model/gantt.configuration";

@Injectable()
export class TaskService {
    constructor() {

    }

  /**
   * Récupération des taches pour alimenter le diagramme
   *
   * @param {Card[]} cards
   * @returns {Promise<Task[]>}
   */
    get(cards: Card[], conf: BoardConfigurationService, gantConf: GanttConfiguration): Promise<Task[]>{
      const myTasks: Task[] = [];
      let listToDisplay: string[] = [];

      cards.forEach((card) => {
        let startDate: Moment;
        let startDateItem:any;
        let endDateItem:any;
        let endDate: Moment;
        let deadlineDateItem:any;
        let deadlineDate: Moment;

        // On récupére la date d'echeance si elle existe
        if (conf.setting.fieldDeadlineDate) {
          deadlineDateItem = card.customFieldItems
            .filter((field) => {
              return field.idCustomField === conf.setting.fieldDeadlineDate;
            })
            .pop();

          if (deadlineDateItem && deadlineDateItem.value.date) {
            deadlineDate = moment(deadlineDateItem.value.date);
          }
        } else {
          if (card.due) deadlineDate = moment(card.due);
        }

        // On récupére la date de fin si elle existe
        if (conf.setting.fieldEndDate) {
          endDateItem = card.customFieldItems
            .filter((field) => {
              return field.idCustomField === conf.setting.fieldEndDate;
            })
            .pop();
        }

        if (endDateItem && endDateItem.value.date) {
          endDate = moment(endDateItem.value.date);
        }

        // On récupére la date de début si elle existe
        if (conf.setting.fieldStartDate) {
          startDateItem = card.customFieldItems
            .filter((field) => {
              return field.idCustomField === conf.setting.fieldStartDate;
            })
            .pop();
        }

        if (startDateItem && startDateItem.value.date) {
          startDate = moment(startDateItem.value.date);
        }

        // Aucune des 2 dates renseignées
        if (endDate == null && startDate == null) {
          if (card.due) {
            startDate = moment(card.due);
            endDate = startDate.clone();
            if (conf.setting.duration)
              endDate = endDate.add(conf.setting.duration - 1, 'd');
          } else if (conf.setting.delay) {
            startDate = moment().add(conf.setting.delay, 'd');
            endDate = moment().add(conf.setting.delay + conf.setting.duration - 1, 'd');
          }
        } else {
          // Si pas de date de fin ou pas de date début, on s'appuie sur la durée
          if (endDate == null) {
            if (card.due) {
              endDate = moment(card.due);
            } else {
              endDate = moment(startDate.toDate()).add(conf.setting.duration - 1, 'd');
            }
          } else if (startDate == null) {
            if (card.due) {
              startDate = moment(card.due);
            } else {
              startDate = moment(endDate.toDate()).add(conf.setting.duration + 1, 'd');
            }
          }
        }

        if (endDate && startDate) {
          // Initialisation des heures / minutes / secondes pour raisonner en jour plein
          startDate.hour(1).minute(0).second(0);
          endDate.hour(1).minute(0).second(0).add(1, 'd');

          const list: List = conf.board.lists.filter(list => list.id === card.idList).pop();

          // Création de la tâche
          const t = new Task();
          t.id = card.id;
          t.text = card.name;
          t.descr = card.desc;
          t.start_date = startDate.toISOString();
          t.end_date = endDate.toISOString();
          if (deadlineDate) {
            t.deadline = deadlineDate.toISOString();
            if (deadlineDate.isSameOrAfter(startDate)
                  && deadlineDate.isSameOrBefore(endDate)) {
                    const dd = moment.duration(deadlineDate.diff(startDate));
                    const ed = moment.duration(endDate.diff(startDate));
                    t.progress = dd.asDays() / ed.asDays();
            } else if (deadlineDate.isSameOrAfter(startDate)) {
              t.progress = 1;
            } else {
              t.progress = 0;
            }
          }
          if (list)
            t.listName = list.name;
          if (card.labels && card.labels[0]) {
            t.color = card.labels[0].color;
          }
          if (card.stickers.length) {
            t.stickers = card.stickers.map(s => s.imageUrl);
          }
          t.marker = conf.setting.markerLists[card.idList];
          t.url = card.url;
          if (gantConf.group_list) {
            t.parent = card.idList;
            listToDisplay.push(card.idList);
          }

          myTasks.push(t);
        }
      });

      // On groupe par liste
      listToDisplay.forEach(idList => {
        const list = conf.board.lists.filter(l => l.id === idList).pop();
        const t = new Task();
        t.id = list.id;
        t.text = list.name;
        t.descr = "";
        /*t.start_date = startDate.toISOString();
        t.end_date = endDate.toISOString();*/
        t.progress = 0;
        t.marker = conf.setting.markerLists[list.id];
        t.type = "parent";

        myTasks.push(t);
      });

      return Promise.resolve(myTasks);
    }
}