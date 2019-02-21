import {Injectable} from "@angular/core";
import {Task} from "../model/task";
import {Card} from "../model/card";
import {BoardConfiguration} from "../model/boardConfiguration";

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
    get(cards: Card[], conf: BoardConfiguration): Promise<Task[]>{
      const myTasks: Task[] = [];
      cards.forEach((card) => {
        let startDate: Date = new Date(card.due);
        let startDateItem:any = null;
        let endDateItem:any = null;
        let endDate: Date = new Date(card.due);

        // On récupére la date de fin si elle existe
        if (conf.field_start_date) {
          endDateItem = card.customFieldItems
            .filter((field) => {
              return field.idCustomField === conf.field_end_date;
            })
            .pop();
        }

        if (endDateItem) {
          endDate = new Date(endDateItem.value.date);
        }
        endDate.setHours(24);

        // On récupére la date de début si elle existe
        if (conf.field_start_date) {
          startDateItem = card.customFieldItems
            .filter((field) => {
              return field.idCustomField === conf.field_start_date;
            })
            .pop();
        }

        if (startDateItem) {
          startDate = new Date(startDateItem.value.date);
        }

        // Création de la tâche
        const t = new Task();
        t.id = card.id;
        t.text = card.name;
        t.descr = card.desc;
        t.start_date = startDate.toLocaleDateString("fr-FR"); // new Date(card.due).toLocaleDateString("fr-FR");
        t.end_date = endDate.toLocaleDateString("fr-FR");
        t.progress = 1;
        if (card.labels && card.labels[0]) {
            t.color = card.labels[0].color;
        }
        t.marker = conf.markerLists[card.idList];
        t.url = card.url;

        myTasks.push(t);
      });

      return Promise.resolve(myTasks);
    }
}