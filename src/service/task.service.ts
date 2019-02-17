import {Injectable} from "@angular/core";
import {Task} from "../model/task";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class TaskService {
    constructor(public http: HttpClient) {

    }

    get(cards: any[]): Promise<Task[]>{
        const myTasks: Task[] = [];
        cards.forEach((card) => {
            const t = new Task();
            t.id = card.id;
            t.text = card.name;
            t.start_date = "15-04-2017 00:00";
            t.progress = 0.2;
            if (card.labels && card.labels[0]) {
                t.color = card.labels[0].color;
            }

            myTasks.push(t);
        })

        return Promise.resolve(myTasks);
    }
}