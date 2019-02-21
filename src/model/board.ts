import {Member} from "./member";
import {Card} from "./card";

export class Board {
  id: string;
  dateLastActivity: Date;
  name: string;
  members: Member[];
  url: string;
  cards: Card[];
  customFields: any[];
}