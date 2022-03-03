export class Card {
    id: number;
    type: string;
    fields: Fields = {};

    constructor(id: number, type: string) {
        this.id = id;
        this.type = type;
        //this.fields = fields;
    }
}

interface Fields extends Object {
    [key: string]: unknown;
}
