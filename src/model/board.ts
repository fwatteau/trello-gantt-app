import {Member} from "./member";
import {Card} from "./card";
import {List} from "./list";

export class Board {
  id: string;
  dateLastActivity: Date;
  name: string;
  members: Member[];
  url: string;
  cards: Card[];
  customFields: any[];
  lists: List[];
}