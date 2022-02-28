import { Card } from 'src/entities/card';

export class BasicCard extends Card {
    front: string;
    back: string;

    constructor(id: number, line: number, front: string, back: string) {
        super(id, line);
        this.front = front;
        this.back = back;

        //console.log(this.front);
        //console.log(this.back);
    }

} 