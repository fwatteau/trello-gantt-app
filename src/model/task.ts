export class Task {
  id: string;
  start_date: string;
  end_date: string;
  text: string;
  progress: number;
  duration: number;
  parent: number;
  color: string;
  marker: boolean;
}