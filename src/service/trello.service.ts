import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/index";
import {Board} from "../model/board";
import {Card} from "../model/card";
import {environment} from "../environments/environment";

@Injectable()
export class TrelloService {
    private token: string;
    private key = environment.API_KEY;

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
        const path = `https://api.trello.com/1/member/me/boards?members=all&key=${this.key}&token=${this.token}`;
        return this.http.get<Board[]>(path);
    }

    /**
     * Récupération des cartes du tableau passé en paramètre
     *
     * @param {string} boardId
     * @returns {Observable<any>}
     */
    getBoard(boardId: string): Observable<Board> {
      const pathBoard = `https://api.trello.com/1/boards/${boardId}?customFields=true&members=all&lists=open&key=${this.key}&token=${this.token}`;

      return this.http.get<Board>(pathBoard);
    }

    /**
    * Récupération des cartes du tableau passé en paramètre
    *
    * @param {string} boardId
    * @returns {Observable<any>}
    */
    getCards(boardId: string): Observable<Card[]> {
        const pathCards = `https://api.trello.com/1/boards/${boardId}/cards?customFieldItems=true&stickers=true&key=${this.key}&token=${this.token}`;

        return this.http.get<Card[]>(pathCards);
    }
}