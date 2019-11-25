export class Task {
  id: string;
  type: string = "task";
  start_date: string;
  end_date: string;
  due_date: string;
  deadline: string;
  text: string;
  listName: string;
  descr: string;
  progress: number;
  duration: number;
  parent: string;
  color: string;
  className: string;
  marker: boolean;
  stickers: string[] = [];
  url: string;
  pos: number;
}
