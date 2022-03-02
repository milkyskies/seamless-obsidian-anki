export class Block {
    id: number;
    line: number;
    properties: any;

    constructor(id: number, line: number) {
        this.id = id;
        this.line = line;
    }
}