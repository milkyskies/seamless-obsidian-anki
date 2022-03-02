export class Card {
    id: number;
    type: string;
    fields: Fields;

    constructor(id: number, type: string, fields: Fields) {
        this.id = id;
        this.type = type;
        this.fields = fields;
    }
}

interface Fields {
    [key: string]: string;
}
