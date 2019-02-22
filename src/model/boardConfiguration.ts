import {Board} from "./board";
import {FilterConfiguration} from "./filterConfiguration";

export class BoardConfiguration {
  board: Board;
  filter: FilterConfiguration = new FilterConfiguration();
  field_start_date: string;
  field_end_date: string = "due";
  markerLists: any = {};
}