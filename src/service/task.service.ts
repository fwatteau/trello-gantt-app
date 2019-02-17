import {Injectable} from "@angular/core";
import {Task} from "../model/task";
import {Card} from "../model/card";

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
    get(cards: Card[]): Promise<Task[]>{
      const myTasks: Task[] = [];
      cards.forEach((card) => {
        let startDate: Date;
        let endDate = new Date(card.due);
        let users = false;

        // On récupére la date de début si elle existe
        const startDateItem = card.customFieldItems
            .filter((field) => {
              return field.idCustomField = "5c694ddcb1d8353e838dfc34";
            })
            .pop();

        if (startDateItem) {
          startDate = new Date(startDateItem.value.date);
        } else {
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 5);
        }

        // On récupère la liste des membres
        // TODO

        // Création de la tâche
        const t = new Task();
        t.id = card.id;
        t.text = card.name;
        t.start_date = startDate.toLocaleDateString("fr-FR"); // new Date(card.due).toLocaleDateString("fr-FR");
        t.end_date = endDate.toLocaleDateString("fr-FR");
        t.progress = 1;
        if (card.labels && card.labels[0]) {
            t.color = card.labels[0].color;
        }
        t.marker = (card.idList == "5c693b018630e18cca1b075b");
        t.url = card.url;

        myTasks.push(t);
      });

      return Promise.resolve(myTasks);
    }
}