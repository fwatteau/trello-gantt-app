import {Injectable} from "@angular/core";
import {Task} from "../model/task";
import {Card} from "../model/card";
import * as moment from 'moment';
import {Moment} from "moment";
import {BoardConfigurationService} from "./board.configuration.service";
import {List} from "../model/list";
import {GanttConfiguration} from "../model/gantt.configuration";
import { Marker } from "src/model/marker";

var numeral = require('numeral');

@Injectable()
export class TaskService {
    constructor() {
      // load a locale
      numeral.register('locale', 'fr', {
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal : function (number) {
            return number === 1 ? 'er' : 'ème';
        },
        currency: {
            symbol: '€'
        }
      });

      // switch between locales
      numeral.locale('fr');
    }

  /**
   * Récupération des taches pour alimenter le diagramme
   *
   * @param {Card[]} cards
   * @returns {Promise<Task[]>}
   */
    getTasks(cards: Card[], conf: BoardConfigurationService, gantConf: GanttConfiguration): Promise<Task[]>{
      const myTasks: Task[] = [];
      let listToDisplay: any[] = [];

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
          // Gestion de la date d'échéance
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
          // Ajout des champs supplémentaires
          card.customFieldItems.forEach(c => {
            if (c.idValue) {
              const option = conf.board.customFields.filter(cf => cf.id === c.idCustomField).map(cf => cf.options.filter(o => o.id === c.idValue).pop()).pop();
              t[c.idCustomField] = option ? option.value.text : c.idCustomField;
            } else if (!c.value) {
              return;
            } else if (c.value.date) {
              t[c.idCustomField] = moment(c.value.date).format('DD/MM/YYYY');
            } else if (c.value.text) {
              t[c.idCustomField] = c.value.text;
            } else if (c.value.number) {
              t[c.idCustomField] = numeral(c.value.number).format('0,0');
            } else if (c.value.checked) {
              t[c.idCustomField] = '✔';
            }
          });
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

          // On vérifie s'il faut regrouper les cartes
          if (gantConf.group_by) {
            let parent = card[gantConf.group_by];
            // Recherche du libelle pour les listes
            if (gantConf.group_by === 'idList') {
              parent = conf.board.lists.filter(l => l.id === parent).pop();
            }

            if (Array.isArray(parent)) {
              parent.forEach(p => {
                t.parent = p.id;
                listToDisplay.push(p);
                myTasks.push(t);  
              });
            } else if (parent) {
              t.parent = parent.id;
              listToDisplay.push(parent);
              myTasks.push(t);
            } else {
              parent = {id : 'orphelin', name: 'Sans parent'};
              t.parent = parent.id;
              listToDisplay.push(parent);
              myTasks.push(t);
            }
          } else {
            myTasks.push(t);
          }
        }
      });

      // On trie les tâches par ordre alphabétique
      const tasks = myTasks.sort((a, b) => a.text.localeCompare(b.text));

      // On affiche les groupements
      listToDisplay
        // Les listes sont ordonnées par position, les autres par ordre alphabétique
        .sort((a, b) => a.pos && b.pos ? a.pos > b.pos : a.name.localeCompare(b.name))
        .forEach(list => {
          const t = new Task();
          t.id = list.id;
          t.text = list.name;
          t.descr = "";
          t.progress = 0;
          t.color = list.color;
          // Arbre ouvert / ferme
          t["$open"] = gantConf.expand;
          // t.marker = conf.setting.markerLists[list.id];
          t.type = "parent";

          myTasks.push(t);
      });

      return Promise.resolve(tasks);
    }

    getMarkers(cards: Card[], conf: BoardConfigurationService, gantConf: GanttConfiguration): Promise<Marker[]>{
      let markers: Marker[] = [];

      // On récupére l'id correspondant à la liste des jalons
      if (conf.setting.fieldMarker) {
        markers = markers.concat(
          cards
            .filter(c => c.idList === conf.setting.fieldMarker)
            .map(c => {
              const m = new Marker();
              m.start_date = c.due ?  moment(c.due).toDate() : new Date();
              m.text = c.name;
              m.title = c.desc ? c.desc : c.name;
              m.css = 'marker';
              return m;
            }));
      }
        
      return Promise.resolve(markers);
    }
}