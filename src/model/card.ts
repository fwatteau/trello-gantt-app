import {List} from "./list";

export class Card {
  id: string;
  idBoard: string;
  idList: string;
  due: string;
  name: string;
  labels: any[];
  desc: string;
  idMembers: string[];
  customFieldItems: any[];
  stickers: any[];
  url: string;
}