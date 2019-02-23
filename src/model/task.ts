export class Task {
  id: string;
  start_date: string;
  end_date: string;
  text: string;
  descr: string;
  progress: number;
  duration: number;
  parent: number;
  color: string;
  marker: boolean;
  stickers: string[] = [];
  url: string;
}