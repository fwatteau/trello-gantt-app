import { Field } from "./field";

export class SettingConfiguration {
  color: string;
  fieldStartDate: string;
  fieldEndDate: string;
  fieldDeadlineDate: string;
  fieldMarker: string;
  columns: Field[] = [];
  markerLists: any = {};
  duration: number = 1;
  delay: number = 0;
  sort_field: string;
  sort_direction: boolean;
}