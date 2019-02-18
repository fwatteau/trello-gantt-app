import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {from, Observable, of} from "rxjs/index";
import {Board} from "../model/board";
import {Card} from "../model/card";
import {isArray} from "rxjs/internal/util/isArray";
import {concat} from 'rxjs';
import {concatMap} from "rxjs/internal/operators";


@Injectable()
export class TrelloService {
    private token: string;
    private key = '08c1c082c7cb12602cdccdbc55428bad';

    constructor(public http: HttpClient) {

    }

    /**
     * Authentification avec Trello
     */
    authorize() {
        window['Trello'].authorize({
            type: 'redirect',
            name: 'Gantt App',
            scope: {
                read: 'true',
                write: 'false'
            },
            expiration: 'never',
            success: () => {
                this.token = window['Trello'].token();
            },
            error: () => {
                console.log("ça pue !");
            },
        });
    }

    /**
     * Récupération des tableaux de l'utilisateur connecté
     *
     * @returns {Observable<any>}
     */
    getBoards(): Observable<Board[]> {
        const path = `https://api.trello.com/1//member/me/boards?members=all&key=${this.key}&token=${this.token}`;
        return this.http.get<Board[]>(path);
    }

    /**
     * Récupération des cartes du tableau passé en paramètre
     *
     * @param {string} boardId
     * @returns {Observable<any>}
     */
    getCards(boardId: string|string[]): Observable<Card[]> {
      if (!isArray(boardId)) {
        boardId = [boardId];
      }

      return from(boardId).pipe(
        concatMap(id => {
          const path = `https://api.trello.com/1/boards/${id}/cards?customFieldItems=true&key=${this.key}&token=${this.token}`;
          return this.http.get<Card[]>(path);
        })
      );
    }
}