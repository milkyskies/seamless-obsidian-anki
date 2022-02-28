export abstract class Card {
    id: number;
    line: number;

    constructor(id: number, line: number) {
        this.id = id;
        this.line = line;
    }
}