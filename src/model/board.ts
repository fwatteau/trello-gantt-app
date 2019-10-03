import {Member} from "./member";
import {Card} from "./card";
import {List} from "./list";
import { Label } from "./label";

export class Board {
  id: string;
  dateLastActivity: Date;
  name: string;
  members: Member[];
  url: string;
  cards: Card[];
  customFields: any[];
  lists: List[];
  labels: Label[];
}