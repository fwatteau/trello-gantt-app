export class GanttConfiguration {
  xml_date: string = "%Y-%m-%d";
  start_date: string;
  end_date: string;
  scale_unit: string = "week";
  date_scale: string = "%d %M";
  readonly: boolean = true;
  date_grid: string = "%d %M %Y";
  group_list: boolean = true;
  group_by: string;
  expand: boolean;
  openurl: boolean = true;
  autofit: boolean = true;
}