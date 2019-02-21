import {Member} from "./member";
import {Board} from "./board";

export class BoardConfiguration {
  board: Board;
  memberFiltered: Member;
  field_start_date: string;
  field_end_date: string = "due";
  markerLists: any = {};
}