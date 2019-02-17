import {Member} from "./member";

export class Board {
  id: string;
  dateLastActivity: Date;
  name: string;
  members: Member[];
  url: string;
}