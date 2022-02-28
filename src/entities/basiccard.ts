import { Card } from 'src/entities/card';

export class BasicCard extends Card {
    front: string;
    back: string;

    constructor(id: number, front: string, back: string) {
        super(id);
        this.front = front;
        this.back = back;

        console.log(this.front);
        console.log(this.back);
    }

} 