import {Injectable} from "@angular/core";
import {Task} from "../model/task";
import {Card} from "../model/card";
import * as moment from 'moment';
import {Moment} from "moment";
import {BoardConfigurationService} from "./board.configuration.service";

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
    get(cards: Card[], conf: BoardConfigurationService): Promise<Task[]>{
      const myTasks: Task[] = [];

      cards.forEach((card) => {
        let startDate: Moment;
        let startDateItem:any;
        let endDateItem:any;
        let endDate: Moment;

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

          // Création de la tâche
          const t = new Task();
          t.id = card.id;
          t.text = card.name;
          t.descr = card.desc;
          t.start_date = startDate.toISOString();
          t.end_date = endDate.toISOString();
          t.progress = 1;
          if (card.labels && card.labels[0]) {
            t.color = card.labels[0].color;
          }
          if (card.stickers.length) {
            t.stickers = card.stickers.map(s => s.imageUrl);
          }
          t.marker = conf.setting.markerLists[card.idList];
          t.url = card.url;

          myTasks.push(t);
        }
      });

      return Promise.resolve(myTasks);
    }
}